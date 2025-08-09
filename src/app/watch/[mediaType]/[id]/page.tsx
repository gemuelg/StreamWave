// src/app/watch/[mediaType]/[id]/page.tsx

import ClientWatchPage from './client-page';
import { getMovieDetails, getTVShowDetails } from '@/lib/tmdb';

interface WatchPageProps {
  params: {
    mediaType: string;
    id: string;
  };
  searchParams?: {
    season?: string;
    episode?: string;
  };
}

export async function generateMetadata({ params }: WatchPageProps) {
  const { mediaType, id } = params;
  let title = 'Loading...';

  try {
    if (mediaType === 'movie') {
      const movie = await getMovieDetails(parseInt(id));
      if (movie) {
        title = `${movie.title} - StreamWave`;
      }
    } else if (mediaType === 'tv') {
      const tvShow = await getTVShowDetails(parseInt(id));
      if (tvShow) {
        title = `${tvShow.name} - StreamWave`;
      }
    }
  } catch (e) {
    console.error(`Failed to fetch metadata for ${mediaType} ${id}:`, e);
  }

  return {
    title: title,
    description: `Watch ${title} for free on StreamWave.`,
  };
}

export default function WatchPage({ params, searchParams }: WatchPageProps) {
  const { mediaType, id } = params;

  // Render client component and pass both params and searchParams
  return <ClientWatchPage params={{ mediaType, id }} searchParams={searchParams} />;
}