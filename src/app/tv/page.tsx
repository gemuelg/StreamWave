import { getFilteredTVShows, getTVGenres } from '@/lib/tmdb';
import { notFound } from 'next/navigation';
import TVContent from './TVContent';

export default async function TVPage({
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

  const [tvShows, fetchedGenres] = await Promise.all([
    getFilteredTVShows(currentPage, selectedGenres, selectedYear, selectedSort),
    getTVGenres(),
  ]);

  return (
    <TVContent
      initialTVShows={tvShows.results}
      initialTotalPages={tvShows.total_pages}
      genres={fetchedGenres}
      currentPage={currentPage}
    />
  );
}