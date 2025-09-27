// src/app/tv/[id]/page.tsx
import { notFound } from 'next/navigation';
import { getTVShowDetails, getPrimaryVideoKey, getTVShowRecommendations, CrewMember, CastMember } from '@/lib/tmdb';
import TVShowDetailContent from '@/components/TVShowDetailContent';

// Set up dynamic metadata
export async function generateMetadata({ params }: { params: { id: string } }) {
  const tvShow = await getTVShowDetails(Number(params.id));
  if (!tvShow) {
    return {
      title: 'TV Show Not Found',
    };
  }
// 1. CREATE UNIQUE TITLE TEMPLATE
  const uniqueTitle = `${tvShow.name} - Seasons, Episodes & Details on StreamWave`;

  // 2. CREATE UNIQUE META DESCRIPTION TEMPLATE
  // Prepend a unique, action-oriented brand phrase to the TMDB overview
  const overviewPrefix = "Stream the latest episodes and full details for this series:";
  const uniqueDescription = `${overviewPrefix} ${tvShow.overview?.substring(0, 150) || 'Find cast, crew, ratings, and where to stream this TV show.'}`;

  return {
    title: uniqueTitle, // <-- Apply unique title
    description: uniqueDescription, // <-- Apply unique description
    // Add OpenGraph and Twitter tags for social sharing/branding
    openGraph: {
      title: uniqueTitle,
      description: uniqueDescription,
      url: `/tv/${tvShow.id}`,
      images: [{ url: `https://image.tmdb.org/t/p/original${tvShow.backdrop_path}` }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: uniqueTitle,
      description: uniqueDescription,
      images: [`https://image.tmdb.org/t/p/original${tvShow.backdrop_path}`],
    },
  };
}


export default async function TVShowDetailsPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const tvShow = await getTVShowDetails(id);

  if (!tvShow) {
    notFound();
  }

  const videoKey = getPrimaryVideoKey(tvShow.videos || null);
  const recommendations = await getTVShowRecommendations(id);

  const creators = tvShow.credits?.crew?.filter((member: CrewMember) => member.job === 'Creator' && member.profile_path);
  const cast = tvShow.credits?.cast?.filter((member: CastMember) => member.profile_path).slice(0, 10);

  return (
    <TVShowDetailContent
      tvShow={tvShow}
      videoKey={videoKey}
      recommendations={recommendations}
      creators={creators}
      cast={cast}
    />
  );
}