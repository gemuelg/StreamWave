// src/app/tv/[id]/page.tsx

import { notFound } from 'next/navigation';
import { getTVShowDetails, getPrimaryVideoKey, getTVShowRecommendations, CrewMember, CastMember, getTVGenres, Genre } from '@/lib/tmdb';
import TVShowDetailContent from '@/components/TVShowDetailContent';
import { Metadata } from 'next'; 

// Cache this specific TV show page for 1 WEEK (604,800 seconds)
export const revalidate = 604800;

// Dynamic environment base domain tracking
const BASE_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://streamwave.xyz';

interface PageProps {
  params: Promise<{ id: string }>;
}

// 1. DYNAMIC METADATA CONTROLLER
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const tvShow = await getTVShowDetails(Number(resolvedParams.id));
  
  if (!tvShow) {
    return {
      title: 'TV Show Not Found - StreamWave', 
    };
  }

  const uniqueTitle = `${tvShow.name} - Seasons, Episodes & Details on StreamWave`;
  const overviewPrefix = "Stream the latest episodes and full details for this series:";
  const uniqueDescription = `${overviewPrefix} ${tvShow.overview?.substring(0, 150) || 'Find cast, crew, ratings, and where to stream this TV show.'}`;

  // Build fully absolute search crawler resource paths
  const canonicalUrl = `${BASE_SITE_URL}/tv/${tvShow.id}`;
  const ogImageUrl = tvShow.backdrop_path 
    ? `https://image.tmdb.org/t/p/w1280${tvShow.backdrop_path}` 
    : `https://image.tmdb.org/t/p/w500${tvShow.poster_path}`;

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
      images: [{ url: ogImageUrl, width: 1280, height: 720, alt: tvShow.name }],
      type: 'video.tv_show',
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
export default async function TVShowDetailsPage({ params }: PageProps) {
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);
  
  // High-performance parallel network request engine
  const [tvShow, recommendations, allGenres] = await Promise.all([
    getTVShowDetails(id),
    getTVShowRecommendations(id),
    getTVGenres(), 
  ]);

  if (!tvShow) {
    notFound();
  }

  const videoKey = getPrimaryVideoKey(tvShow.videos || null);
  const genresMap = new Map(allGenres.map((genre: Genre) => [genre.id, genre.name]));

  const creators = tvShow.credits?.crew?.filter((member: CrewMember) => member.job === 'Creator' && member.profile_path);
  const cast = tvShow.credits?.cast?.filter((member: CastMember) => member.profile_path).slice(0, 10);

  // BUILD GOOGLE STRUCTURED SCHEMA FOR TV SERIES
  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    "@id": `${BASE_SITE_URL}/tv/${tvShow.id}`,
    "name": tvShow.name,
    "description": tvShow.overview,
    "image": tvShow.poster_path ? `https://image.tmdb.org/t/p/w500${tvShow.poster_path}` : undefined,
    "dateCreated": tvShow.first_air_date,
    "numberOfSeasons": tvShow.number_of_seasons,
    "numberOfEpisodes": tvShow.number_of_episodes,
    "genre": tvShow.genres?.map(g => g.name),
    "aggregateRating": tvShow.vote_count > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": tvShow.vote_average.toFixed(1),
      "bestRating": "10",
      "worstRating": "1",
      "ratingCount": tvShow.vote_count
    } : undefined,
    "creator": creators?.map(creator => ({
      "@type": "Person",
      "name": creator.name
    })),
    "actor": cast?.map(actor => ({
      "@type": "Person",
      "name": actor.name
    }))
  };

  return (
    <>
      {/* Structural Data Stream Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />
      
      <TVShowDetailContent
        tvShow={tvShow}
        videoKey={videoKey}
        recommendations={recommendations}
        creators={creators}
        cast={cast}
        genresMap={genresMap} 
      />
    </>
  );
}