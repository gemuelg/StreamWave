// src/lib/tmdb.ts

// 🔒 SECURE SERVER-SIDE VARIABLES (No NEXT_PUBLIC_)
const IS_SERVER = typeof window === 'undefined';
const API_KEY = process.env.TMDB_API_KEY;
const ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN;

const BASE_URL = IS_SERVER ? 'https://api.themoviedb.org/3' : '/api/tmdb';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

const YOUTUBE_EMBED_BASE_URL = 'https://www.youtube.com/embed/';
const YOUTUBE_WATCH_BASE_URL = 'https://www.youtube.com/watch?v=';

export const getImageUrl = (path: string | null, size: string = 'w500'): string => {
  if (!path) return '/no-image-placeholder.svg';
  return `${IMAGE_BASE_URL}${size}${path}`;
};

// ==========================================
// INTERFACES
// ==========================================

export interface Genre {
  id: number;
  name: string;
}

export interface TMDBListResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface ProductionCompany {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

export interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface Video {
  iso_639_1: string;
  iso_3166_1: string;
  name: string;
  key: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
  id: string;
}

export interface VideoResponse {
  id: number;
  results: Video[];
}

export interface ReleaseDate {
  certification: string;
  iso_639_1: string | null;
  release_date: string;
  type: number;
}

export interface ReleaseDateResult {
  iso_3166_1: string;
  release_dates: ReleaseDate[];
}

export interface ReleaseDatesResponse {
  id: number;
  results: ReleaseDateResult[];
}

export interface ContentRating {
  iso_3166_1: string;
  rating: string;
}

export interface ContentRatingsResponse {
  id: number;
  results: ContentRating[];
}

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  popularity: number;
  release_date: string;
  genre_ids?: number[];
  media_type?: 'movie';
}

export interface MovieDetails extends Movie {
  tagline: string | null;
  genres: Genre[];
  runtime: number | null;
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  imdb_id: string | null;
  credits?: {
    cast: CastMember[];
    crew?: CrewMember[];
  };
  videos?: VideoResponse;
  release_dates?: ReleaseDatesResponse;
}

export interface TVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  popularity: number;
  first_air_date: string;
  genre_ids?: number[];
  media_type?: 'tv';
}

export interface SeasonDetails {
  air_date: string | null;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  vote_average: number;
}

export interface TVShowDetails extends TVShow {
  tagline: string | null;
  genres: Genre[];
  episode_run_times: number[];
  number_of_seasons: number;
  number_of_episodes: number;
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  seasons: SeasonDetails[];
  imdb_id: string | null;
  credits?: {
    cast: CastMember[];
    crew?: CrewMember[];
  };
  videos?: VideoResponse;
  status: string;
  original_language: string;
  content_ratings?: ContentRatingsResponse;
}

export interface MultiSearchResultItem {
  id: number;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  popularity: number;
  media_type: 'movie' | 'tv' | 'person';
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  overview?: string;
}

export interface MultiSearchResults extends TMDBListResponse<MultiSearchResultItem> {}

// ==========================================
// CORE FUNCTIONS
// ==========================================

// src/lib/tmdb.ts

export const WATCH_PROVIDER_IDS = {
  NETFLIX: 8,
  DISNEY_PLUS: 337,
  AMAZON_PRIME_VIDEO: 9,
  MAX: 1899,
  HULU: 15, // 👈 Add this line!
};

export const getPrimaryVideoKey = (videos: VideoResponse | null): string | null => {
  if (!videos?.results) return null;
  
  const officialTrailer = videos.results.find(
    (video) => video.site === 'YouTube' && video.type === 'Trailer' && video.official
  );
  if (officialTrailer) return officialTrailer.key;
  
  const anyTrailer = videos.results.find(
    (video) => video.site === 'YouTube' && video.type === 'Trailer'
  );
  if (anyTrailer) return anyTrailer.key;
  
  const officialVideo = videos.results.find(
      (video) => video.site === 'YouTube' && video.official
  );
  if (officialVideo) return officialVideo.key;

  const anyVideo = videos.results.find(
    (video) => video.site === 'YouTube' && !!video.key
  );
  if (anyVideo) return anyVideo.key;
  
  return null;
};

export async function getTrendingMovies(): Promise<TMDBListResponse<Movie>> {
  const url = `${BASE_URL}/trending/movie/week?api_key=${API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch trending movies');
  return response.json();
}

export const getMovieDetails = async (id: number): Promise<MovieDetails | null> => {
  try {
    const response = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&append_to_response=credits,videos,release_dates`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Error fetching movie details for ID ${id}: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Failed to fetch movie details for ID ${id}:`, error);
    return null;
  }
};

export const getTVShowDetails = async (id: number): Promise<TVShowDetails | null> => {
  try {
    const response = await fetch(`${BASE_URL}/tv/${id}?api_key=${API_KEY}&append_to_response=credits,videos,content_ratings`, { next: { revalidate: 86400 } });
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Error fetching TV show details for ID ${id}: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Failed to fetch TV show details for ID ${id}:`, error);
    return null;
  }
};

export async function getNowPlayingMovies(): Promise<TMDBListResponse<Movie>> {
  try {
    const res = await fetch(`${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=en-US&page=1&include_adult=false&certification_country=US&certification.lte=R`, { next: { revalidate: 86400 } });
    if (!res.ok) throw new Error(`Failed to fetch now playing movies: ${res.statusText}`);
    return res.json();
  } catch (error) {
    console.error("Failed to fetch now playing movies:", error);
    return { page: 0, results: [], total_pages: 0, total_results: 0 };
  }
}

export async function getOnTheAirTVShows(): Promise<TMDBListResponse<TVShow>> {
  try {
    const res = await fetch(`${BASE_URL}/tv/on_the_air?api_key=${API_KEY}&language=en-US&page=1&include_adult=false`, { next: { revalidate: 86400 } });
    if (!res.ok) throw new Error(`Failed to fetch on the air TV shows: ${res.statusText}`);
    return res.json();
  } catch (error) {
    console.error("Failed to fetch on the air TV shows:", error);
    return { page: 0, results: [], total_pages: 0, total_results: 0 };
  }
}

export async function getMovieGenres(): Promise<Genre[]> {
  try {
    const res = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}`, { next: { revalidate: 604800 } });
    const data = await res.json();
    return data.genres;
  } catch (error) {
    console.error('Error fetching movie genres:', error);
    return [];
  }
}

export async function getTVShowGenres(): Promise<Genre[]> {
  try {
    const res = await fetch(`${BASE_URL}/genre/tv/list?api_key=${API_KEY}`, { next: { revalidate: 604800 } });
    const data = await res.json();
    return data.genres;
  } catch (error) {
    console.error('Error fetching TV show genres:', error);
    return [];
  }
}

const getTodayDate = (): string => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export async function getFilteredMovies(
  page: number = 1,
  genres: string = '',
  year: number | null = null,
  sortBy: string = 'popularity.desc'
): Promise<{ results: Movie[]; total_pages: number }> {
  let url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&page=${page}&sort_by=${sortBy}&include_adult=false&certification_country=US&certification.lte=R`;
  if (genres) url += `&with_genres=${genres}`;
  if (year) url += `&primary_release_year=${year}`;
  url += `&primary_release_date.lte=${getTodayDate()}`;

  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error(`Failed to fetch filtered movies: ${res.statusText}`);
  const data = await res.json();
  return { results: data.results, total_pages: data.total_pages };
}

export const getFilteredTVShows = async (
  page: number = 1,
  genres: string = '',
  year: number | null = null,
  sortBy: string = 'popularity.desc'
): Promise<TMDBListResponse<TVShow>> => {
  let url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=en-US&page=${page}&sort_by=${sortBy}&include_adult=false`;
  if (genres) url += `&with_genres=${genres}`;
  if (year) url += `&first_air_date_year=${year}`;
  url += `&first_air_date.lte=${getTodayDate()}`;

  const response = await fetch(url, { next: { revalidate: 86400 } });
  if (!response.ok) throw new Error(`Failed to fetch TV shows: ${response.statusText}`);
  return response.json();
};

export const getTVGenres = async (): Promise<Genre[]> => {
  const url = `${BASE_URL}/genre/tv/list?api_key=${API_KEY}`;
  const response = await fetch(url, { next: { revalidate: 604800 } });
  if (!response.ok) throw new Error(`Failed to fetch TV genres: ${response.statusText}`);
  const data = await response.json();
  return data.genres;
};

export async function getPopularTVShows(page: number = 1): Promise<{ results: TVShow[]; total_pages: number }> {
  const url = `${BASE_URL}/tv/popular?api_key=${API_KEY}&page=${page}&include_adult=false`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error('Failed to fetch popular TV shows');
  const data = await res.json();
  return { results: data.results, total_pages: data.total_pages };
}

export async function getPopularMovies(page: number = 1): Promise<{ results: Movie[]; total_pages: number }> {
  const url = `${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}&include_adult=false&certification_country=US&certification.lte=R`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error('Failed to fetch popular movies');
  const data = await res.json();
  return { results: data.results, total_pages: data.total_pages };
}

export async function getTrendingTVShows(): Promise<TMDBListResponse<TVShow>> {
  const url = `${BASE_URL}/trending/tv/week?api_key=${API_KEY}`;
  const response = await fetch(url, { next: { revalidate: 86400 } });
  if (!response.ok) throw new Error('Failed to fetch trending TV shows');
  return response.json();
}

export async function getMovieRecommendations(movieId: number): Promise<Movie[]> {
  try {
    const response = await fetch(`${BASE_URL}/movie/${movieId}/recommendations?api_key=${API_KEY}&language=en-US&page=1&include_adult=false`, { next: { revalidate: 86400 } });
    if (response.status === 404) {
      const popularMovies = await getPopularMovies(1);
      return popularMovies.results;
    }
    if (!response.ok) throw new Error(`Error fetching movie recommendations for ID ${movieId}: ${response.statusText}`);
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error(`Failed to fetch movie recommendations for ID ${movieId}:`, error);
    return [];
  }
}

export async function getTVShowRecommendations(tvId: number): Promise<TVShow[]> {
  try {
    const response = await fetch(`${BASE_URL}/tv/${tvId}/recommendations?api_key=${API_KEY}&language=en-US&page=1&include_adult=false`, { next: { revalidate: 86400 } });
    if (response.status === 404) {
      const popularTVShows = await getPopularTVShows(1);
      return popularTVShows.results;
    }
    if (!response.ok) throw new Error(`Error fetching TV show recommendations for ID ${tvId}: ${response.statusText}`);
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error(`Failed to fetch TV show recommendations for ID ${tvId}:`, error);
    return [];
  }
}

// ✅ FIXED: Updated to securely use top-level ACCESS_TOKEN constant
export async function searchMulti(query: string, page: number = 1): Promise<MultiSearchResults> {
  const url = `${BASE_URL}/search/multi?query=${encodeURIComponent(query)}&page=${page}&language=en-US`;
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch search results.');
    return response.json();
  } catch (error) {
    console.error("Error in searchMulti function:", error);
    throw error;
  }
}

export const getYouTubeEmbedUrl = (key: string): string => `${YOUTUBE_EMBED_BASE_URL}${key}`;
export const getYouTubeWatchUrl = (key: string): string => `${YOUTUBE_WATCH_BASE_URL}${key}`;

const HN_EMBED_BASE_URL = 'https://player.vidzee.wtf/embed';
const MULTI_EMBED_BASE_URL = 'https://chillflix.pw';
const VIDEASY_BASE_URL = 'https://vidlink.pro';
const THEME_COLOR = '8B5CF6';

export const getHnEmbedMovieUrl = (tmdbId: number): string => `${HN_EMBED_BASE_URL}/movie/${tmdbId}`;

export const getHnEmbedTvUrl = (tmdbId: number, seasonNumber?: number, episodeNumber?: number): string => {
  if (seasonNumber && episodeNumber) {
    return `${HN_EMBED_BASE_URL}/tv/${tmdbId}/${seasonNumber}/${episodeNumber}`;
  }
  return `${HN_EMBED_BASE_URL}/tv/${tmdbId}`;
};

export const getMultiEmbedMovieUrl = (tmdbId: number): string => {
  return `${MULTI_EMBED_BASE_URL}/embed/movie/${tmdbId}?autoplay=true&poster=true&title=true&watchparty=false&chromecast=true&servericon=false&setting=false&pip=true&primarycolor=6C63FF&secondarycolor=9F9BFF&iconcolor=FFFFFF&font=Roboto&fontcolor=FFFFFF&fontsize=20&opacity=0.5`;
};

export const getMultiEmbedTvUrl = (tmdbId: number, seasonNumber: number = 1, episodeNumber: number = 1): string => {
  return `${MULTI_EMBED_BASE_URL}/embed/tv/${tmdbId}/${seasonNumber}/${episodeNumber}?autoplay=true&poster=true&title=true&watchparty=false&chromecast=true&servericon=false&setting=false&pip=true&primarycolor=6C63FF&secondarycolor=9F9BFF&iconcolor=FFFFFF&font=Roboto&fontcolor=FFFFFF&fontsize=20&opacity=0.5`;
};

export const getVideasyMovieUrl = (tmdbId: number): string => {
  const params = new URLSearchParams({ color: THEME_COLOR, overlay: 'true' });
  return `${VIDEASY_BASE_URL}/movie/${tmdbId}?${params.toString()}`;
};

export const getVideasyTvUrl = (tmdbId: number, seasonNumber: number = 1, episodeNumber: number = 1): string => {
  const params = new URLSearchParams({ color: THEME_COLOR, overlay: 'true' });
  return `${VIDEASY_BASE_URL}/tv/${tmdbId}/${seasonNumber}/${episodeNumber}?${params.toString()}`;
};

// ✅ FIXED: Updated to use the top-level API_KEY constant cleanly
export async function getDiscoverMovies({
  page = 1,
  genres = null,
  year = null,
  sortBy = 'popularity.desc',
}: {
  page?: number;
  genres?: string | null;
  year?: number | null;
  sortBy?: string;
}): Promise<TMDBListResponse<Movie>> {
  const params = new URLSearchParams({
    api_key: API_KEY!,
    language: 'en-US',
    page: page.toString(),
    sort_by: sortBy,
  });

  if (genres) params.append('with_genres', genres);
  if (year) params.append('primary_release_year', year.toString());

  const url = `${BASE_URL}/discover/movie?${params.toString()}`;
  const response = await fetch(url, { next: { revalidate: 86400 } });
  if (!response.ok) throw new Error('Failed to fetch movies');
  return response.json();
}

// ✅ FIXED: Updated to use the top-level API_KEY constant cleanly
export async function getDiscoverTVShows({
  page = 1,
  genres = null,
  year = null,
  sortBy = 'popularity.desc',
}: {
  page?: number;
  genres?: string | null;
  year?: number | null;
  sortBy?: string;
}): Promise<TMDBListResponse<TVShow>> {
  const params = new URLSearchParams({
    api_key: API_KEY!,
    language: 'en-US',
    page: page.toString(),
    sort_by: sortBy,
  });

  if (genres) params.append('with_genres', genres);
  if (year) params.append('first_air_date_year', year.toString());

  const url = `${BASE_URL}/discover/tv?${params.toString()}`;
  const response = await fetch(url, { next: { revalidate: 86400 } });
  if (!response.ok) throw new Error('Failed to fetch TV shows');
  return response.json();
}

export const discoverContent = async <T extends Movie | TVShow>(
  type: 'movie' | 'tv',
  page: number = 1,
  providers: number[] = [],
  sort_by: string = 'popularity.desc'
): Promise<TMDBListResponse<T> | null> => {
  try {
    const providerList = providers.join('|');
    const url = `${BASE_URL}/discover/${type}?api_key=${API_KEY}&page=${page}&with_watch_providers=${providerList}&watch_region=US&sort_by=${sort_by}`;
    
    const response = await fetch(url, { next: { revalidate: 86400 } });
    if (!response.ok) throw new Error(`Failed to fetch ${type} content`);
    return response.json();
  } catch (error) {
    console.error(`Error fetching discovered ${type} content:`, error);
    return null;
  }
};