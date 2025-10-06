import {
  getTrendingMovies,
  getNowPlayingMovies,
  getTrendingTVShows,
  getOnTheAirTVShows,
  discoverContent,
  getMovieGenres,
  getTVShowGenres,
  WATCH_PROVIDER_IDS,
  Genre,
  Movie,
  TVShow,
} from '@/lib/tmdb';
import HomeContent from '@/components/HomeContent';
import { redirect } from 'next/navigation';
import axios from 'axios';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// Interfaces for data fetching
interface TMDBMedia {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  media_type: 'movie' | 'tv';
  overview: string;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  release_date?: string;
  first_air_date?: string;
}

// Interface for user interests from Supabase
interface UserInterest {
  interest_id: number;
  interest_type: 'genre' | 'movie' | 'tv';
}

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

const filterReleasedContent = <T extends Movie | TVShow>(content: T[]): T[] => {
  const today = new Date();
  return content.filter(item => {
    if ('release_date' in item) {
      return new Date(item.release_date) <= today;
    }
    if ('first_air_date' in item) {
      return new Date(item.first_air_date) <= today;
    }
    return true;
  }) as T[];
};

const fetchPersonalizedContent = async (supabase: any, user: any) => {
  if (!user) {
    console.log("No user found. Skipping personalized content fetch.");
    return { forYouMedia: [], onboardingComplete: false };
  }

  const { data: interests, error } = await supabase
    .from('user_interests')
    .select('interest_id, interest_type')
    .eq('user_id', user.id);

  if (error) {
    console.error("Supabase query failed to fetch user interests:", error);
    return { forYouMedia: [], onboardingComplete: false };
  }

  if (!interests || interests.length === 0) {
    console.log("No user interests found in the database. Onboarding may not be complete.");
    return { forYouMedia: [], onboardingComplete: false };
  }

  console.log("Successfully fetched user interests:", interests);

  // Type the interests array to resolve TypeScript errors
  const typedInterests: UserInterest[] = interests;

  const genreIds = typedInterests
    .filter(item => item.interest_type === 'genre')
    .map(item => item.interest_id);
  
  const specificTitles = typedInterests
    .filter(item => item.interest_type === 'movie' || item.interest_type === 'tv');
  
  let allRecommendations: TMDBMedia[] = [];

  try {
    if (genreIds.length > 0) {
      console.log("Fetching genre recommendations for IDs:", genreIds);
      const res = await axios.get(
        `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreIds.join(',')}&sort_by=popularity.desc&vote_count.gte=20`
      );
      const genreRecommendations = res.data.results.map((item: any) => ({ ...item, media_type: 'movie' }));
      allRecommendations.push(...genreRecommendations);
      console.log(`Found ${genreRecommendations.length} genre-based recommendations.`);
    }

    if (specificTitles.length > 0) {
      console.log("Fetching recommendations for specific titles:", specificTitles);
      const titlePromises = specificTitles.map(async (item) => {
        const res = await axios.get(
          `https://api.themoviedb.org/3/${item.interest_type}/${item.interest_id}/recommendations?api_key=${TMDB_API_KEY}`
        );
        // Explicitly type the result of the map function
        return res.data.results.map((rec: TMDBMedia) => ({ ...rec, media_type: item.interest_type }));
      });
      const titleRecommendations = (await Promise.all(titlePromises)).flat();
      allRecommendations.push(...titleRecommendations);
      console.log(`Found ${titleRecommendations.length} title-based recommendations.`);
    }

    const uniqueRecommendations = Array.from(new Map(allRecommendations.map((item: TMDBMedia) => [item.id, item])).values());
    
    const validRecommendations: (Movie | TVShow)[] = uniqueRecommendations.filter(item => {
      return item.poster_path && (item.title || item.name);
    }) as (Movie | TVShow)[];
    
    // LIMIT THE RECOMMENDATIONS TO 20
    const limitedRecommendations = validRecommendations.slice(0, 20);

    console.log("Final number of personalized recommendations found:", limitedRecommendations.length);

    return {
      forYouMedia: limitedRecommendations,
      onboardingComplete: true
    };

  } catch (err) {
    console.error("Failed to fetch personalized recommendations from TMDB:", err);
    return {
      forYouMedia: [],
      onboardingComplete: true
    };
  }
};

export default async function HomePage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  console.log("Current user:", user);

  if (user) {
    const { forYouMedia, onboardingComplete } = await fetchPersonalizedContent(supabase, user);
    if (!onboardingComplete) {
      redirect('/onboarding/step1');
    }
    const [
      trendingMoviesData,
      nowPlayingMoviesData,
      trendingTVShowsData,
      onTheAirTVShowsData,
      movieGenresData,
      tvGenresData,
      netflixMoviesData,
      disneyPlusMoviesData,
      amazonPrimeMoviesData,
      hboMaxMoviesData,
      huluMoviesData,
      huluLatestTVShowsData,
      amazonLatestTVShowsData,
      hboLatestTVShowsData,
      netflixLatestTVShowsData,
      disneyPlusTVShowsData,
    ] = await Promise.all([
      getTrendingMovies(),
      getNowPlayingMovies(),
      getTrendingTVShows(),
      getOnTheAirTVShows(),
      getMovieGenres(),
      getTVShowGenres(),
      discoverContent<Movie>('movie', 1, [WATCH_PROVIDER_IDS.NETFLIX], 'release_date.desc'),
      discoverContent<Movie>('movie', 1, [WATCH_PROVIDER_IDS.DISNEY_PLUS], 'release_date.desc'),
      discoverContent<Movie>('movie', 1, [WATCH_PROVIDER_IDS.AMAZON_PRIME_VIDEO], 'release_date.desc'),
      discoverContent<Movie>('movie', 1, [WATCH_PROVIDER_IDS.MAX], 'release_date.desc'),
      discoverContent<Movie>('movie', 1, [WATCH_PROVIDER_IDS.HULU], 'release_date.desc'),
      discoverContent<TVShow>('tv', 1, [WATCH_PROVIDER_IDS.HULU], 'first_air_date.desc'),
      discoverContent<TVShow>('tv', 1, [WATCH_PROVIDER_IDS.AMAZON_PRIME_VIDEO], 'first_air_date.desc'),
      discoverContent<TVShow>('tv', 1, [WATCH_PROVIDER_IDS.MAX], 'first_air_date.desc'),
      discoverContent<TVShow>('tv', 1, [WATCH_PROVIDER_IDS.NETFLIX], 'first_air_date.desc'),
      discoverContent<TVShow>('tv', 1, [WATCH_PROVIDER_IDS.DISNEY_PLUS], 'first_air_date.desc'),
    ]);

    const [
      huluPopular,
      amazonPopular,
      hboPopular,
      netflixPopular,
    ] = await Promise.all([
      huluLatestTVShowsData?.results.length === 0 ? discoverContent<TVShow>('tv', 1, [WATCH_PROVIDER_IDS.HULU], 'popularity.desc') : Promise.resolve(null),
      amazonLatestTVShowsData?.results.length === 0 ? discoverContent<TVShow>('tv', 1, [WATCH_PROVIDER_IDS.AMAZON_PRIME_VIDEO], 'popularity.desc') : Promise.resolve(null),
      hboLatestTVShowsData?.results.length === 0 ? discoverContent<TVShow>('tv', 1, [WATCH_PROVIDER_IDS.MAX], 'popularity.desc') : Promise.resolve(null),
      netflixLatestTVShowsData?.results.length === 0 ? discoverContent<TVShow>('tv', 1, [WATCH_PROVIDER_IDS.NETFLIX], 'popularity.desc') : Promise.resolve(null),
    ]);
    
    const finalHuluTVShows = huluLatestTVShowsData?.results.length ? huluLatestTVShowsData : huluPopular;
    const finalAmazonTVShows = amazonLatestTVShowsData?.results.length ? amazonLatestTVShowsData : amazonPopular;
    const finalHboTVShows = hboLatestTVShowsData?.results.length ? hboLatestTVShowsData : hboPopular;
    const finalNetflixTVShows = netflixLatestTVShowsData?.results.length ? netflixLatestTVShowsData : netflixPopular;

    const allGenres: Genre[] = [...(movieGenresData || []), ...(tvGenresData || [])];

    return (
      <HomeContent
        trendingMovies={filterReleasedContent(trendingMoviesData?.results || [])}
        nowPlayingMovies={filterReleasedContent(nowPlayingMoviesData?.results || [])}
        trendingTVShows={filterReleasedContent(trendingTVShowsData?.results || [])}
        onTheAirTVShows={filterReleasedContent(onTheAirTVShowsData?.results || [])}
        genres={allGenres}
        netflixMovies={filterReleasedContent(netflixMoviesData?.results || [])}
        huluTVShows={filterReleasedContent(finalHuluTVShows?.results || [])}
        disneyPlusMovies={filterReleasedContent(disneyPlusMoviesData?.results || [])}
        amazonPrimeMovies={filterReleasedContent(amazonPrimeMoviesData?.results || [])}
        hboMaxMovies={filterReleasedContent(hboMaxMoviesData?.results || [])}
        amazonPrimeTVShows={filterReleasedContent(finalAmazonTVShows?.results || [])}
        hboMaxTVShows={filterReleasedContent(finalHboTVShows?.results || [])}
        netflixTVShows={filterReleasedContent(finalNetflixTVShows?.results || [])}
        huluMovies={filterReleasedContent(huluMoviesData?.results || [])}
        disneyPlusTVShows={filterReleasedContent(disneyPlusTVShowsData?.results || [])}
        forYouMedia={forYouMedia as (Movie | TVShow)[]}
      />
    );
  }

  // If no user is logged in, fetch only public content
  const [
    trendingMoviesData,
    nowPlayingMoviesData,
    trendingTVShowsData,
    onTheAirTVShowsData,
    movieGenresData,
    tvGenresData,
    netflixMoviesData,
    disneyPlusMoviesData,
    amazonPrimeMoviesData,
    hboMaxMoviesData,
    huluMoviesData,
    huluLatestTVShowsData,
    amazonLatestTVShowsData,
    hboLatestTVShowsData,
    netflixLatestTVShowsData,
    disneyPlusTVShowsData,
  ] = await Promise.all([
    getTrendingMovies(),
    getNowPlayingMovies(),
    getTrendingTVShows(),
    getOnTheAirTVShows(),
    getMovieGenres(),
    getTVShowGenres(),
    discoverContent<Movie>('movie', 1, [WATCH_PROVIDER_IDS.NETFLIX], 'release_date.desc'),
    discoverContent<Movie>('movie', 1, [WATCH_PROVIDER_IDS.DISNEY_PLUS], 'release_date.desc'),
    discoverContent<Movie>('movie', 1, [WATCH_PROVIDER_IDS.AMAZON_PRIME_VIDEO], 'release_date.desc'),
    discoverContent<Movie>('movie', 1, [WATCH_PROVIDER_IDS.MAX], 'release_date.desc'),
    discoverContent<Movie>('movie', 1, [WATCH_PROVIDER_IDS.HULU], 'release_date.desc'),
    discoverContent<TVShow>('tv', 1, [WATCH_PROVIDER_IDS.HULU], 'first_air_date.desc'),
    discoverContent<TVShow>('tv', 1, [WATCH_PROVIDER_IDS.AMAZON_PRIME_VIDEO], 'first_air_date.desc'),
    discoverContent<TVShow>('tv', 1, [WATCH_PROVIDER_IDS.MAX], 'first_air_date.desc'),
    discoverContent<TVShow>('tv', 1, [WATCH_PROVIDER_IDS.NETFLIX], 'first_air_date.desc'),
    discoverContent<TVShow>('tv', 1, [WATCH_PROVIDER_IDS.DISNEY_PLUS], 'first_air_date.desc'),
  ]);

  const [
    huluPopular,
    amazonPopular,
    hboPopular,
    netflixPopular,
  ] = await Promise.all([
    huluLatestTVShowsData?.results.length === 0 ? discoverContent<TVShow>('tv', 1, [WATCH_PROVIDER_IDS.HULU], 'popularity.desc') : Promise.resolve(null),
    amazonLatestTVShowsData?.results.length === 0 ? discoverContent<TVShow>('tv', 1, [WATCH_PROVIDER_IDS.AMAZON_PRIME_VIDEO], 'popularity.desc') : Promise.resolve(null),
    hboLatestTVShowsData?.results.length === 0 ? discoverContent<TVShow>('tv', 1, [WATCH_PROVIDER_IDS.MAX], 'popularity.desc') : Promise.resolve(null),
    netflixLatestTVShowsData?.results.length === 0 ? discoverContent<TVShow>('tv', 1, [WATCH_PROVIDER_IDS.NETFLIX], 'popularity.desc') : Promise.resolve(null),
  ]);
  
  const finalHuluTVShows = huluLatestTVShowsData?.results.length ? huluLatestTVShowsData : huluPopular;
  const finalAmazonTVShows = amazonLatestTVShowsData?.results.length ? amazonLatestTVShowsData : amazonPopular;
  const finalHboTVShows = hboLatestTVShowsData?.results.length ? hboLatestTVShowsData : hboPopular;
  const finalNetflixTVShows = netflixLatestTVShowsData?.results.length ? netflixLatestTVShowsData : netflixPopular;

  const allGenres: Genre[] = [...(movieGenresData || []), ...(tvGenresData || [])];

  return (
    <HomeContent
      trendingMovies={filterReleasedContent(trendingMoviesData?.results || [])}
      nowPlayingMovies={filterReleasedContent(nowPlayingMoviesData?.results || [])}
      trendingTVShows={filterReleasedContent(trendingTVShowsData?.results || [])}
      onTheAirTVShows={filterReleasedContent(onTheAirTVShowsData?.results || [])}
      genres={allGenres}
      netflixMovies={filterReleasedContent(netflixMoviesData?.results || [])}
      huluTVShows={filterReleasedContent(finalHuluTVShows?.results || [])}
      disneyPlusMovies={filterReleasedContent(disneyPlusMoviesData?.results || [])}
      amazonPrimeMovies={filterReleasedContent(amazonPrimeMoviesData?.results || [])}
      hboMaxMovies={filterReleasedContent(hboMaxMoviesData?.results || [])}
      amazonPrimeTVShows={filterReleasedContent(finalAmazonTVShows?.results || [])}
      hboMaxTVShows={filterReleasedContent(finalHboTVShows?.results || [])}
      netflixTVShows={filterReleasedContent(finalNetflixTVShows?.results || [])}
      huluMovies={filterReleasedContent(huluMoviesData?.results || [])}
      disneyPlusTVShows={filterReleasedContent(disneyPlusTVShowsData?.results || [])}
      forYouMedia={[] as (Movie | TVShow)[]} // No personalized data for public users
    />
  );
}