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
  return {
    title: movie.title,
    description: movie.overview,
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