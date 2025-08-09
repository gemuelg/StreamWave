// src/app/watch/[mediaType]/[id]/client-page.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  getMovieDetails, 
  getTVShowDetails, 
  getMovieRecommendations, 
  getTVShowRecommendations,
  getImageUrl, 
  MovieDetails, 
  TVShowDetails,
  Movie,
  TVShow,
  getHnEmbedMovieUrl,
  getHnEmbedTvUrl,
  getMultiEmbedMovieUrl,
  getMultiEmbedTvUrl
} from '@/lib/tmdb';
import Navbar from '@/components/Navbar';
import MovieCard from '@/components/MovieCard';
import { PlayCircleIcon, Bars3Icon, ChevronDownIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';

interface WatchPageProps {
  params: {
    id: string;
    mediaType: string;
  };
  searchParams?: {
    season?: string;
    episode?: string;
  };
}

// Utility function to format text with line breaks
const formatOverviewText = (text: string | null | undefined, wordsPerLine = 8) => {
  if (!text) return '';
  const words = text.split(' ');
  const lines = [];
  for (let i = 0; i < words.length; i += wordsPerLine) {
    lines.push(words.slice(i, i + wordsPerLine).join(' '));
  }
  return lines.join('<br />');
};

const OVERVIEW_WORD_LIMIT = 40;

export default function ClientWatchPage({ params }: WatchPageProps) {
  const { id, mediaType } = params;
  const searchParams = useSearchParams();
  const router = useRouter();

  const [content, setContent] = useState<MovieDetails | TVShowDetails | null>(null);
  const [recommendations, setRecommendations] = useState<Movie[] | TVShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullOverview, setShowFullOverview] = useState(false);
  
  const [selectedSeason, setSelectedSeason] = useState<number | undefined>(undefined);
  const [selectedEpisode, setSelectedEpisode] = useState<number | undefined>(undefined);
  const [showSeasonList, setShowSeasonList] = useState(false);
  
  const [selectedServer, setSelectedServer] = useState<'multiembed' | 'hnembed'>('multiembed');

  const videoPlayerRef = useRef<HTMLDivElement>(null);

  const videoUrl = selectedServer === 'multiembed'
    ? (mediaType === 'movie'
      ? getMultiEmbedMovieUrl(parseInt(id))
      : (selectedSeason && selectedEpisode
        ? getMultiEmbedTvUrl(parseInt(id), selectedSeason, selectedEpisode)
        : ''))
    : (mediaType === 'movie'
      ? getHnEmbedMovieUrl(parseInt(id))
      : (selectedSeason && selectedEpisode
        ? getHnEmbedTvUrl(parseInt(id), selectedSeason, selectedEpisode)
        : ''));

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        let fetchedContent;
        let fetchedRecommendations;

        if (mediaType === 'movie') {
          fetchedContent = await getMovieDetails(parseInt(id));
          if (fetchedContent) {
            fetchedRecommendations = await getMovieRecommendations(parseInt(id));
          }
        } else if (mediaType === 'tv') {
          fetchedContent = await getTVShowDetails(parseInt(id));
          if (fetchedContent) {
            fetchedRecommendations = await getTVShowRecommendations(parseInt(id));
          }
        }
        
        if (fetchedContent) {
          setContent(fetchedContent);
          setRecommendations(fetchedRecommendations || []);
          if (mediaType === 'tv') {
            const tvContent = fetchedContent as TVShowDetails;
            const urlSeason = parseInt(searchParams.get('season') || '1');
            const urlEpisode = parseInt(searchParams.get('episode') || '1');
            
            if (tvContent.seasons && tvContent.seasons.length > 0) {
              const seasonExists = tvContent.seasons.find(s => s.season_number === urlSeason);
              const initialSeasonNumber = seasonExists ? urlSeason : (tvContent.seasons[0]?.season_number || 1);
              const initialSeason = tvContent.seasons.find(s => s.season_number === initialSeasonNumber);
              const episodeCount = initialSeason?.episode_count || 0;
              const validEpisode = urlEpisode > 0 && urlEpisode <= episodeCount ? urlEpisode : 1;
              
              setSelectedSeason(initialSeasonNumber);
              setSelectedEpisode(validEpisode);
              
              if (!searchParams.get('season') || !searchParams.get('episode')) {
                router.replace(`/watch/tv/${id}?season=${initialSeasonNumber}&episode=${validEpisode}`);
              }
            } else {
              setSelectedSeason(undefined);
              setSelectedEpisode(undefined);
            }
          }
        } else {
          setError('Content not found.');
        }
      } catch (e) {
        console.error("Error fetching content details:", e);
        setError("Failed to load content details.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id, mediaType, searchParams, router]);

  const handleEpisodeChange = (episodeNumber: number) => {
    if (selectedSeason) {
      setSelectedEpisode(episodeNumber);
      router.push(`/watch/tv/${id}?season=${selectedSeason}&episode=${episodeNumber}`);
    }
  };

  const handleSeasonSelect = (seasonNumber: number) => {
    setSelectedSeason(seasonNumber);
    setSelectedEpisode(1); // Default to the first episode of the new season
    setShowSeasonList(false); // Close the dropdown
    router.push(`/watch/tv/${id}?season=${seasonNumber}&episode=1`);
  };

  const isTVShow = mediaType === 'tv';
  const tvShowDetails = isTVShow ? (content as TVShowDetails) : null;
  const movieDetails = !isTVShow ? (content as MovieDetails) : null;
  const title = isTVShow ? tvShowDetails?.name : movieDetails?.title;
  const backdropPath = isTVShow ? tvShowDetails?.backdrop_path : movieDetails?.backdrop_path;
  const overview = isTVShow ? tvShowDetails?.overview : movieDetails?.overview;
  const releaseYear = isTVShow ? new Date(tvShowDetails?.first_air_date || '').getFullYear() : new Date(movieDetails?.release_date || '').getFullYear();
  const voteAverage = isTVShow ? tvShowDetails?.vote_average : movieDetails?.vote_average;
  const posterPath = isTVShow ? tvShowDetails?.poster_path : movieDetails?.poster_path;
  const episodeCount = tvShowDetails?.number_of_episodes;
  const runtime = isTVShow ? tvShowDetails?.episode_run_times?.[0] : movieDetails?.runtime;


  const currentSeason = selectedSeason && tvShowDetails?.seasons.find(s => s.season_number === selectedSeason);

  const words = overview?.split(' ') || [];
  const truncatedOverview = words.length > OVERVIEW_WORD_LIMIT
    ? words.slice(0, OVERVIEW_WORD_LIMIT).join(' ') + '...'
    : overview;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primaryBg text-textLight">
        <svg className="animate-spin h-10 w-10 text-accentBlue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-primaryBg text-textLight p-6">
        <h1 className="text-4xl font-bold text-accentRed mb-4">Error</h1>
        <p className="text-lg text-textMuted mb-8">{error || "Content not found or an error occurred."}</p>
        <Link href="/" className="px-6 py-3 bg-accentBlue text-textLight rounded-lg hover:bg-accentPurple transition-colors">
          Go to Homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-textLight bg-primaryBg overflow-hidden flex flex-col">
      <Navbar />

      {/* Immersive background with a strong vignette */}
      {backdropPath && (
        <>
          <div
            className="absolute inset-0 z-0 bg-cover bg-center opacity-10"
            style={{ backgroundImage: `url(${getImageUrl(backdropPath, 'original')})` }}
          ></div>
          <div className="absolute inset-0 z-10"
            style={{ background: 'radial-gradient(ellipse at center, transparent 0%, rgba(16, 18, 27, 0.9) 80%)' }}
          ></div>
          <div className="absolute inset-0 z-10 pointer-events-none"
            style={{ boxShadow: 'inset 0 0 150px rgba(0,0,0,0.8)' }}>
          </div>
        </>
      )}

      {/* Main Content Area - Responsive Flexbox */}
      <div className="relative z-30 flex flex-col lg:flex-row gap-8 w-full p-4 md:p-8 lg:p-12 mt-8 lg:mt-12 mb-8 items-start">
        
        {/* Left Sidebar: Seasons and Episodes */}
        {isTVShow && tvShowDetails && tvShowDetails.seasons && (
          <aside
            className="w-full lg:w-80 order-2 lg:order-1 bg-tertiaryBg/60 backdrop-blur-md rounded-lg p-4 flex flex-col"
          >
            
            {/* Custom Season Dropdown */}
            <div className="relative mb-4">
              <button
                onClick={() => setShowSeasonList(!showSeasonList)}
                className="w-full bg-secondaryBg text-textLight rounded-lg py-2 pl-3 pr-10 flex items-center justify-between hover:bg-tertiaryBg transition-colors"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <Bars3Icon className="w-5 h-5 text-textMuted flex-shrink-0" />
                  <span className="font-semibold text-lg lg:text-base xl:text-lg overflow-hidden text-ellipsis whitespace-nowrap">
                    Season {selectedSeason}
                  </span>
                </div>
                <ChevronDownIcon className={`w-5 h-5 text-textMuted transition-transform ${showSeasonList ? 'rotate-180' : ''}`} />
              </button>

              {showSeasonList && (
                <div className="absolute top-full left-0 z-50 mt-2 w-full bg-secondaryBg rounded-lg shadow-lg max-h-[50vh] overflow-y-auto">
                  {tvShowDetails.seasons.map(season => (
                    <button
                      key={season.id}
                      onClick={() => handleSeasonSelect(season.season_number)}
                      className={`block w-full text-left px-4 py-2 transition-colors
                                  ${selectedSeason === season.season_number
                                    ? 'bg-accent text-white'
                                    : 'text-textMuted hover:bg-tertiaryBg'
                                  }`}
                    >
                      Season {season.season_number}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Episode List */}
            {selectedSeason && currentSeason && (
              <>
                <h3 className="font-semibold text-textLight mb-2">Episodes</h3>
                <div className="flex-grow">
                  <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-3 gap-2 pr-2">
                    {Array.from({ length: currentSeason.episode_count || 0 }, (_, i) => i + 1).map(episodeNum => (
                      <button
                        key={episodeNum}
                        onClick={() => handleEpisodeChange(episodeNum)}
                        className={`p-2 rounded-lg text-center transition-colors text-sm font-semibold
                                    ${selectedEpisode === episodeNum
                                      ? 'bg-accent text-white shadow-sm'
                                      : 'bg-secondaryBg hover:bg-tertiaryBg text-textMuted'
                                    }`}
                      >
                        {episodeNum}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
            
            {!selectedSeason || !currentSeason && (
              <div className="text-center p-4 text-textMuted text-sm">
                No seasons or episodes available.
              </div>
            )}
          </aside>
        )}

        {/* Center: Video Player - Always at the top on mobile */}
        <div className={`flex-grow w-full order-1 lg:order-2 flex flex-col`}>
          {videoUrl ? (
            <div ref={videoPlayerRef} className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl">
              <iframe
                key={videoUrl}
                src={videoUrl}
                allowFullScreen
                frameBorder="0"
                className="w-full h-full"
              ></iframe>
            </div>
          ) : (
            <div ref={videoPlayerRef} className="w-full aspect-video flex items-center justify-center bg-secondaryBg rounded-lg text-textMuted text-lg">
              Video link not available for this {mediaType}. Please select a season and episode.
            </div>
          )}
          
          {/* Server selection buttons - Below the player */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedServer('multiembed')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-colors
                ${selectedServer === 'multiembed' ? 'bg-accent text-white' : 'bg-secondaryBg text-textMuted hover:bg-tertiaryBg'}
              `}
            >
              <PlayCircleIcon className="w-5 h-5" /> Server 1
            </button>
            <button
              onClick={() => setSelectedServer('hnembed')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-colors
                ${selectedServer === 'hnembed' ? 'bg-accent text-white' : 'bg-secondaryBg text-textMuted hover:bg-tertiaryBg'}
              `}
            >
              <PlayCircleIcon className="w-5 h-5" /> Server 2
            </button>
          </div>
        </div>

        {/* Right Sidebar: Details Panel - Placed after the player on mobile */}
        <aside 
          className="w-full lg:w-80 order-3 lg:order-3 bg-tertiaryBg/60 backdrop-blur-md rounded-lg p-4"
        >
          {/* Flex container for all details, stacked vertically */}
          <div className="flex flex-col gap-4">
            {/* 1. Image at the top */}
            {posterPath && (
              <div className="relative w-[80px] h-[118px] rounded-md overflow-hidden shadow-lg">
                <Image 
                  src={getImageUrl(posterPath, 'w500')} 
                  alt={title || "Poster"} 
                  width={80}
                  height={118}
                  className="object-cover w-full h-full"
                />
              </div>
            )}
            
            {/* 2. Title below the image */}
            <h1 className="text-xl md:text-2xl font-bold text-textLight">{title}</h1>
            
            {/* 3. Rating and other details */}
            <div className="flex flex-wrap gap-2 text-sm text-textMuted">
              {isTVShow && (
                <>
                  <span className="px-2 py-1 bg-secondaryBg rounded-md">TV</span>
                  <span className="px-2 py-1 bg-secondaryBg rounded-md">{episodeCount} Ep</span>
                  <span className="px-2 py-1 bg-secondaryBg rounded-md">{runtime}m</span>
                </>
              )}
              {!isTVShow && (
                <>
                  <span className="px-2 py-1 bg-secondaryBg rounded-md">Movie</span>
                  <span className="px-2 py-1 bg-secondaryBg rounded-md">{runtime}m</span>
                </>
              )}
              {releaseYear && <span className="px-2 py-1 bg-secondaryBg rounded-md">{releaseYear}</span>}
              {voteAverage && voteAverage > 0 && (
                <span className="flex items-center px-2 py-1 bg-secondaryBg rounded-md">
                  <span className="text-accentYellow mr-1">⭐</span>
                  {voteAverage.toFixed(1)}
                </span>
              )}
            </div>
            
            {/* 4. Info text (overview) at the bottom */}
            <p className="text-textLight text-sm">
              <span dangerouslySetInnerHTML={{ __html: formatOverviewText(showFullOverview ? overview : truncatedOverview) }} />
              {overview && overview.split(' ').length > OVERVIEW_WORD_LIMIT && (
                <button
                onClick={() => setShowFullOverview(!showFullOverview)}
                className="text-accentBlue hover:underline ml-2"
                >
                  {showFullOverview ? 'Less' : 'More'}
                </button>
              )}
            </p>
          </div>
        </aside>
      </div>
      
      {/* More Like This (Recommendations) Section */}
      <div className="relative z-30 w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-12 mb-8">
        {recommendations.length > 0 && (
          <div className="mt-8">
            <h2 className="text-3xl font-bold mb-6">More Like This</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {recommendations.map((item) => (
                <MovieCard
                  key={item.id}
                  content={item}
                  contentType={mediaType === 'movie' ? 'movie' : 'tv'}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="relative z-30 w-full py-4 text-center text-textMuted text-sm bg-primaryBg mt-auto">
        &copy; {new Date().getFullYear()} Stream Wave. All rights reserved. Data provided by TMDB.
      </footer>
    </div>
  );
}