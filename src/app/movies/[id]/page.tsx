// src/app/movies/[id]/page.tsx

import { notFound } from 'next/navigation';
import { getMovieDetails, getPrimaryVideoKey, getMovieRecommendations, CrewMember, CastMember, getMovieGenres, Genre } from '@/lib/tmdb';
import MovieDetailContent from '@/components/MovieDetailContent';
import { Metadata } from 'next'; 

// Cache this specific movie page for 1 WEEK (604,800 seconds)
export const revalidate = 604800; 

// Base URL for production canonical indexing
const BASE_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://streamwave.xyz';

interface PageProps {
  params: Promise<{ id: string }>;
}

// 1. DYNAMIC METADATA ENGINE
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const movie = await getMovieDetails(Number(resolvedParams.id));
  
  if (!movie) {
    return {
      title: 'Movie Not Found - StreamWave', 
    };
  }
  
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : '';
  const uniqueTitle = `${movie.title} ${releaseYear ? `(${releaseYear})` : ''} - Stream Official Details on StreamWave`;
  const overviewPrefix = "Watch now and explore the full story:";
  const uniqueDescription = `${overviewPrefix} ${movie.overview?.substring(0, 150) || 'Find cast, crew, ratings, and where to stream this movie.'}`;
  
  // Create absolute URLs for meta-crawlers
  const canonicalUrl = `${BASE_SITE_URL}/movies/${movie.id}`;
  const ogImageUrl = movie.backdrop_path 
    ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` 
    : `https://image.tmdb.org/t/p/w500${movie.poster_path}`;

  return {
    title: uniqueTitle, 
    description: uniqueDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: uniqueTitle,
      description: uniqueDescription,
      url: canonicalUrl,
      images: [{ url: ogImageUrl, width: 1280, height: 720, alt: movie.title }],
      type: 'video.movie',
    },
    twitter: {
      card: 'summary_large_image',
      title: uniqueTitle,
      description: uniqueDescription,
      images: [ogImageUrl],
    },
  };
}

// 2. MAIN CORE SERVER COMPONENT
export default async function MovieDetailsPage({ params }: PageProps) {
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);
  
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

  // BUILD GOOGLE RICH SNIPPET SCHEMA
  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "Movie",
    "@id": `${BASE_SITE_URL}/movies/${movie.id}`,
    "name": movie.title,
    "description": movie.overview,
    "image": movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : undefined,
    "datePublished": movie.release_date,
    "duration": movie.runtime ? `PT${movie.runtime}M` : undefined,
    "genre": movie.genres?.map(g => g.name),
    "aggregateRating": movie.vote_count > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": movie.vote_average.toFixed(1),
      "bestRating": "10",
      "worstRating": "1",
      "ratingCount": movie.vote_count
    } : undefined,
    "director": director ? {
      "@type": "Person",
      "name": director.name
    } : undefined,
    "actor": cast?.map(actor => ({
      "@type": "Person",
      "name": actor.name
    }))
  };

  return (
    <>
      {/* Search Engine Structured Script Tag */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />
      
      <MovieDetailContent
        movie={movie}
        videoKey={videoKey}
        recommendations={recommendations}
        director={director}
        writers={writers}
        cast={cast}
        genresMap={genresMap} 
      />
    </>
  );
}