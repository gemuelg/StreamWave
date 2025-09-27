// src/app/movies/[id]/page.tsx

import { notFound } from 'next/navigation';
import { getMovieDetails, getPrimaryVideoKey, getMovieRecommendations, CrewMember, CastMember } from '@/lib/tmdb';
import MovieDetailContent from '@/components/MovieDetailContent';

// Set up dynamic metadata
export async function generateMetadata({ params }: { params: { id: string } }) {
  const movie = await getMovieDetails(Number(params.id));
  if (!movie) {
    return {
      title: 'Movie Not Found',
    };
  }
    const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : '';

  // 1. CREATE UNIQUE TITLE TEMPLATE
  const uniqueTitle = `${movie.title} ${releaseYear ? `(${releaseYear})` : ''} - Stream Official Details on StreamWave`;

  // 2. CREATE UNIQUE META DESCRIPTION TEMPLATE
  // Prepend a unique, action-oriented brand phrase to the TMDB overview
  const overviewPrefix = "Watch now and explore the full story:";
  const uniqueDescription = `${overviewPrefix} ${movie.overview?.substring(0, 150) || 'Find cast, crew, ratings, and where to stream this movie.'}`;


  return {
    title: uniqueTitle, // <-- Apply unique title
    description: uniqueDescription, // <-- Apply unique description
    // Add OpenGraph and Twitter tags for social sharing/branding
    openGraph: {
      title: uniqueTitle,
      description: uniqueDescription,
      url: `/movies/${movie.id}`,
      images: [{ url: `https://image.tmdb.org/t/p/original${movie.backdrop_path}` }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: uniqueTitle,
      description: uniqueDescription,
      images: [`https://image.tmdb.org/t/p/original${movie.backdrop_path}`],
    },
  };
}

export default async function MovieDetailsPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const movie = await getMovieDetails(id);

  if (!movie) {
    notFound();
  }

  const videoKey = (movie.videos) ? getPrimaryVideoKey(movie.videos) : null;
  const recommendations = await getMovieRecommendations(id);

  const director = movie.credits?.crew?.find((member: CrewMember) => member.job === 'Director' && member.profile_path);
  const writers = movie.credits?.crew?.filter((member: CrewMember) => member.department === 'Writing' && member.profile_path).slice(0, 3);
  const cast = movie.credits?.cast?.filter((member: CastMember) => member.profile_path).slice(0, 10);

  return (
    <MovieDetailContent
      movie={movie}
      videoKey={videoKey}
      recommendations={recommendations}
      director={director}
      writers={writers}
      cast={cast}
    />
  );
}