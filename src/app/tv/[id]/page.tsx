// src/app/tv/[id]/page.tsx
import { notFound } from 'next/navigation';
// ADD getTVGenres and Genre to imports
import { getTVShowDetails, getPrimaryVideoKey, getTVShowRecommendations, CrewMember, CastMember, getTVGenres, Genre } from '@/lib/tmdb';
import TVShowDetailContent from '@/components/TVShowDetailContent';
import { Metadata } from 'next'; // Import Metadata type for clarity

// Set up dynamic metadata
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const tvShow = await getTVShowDetails(Number(params.id));
  if (!tvShow) {
    return {
      title: 'TV Show Not Found - StreamWave', // Added brand for SEO consistency
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
  
  // 1. USE PROMISE.ALL TO FETCH ALL DATA ON THE SERVER
  const [tvShow, recommendations, allGenres] = await Promise.all([
    getTVShowDetails(id),
    getTVShowRecommendations(id),
    getTVGenres(), // <-- FETCH TV GENRES HERE (MOVED FROM CLIENT COMPONENT)
  ]);

  if (!tvShow) {
    notFound();
  }

  const videoKey = getPrimaryVideoKey(tvShow.videos || null);

  // 2. CREATE GENRE MAP ON THE SERVER TO AVOID CLIENT-SIDE STATE/EFFECTS
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
      genresMap={genresMap} // <-- 3. PASS THE MAP DOWN AS A PROP
    />
  );
}