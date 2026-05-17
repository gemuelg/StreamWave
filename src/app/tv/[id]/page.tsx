// src/app/tv/[id]/page.tsx
import { notFound } from 'next/navigation';
import { getTVShowDetails, getPrimaryVideoKey, getTVShowRecommendations, CrewMember, CastMember, getTVGenres, Genre } from '@/lib/tmdb';
import TVShowDetailContent from '@/components/TVShowDetailContent';
import { Metadata } from 'next'; 

// ENHANCEMENT: THIS IS THE MAGIC LINE! 
// It caches this specific TV show page for 1 WEEK (604,800 seconds)
export const revalidate = 604800;

// Set up dynamic metadata
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const tvShow = await getTVShowDetails(Number(params.id));
  if (!tvShow) {
    return {
      title: 'TV Show Not Found - StreamWave', 
    };
  }

  const uniqueTitle = `${tvShow.name} - Seasons, Episodes & Details on StreamWave`;
  const overviewPrefix = "Stream the latest episodes and full details for this series:";
  const uniqueDescription = `${overviewPrefix} ${tvShow.overview?.substring(0, 150) || 'Find cast, crew, ratings, and where to stream this TV show.'}`;

  return {
    title: uniqueTitle,
    description: uniqueDescription,
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

  return (
    <TVShowDetailContent
      tvShow={tvShow}
      videoKey={videoKey}
      recommendations={recommendations}
      creators={creators}
      cast={cast}
      genresMap={genresMap} 
    />
  );
}