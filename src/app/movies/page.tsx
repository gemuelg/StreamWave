// src/app/movies/page.tsx
import MoviesContent from './MoviesContent';
import { getFilteredMovies, getMovieGenres } from '@/lib/tmdb';
import { notFound } from 'next/navigation';

export default async function MoviesPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    genres?: string;
    year?: string;
    sort_by?: string;
  };
}) {
  const currentPage = parseInt(searchParams.page || '1', 10);
  const selectedGenres = searchParams.genres || '';
  const selectedYear = searchParams.year ? parseInt(searchParams.year, 10) : null;
  const selectedSort = searchParams.sort_by || 'popularity.desc';

  if (currentPage < 1 || currentPage > 500) {
    notFound();
  }

  const [movies, genres] = await Promise.all([
    getFilteredMovies(currentPage, selectedGenres, selectedYear, selectedSort),
    getMovieGenres(),
  ]);

  return (
    <MoviesContent
      initialMovies={movies.results}
      initialTotalPages={movies.total_pages}
      genres={genres}
      currentPage={currentPage}
    />
  );
}