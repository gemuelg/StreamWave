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
  if (rating >= 8) return 'text-pink-500';
  if (rating >= 6) return 'text-yellow-400';
  return 'text-red-400';
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
}

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
  const overview = item.overview || "No overview available.";
  const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
  const id = item.id;
  
  const status = isMovie ? "Released" : "Returning Series";
  const airedDate = ('release_date' in item && item.release_date) ? item.release_date : ('first_air_date' in item && item.first_air_date) ? item.first_air_date : 'N/A';
  
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
      <div
        style={{
          position: 'fixed',
          top: position.y,
          left: position.x,
          transform: 'translateY(-20px)',
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className="z-50 w-80 bg-darkOverlay rounded-lg shadow-2xl p-2 border border-gray-700 pointer-events-auto transition-all duration-200 "
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-2 h-1">
            <h3 className="text-xl font-bold text-white line-clamp-1 my-0">{title}</h3>
            <span className={`flex items-center text-base font-semibold ${getRatingColor(item.vote_average)}`}>
              <StarIcon className="w-4 h-4 mr-1" />{rating}
            </span>
          </div>
  
          <div className="flex items-center text-xs text-white mb-3 space-x-2 mt-2 px-2">
            <span className="bg-gray-700 px-2 py-1 rounded">HD</span>
            <span className="bg-gray-700 px-2 py-1 rounded">CC</span>
            {isDetailedDataLoaded ? (
                <>
                    <span className="bg-gray-700 px-2 py-1 rounded">{ageRating || 'N/A'}</span>
                    <span className="bg-gray-700 px-2 py-1 rounded">{mediaTypeLabel || 'N/A'}</span>
                </>
            ) : (
                <>
                    <div className="w-8 h-6 bg-gray-700 rounded animate-pulse" />
                    <div className="w-12 h-6 bg-gray-700 rounded animate-pulse" />
                </>
            )}
          </div>
  
          <p className="text-sm text-gray-300 line-clamp-3 mb-3 px-2">{overview}</p>
  
          <div className="text-xs text-gray-400 space-y-1 mb-8 px-2">
            <p>Aired: {airedDate}</p>
            <p>Status: {status}</p>
            <p>Genres: {genres}</p>
          </div>
  
          <div className="flex items-end px-2">
            <Link href={mediaLink} className="flex-1 mr-2">
              <button className="w-full flex items-center justify-center bg-[#f04f7c] hover:bg-pink-600 text-white font-semibold py-2 rounded-lg transition-colors duration-200">
                <PlayIcon className="w-5 h-5 mr-2" /> Watch now
              </button>
            </Link>
            <button
              onClick={handleToggleWatchlist}
              className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg transition-colors duration-200 ${
                isAdded ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 hover:bg-gray-600'
              }`}
              disabled={isAdded}
            >
              {isAdded ? <CheckIcon className="w-6 h-6 text-white" /> : <PlusIcon className="w-6 h-6 text-white" />}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default HoverCard;