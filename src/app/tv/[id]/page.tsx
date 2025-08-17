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
  return {
    title: tvShow.name,
    description: tvShow.overview,
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