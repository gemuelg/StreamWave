// src/app/movies/page.tsx

import MoviesContent from './MoviesContent';
import { getFilteredMovies, getMovieGenres } from '@/lib/tmdb';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

// 1. STATIC INDEX METADATA ENGINE (SEO Upgrade)
export const metadata: Metadata = {
  title: 'Browse Movies - Stream Official Details & Ratings | StreamWave',
  description: 'Explore our comprehensive catalog of movies. Filter by genres, release years, and sort by popularity to discover your next favorite film.',
  openGraph: {
    title: 'Browse Movies - StreamWave',
    description: 'Explore our comprehensive catalog of movies. Filter by genres, release years, and sort by popularity.',
    type: 'website',
  },
};

// Define the incoming search parameters contract as an asynchronous Promise
interface PageProps {
  searchParams: Promise<{
    page?: string;
    genres?: string;
    year?: string;
    sort_by?: string;
  }>;
}

// 2. MAIN CORE SERVER COMPONENT
export default async function MoviesPage({ searchParams }: PageProps) {
  // Await search parameters asynchronously to satisfy modern Next.js runtimes
  const resolvedSearchParams = await searchParams;

  // Parse out query strings into clean variables with safe fallback defaults
  const currentPage = parseInt(resolvedSearchParams.page || '1', 10);
  const selectedGenres = resolvedSearchParams.genres || '';
  const selectedYear = resolvedSearchParams.year ? parseInt(resolvedSearchParams.year, 10) : null;
  const selectedSort = resolvedSearchParams.sort_by || 'popularity.desc';

  // Defensive API Boundary Validation (TMDB hard caps searches at page 500)
  if (currentPage < 1 || currentPage > 500) {
    notFound();
  }

  // Fetch dynamic catalog streams concurrently to eliminate waterfall network delays
  const [movies, fetchedGenres] = await Promise.all([
    getFilteredMovies(currentPage, selectedGenres, selectedYear, selectedSort),
    getMovieGenres(),
  ]);

  // Hydrate the presentation layout wrapper with fresh data streams
  return (
    <MoviesContent
      initialMovies={movies.results}
      initialTotalPages={movies.total_pages}
      genres={fetchedGenres}
      currentPage={currentPage}
    />
  );
}