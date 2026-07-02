'use client';

import React, { useState, useEffect } from 'react';
import { Movie, TVShow, MultiSearchResultItem, MovieDetails, TVShowDetails, getMovieDetails, getTVShowDetails } from '@/lib/tmdb';
import Link from 'next/link';
import { PlayIcon, PlusIcon, CheckIcon, StarIcon } from '@heroicons/react/24/solid';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useUser } from '@/hooks/useUser';
import { useRouter } from 'next/navigation';
import Portal from './Portal';

interface HoverCardProps {
  item: Movie | TVShow | MultiSearchResultItem;
  contentType: 'movie' | 'tv';
  position: { x: number; y: number };
  genres: string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const getRatingColor = (rating: number) => {
  if (rating >= 8) return 'text-amber-400';
  if (rating >= 6) return 'text-zinc-300';
  return 'text-zinc-500';
};

const getCertification = (item: any, contentType: string): string | null => {
  if (contentType === 'movie' && item.release_dates) {
    const usRating = item.release_dates.results?.find((r: any) => r.iso_3166_1 === 'US');
    if (usRating) {
      return usRating.release_dates.find((d: any) => d.certification !== '')?.certification || null;
    }
  } else if (contentType === 'tv' && item.content_ratings) {
    const usRating = item.content_ratings.results?.find((r: any) => r.iso_3166_1 === 'US');
    return usRating?.rating || null;
  }
  return null;
};

const getMediaTypeLabel = (item: any) => {
  if (item.media_type === 'tv' || ('first_air_date' in item && item.first_air_date)) {
    return 'TV Show';
  } else if (item.media_type === 'movie' || ('release_date' in item && item.release_date)) {
    return 'Movie';
  }
  return 'N/A';
};

const HoverCard: React.FC<HoverCardProps> = ({ item, contentType, position, genres, onMouseEnter, onMouseLeave }) => {
  const [detailedItem, setDetailedItem] = useState<MovieDetails | TVShowDetails | null>(null);
  const { addItem, isItemInWatchlist } = useWatchlist();
  const router = useRouter();
  const user = useUser();
  const isAdded = isItemInWatchlist(item.id);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        if (contentType === 'movie') {
          const details = await getMovieDetails(item.id);
          setDetailedItem(details);
        } else {
          const details = await getTVShowDetails(item.id);
          setDetailedItem(details);
        }
      } catch (error) {
        console.error("Failed to fetch detailed item data:", error);
      }
    };
    fetchDetails();
  }, [item.id, contentType]);

  const isMovie = contentType === 'movie';
  const title = isMovie ? (item as Movie).title : (item as TVShow).name;
  const overview = item.overview || "No plot summary available for this title.";
  const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
  const id = item.id;
  
  // --- FIXED STATUS LOGIC: Extract actual backend status strings dynamically ---
  const dynamicStatus = detailedItem 
    ? (detailedItem as any).status || (isMovie ? "Released" : "Unknown")
    : null;
  
  const airedDate = ('release_date' in item && item.release_date) 
    ? new Date(item.release_date).toLocaleDateString(undefined, { dateStyle: 'medium' }) 
    : ('first_air_date' in item && item.first_air_date) 
      ? new Date(item.first_air_date).toLocaleDateString(undefined, { dateStyle: 'medium' }) 
      : 'N/A';
  
  const mediaLink = `/${isMovie ? 'movies' : 'tv'}/${id}`;

  const handleToggleWatchlist = () => {
    if (!user) {
      router.push('/auth');
      return;
    }
    if (!isAdded) {
      addItem(item);
    }
  };

  const ageRating = detailedItem ? getCertification(detailedItem, contentType) : null;
  const mediaTypeLabel = getMediaTypeLabel(item);
  const isDetailedDataLoaded = !!detailedItem;

  return (
    <Portal>
      {/* Dynamic Keyframe Injection for Ultra-Fluid Entrance Physics */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes subtleFluidEntrance {
          0% { opacity: 0; transform: translateY(-4px) scale(0.98); filter: blur(4px); }
          100% { opacity: 1; transform: translateY(-8px) scale(1); filter: blur(0); }
        }
        .animate-fluidCard {
          animation: subtleFluidEntrance 0.28s cubic-bezier(0.21, 1.02, 0.43, 1.01) forwards;
        }
      `}} />

      <div
        style={{
          position: 'fixed',
          top: position.y,
          left: position.x,
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className="z-50 w-80 bg-zinc-950/95 backdrop-blur-xl rounded-xl shadow-[0_24px_50px_-12px_rgba(0,0,0,0.7)] p-4 border border-zinc-800/60 pointer-events-auto transition-all duration-300 ease-out animate-fluidCard select-none"
      >
        <div className="flex flex-col h-full space-y-3.5">
          
          {/* HEADER LAYER */}
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-semibold text-white tracking-tight line-clamp-1 flex-1 leading-tight pt-0.5">
              {title}
            </h3>
            <span className={`flex items-center text-xs font-semibold flex-shrink-0 bg-zinc-900/80 px-2 py-0.5 rounded-md border border-zinc-800/40 ${getRatingColor(item.vote_average)}`}>
              <StarIcon className="w-3 h-3 mr-1 fill-current" />
              {rating}
            </span>
          </div>
  
          {/* BADGE METADATA MATRICES */}
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-medium tracking-wider text-zinc-400">
            <span className="bg-zinc-900/90 border border-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">HD</span>
            <span className="bg-zinc-900/90 border border-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">CC</span>
            {isDetailedDataLoaded ? (
              <>
                <span className="bg-zinc-900/90 border border-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">{ageRating || 'NR'}</span>
                <span className="bg-zinc-900/90 border border-zinc-800 px-1.5 py-0.5 rounded text-zinc-300 tracking-normal">{mediaTypeLabel}</span>
              </>
            ) : (
              <>
                <div className="w-8 h-4 bg-zinc-900 border border-zinc-800/30 rounded animate-pulse" />
                <div className="w-14 h-4 bg-zinc-900 border border-zinc-800/30 rounded animate-pulse" />
              </>
            )}
          </div>
  
          {/* OVERVIEW CONTENT */}
          <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3 font-normal tracking-wide">
            {overview}
          </p>
  
          {/* PRODUCTION TRACK TRACKER */}
          <div className="text-[11px] text-zinc-500 space-y-1.5 py-2 border-y border-zinc-900">
            <p className="flex justify-between"><span className="text-zinc-500">Aired</span> <span className="text-zinc-300 font-medium">{airedDate}</span></p>
            <p className="flex justify-between">
              <span className="text-zinc-500">Status</span> 
              <span className="text-zinc-300 font-medium">
                {dynamicStatus ? dynamicStatus : <span className="inline-block w-16 h-3 bg-zinc-900 rounded animate-pulse" />}
              </span>
            </p>
            <p className="flex justify-between items-center gap-4">
              <span className="text-zinc-500 flex-shrink-0">Genres</span> 
              <span className="text-zinc-300 font-medium truncate max-w-[180px] text-right">{genres || 'N/A'}</span>
            </p>
          </div>
  
          {/* CORE ACTION SUBBLOCK CONTROLS */}
          <div className="flex items-center gap-2 pt-0.5">
            <Link href={mediaLink} className="flex-1" prefetch={false}>
              <button className="group w-full flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-medium py-2 rounded-md text-xs transition-all duration-300 ease-out hover:scale-[1.015] active:scale-98 shadow-md hover:shadow-xl hover:shadow-white/5">
                <PlayIcon className="w-3 h-3 mr-1.5 fill-current transition-transform duration-300 ease-out group-hover:translate-x-0.5" /> 
                Watch Now
              </button>
            </Link>
            
            <button
              onClick={handleToggleWatchlist}
              className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md border transition-all duration-300 ease-out ${
                isAdded 
                  ? 'bg-zinc-900 border-emerald-900/60 text-emerald-400 cursor-not-allowed' 
                  : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700 text-zinc-300 hover:text-white hover:scale-105 active:scale-95'
              }`}
              disabled={isAdded}
            >
              {isAdded ? <CheckIcon className="w-3.5 h-3.5 stroke-[3]" /> : <PlusIcon className="w-3.5 h-3.5 stroke-[3]" />}
            </button>
          </div>

        </div>
      </div>
    </Portal>
  );
};

export default HoverCard;