// src/app/tv/page.tsx

import { getFilteredTVShows, getTVGenres } from '@/lib/tmdb';
import { notFound } from 'next/navigation';
import TVContent from './TVContent';

// Define the incoming search parameters contract as an asynchronous Promise
interface PageProps {
  searchParams: Promise<{
    page?: string;
    genres?: string;
    year?: string;
    sort_by?: string;
  }>;
}

export default async function TVPage({ searchParams }: PageProps) {
  // 1. Await search parameters asynchronously to ensure compatibility with modern Next.js runtimes
  const resolvedSearchParams = await searchParams;

  // 2. Parse out strings into safe parameters with fallback defaults
  const currentPage = parseInt(resolvedSearchParams.page || '1', 10);
  const selectedGenres = resolvedSearchParams.genres || '';
  const selectedYear = resolvedSearchParams.year ? parseInt(resolvedSearchParams.year, 10) : null;
  const selectedSort = resolvedSearchParams.sort_by || 'popularity.desc';

  // 3. Prevent runtime API failures by enforcing TMDB boundary conditions
  if (currentPage < 1 || currentPage > 500) {
    notFound();
  }

  // 4. Fetch dynamic catalog streams concurrently to eliminate waterfall delays
  const [tvShows, fetchedGenres] = await Promise.all([
    getFilteredTVShows(currentPage, selectedGenres, selectedYear, selectedSort),
    getTVGenres(),
  ]);

  // 5. Hand down initial state values to hydrate the user interface
  return (
    <TVContent
      initialTVShows={tvShows.results}
      initialTotalPages={tvShows.total_pages}
      genres={fetchedGenres}
      currentPage={currentPage}
    />
  );
}