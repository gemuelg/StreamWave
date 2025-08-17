// src/app/page.tsx
import {
  getTrendingMovies,
  getNowPlayingMovies,
  getTrendingTVShows,
  getOnTheAirTVShows,
} from '@/lib/tmdb';
import HomeContent from '@/components/HomeContent';

export default async function HomePage() {
  const [
    trendingMovies,
    nowPlayingMovies,
    trendingTVShows,
    onTheAirTVShows,
  ] = await Promise.all([
    getTrendingMovies(),
    getNowPlayingMovies(),
    getTrendingTVShows(),
    getOnTheAirTVShows(),
  ]);

  return (
    <HomeContent
      trendingMovies={trendingMovies}
      nowPlayingMovies={nowPlayingMovies}
      trendingTVShows={trendingTVShows}
      onTheAirTVShows={onTheAirTVShows}
    />
  );
}