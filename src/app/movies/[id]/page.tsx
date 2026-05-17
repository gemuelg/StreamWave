// src/app/movies/[id]/page.tsx

import { notFound } from 'next/navigation';
import { getMovieDetails, getPrimaryVideoKey, getMovieRecommendations, CrewMember, CastMember, getMovieGenres, Genre } from '@/lib/tmdb';
import MovieDetailContent from '@/components/MovieDetailContent';
import { Metadata } from 'next'; 

// ENHANCEMENT: THIS IS THE MAGIC LINE! 
// It caches this specific movie page for 1 WEEK (604,800 seconds)
export const revalidate = 604800; 

// Set up dynamic metadata... 
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const movie = await getMovieDetails(Number(params.id));
  if (!movie) {
    return {
      title: 'Movie Not Found - StreamWave', 
    };
  }
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : '';
  const uniqueTitle = `${movie.title} ${releaseYear ? `(${releaseYear})` : ''} - Stream Official Details on StreamWave`;
  const overviewPrefix = "Watch now and explore the full story:";
  const uniqueDescription = `${overviewPrefix} ${movie.overview?.substring(0, 150) || 'Find cast, crew, ratings, and where to stream this movie.'}`;

  return {
    title: uniqueTitle, 
    description: uniqueDescription, 
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
  const [movie, recommendations, allGenres] = await Promise.all([
    getMovieDetails(id),
    getMovieRecommendations(id),
    getMovieGenres(), 
  ]);

  if (!movie) {
    notFound();
  }

  const videoKey = (movie.videos) ? getPrimaryVideoKey(movie.videos) : null;
  
  // CREATE GENRE MAP ON THE SERVER
  const genresMap = new Map(allGenres.map((genre: Genre) => [genre.id, genre.name]));

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
      genresMap={genresMap} 
    />
  );
}