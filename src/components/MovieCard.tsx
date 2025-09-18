// src/components/MovieCard.tsx
"use client";

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getImageUrl, Movie, TVShow, MultiSearchResultItem } from '@/lib/tmdb'; // Import MultiSearchResultItem
import { StarIcon } from '@heroicons/react/24/solid';
import HoverCard from './HoverCard';

interface MovieCardProps {
  id?: number;
  title?: string;
  posterPath?: string | null;
  voteAverage?: number;
  type?: 'movie' | 'tv';
  
  // Update the content prop to accept MultiSearchResultItem
  content?: Movie | TVShow | MultiSearchResultItem;
  contentType?: 'movie' | 'tv';
  genresMap?: Map<number, string>;
}

const MovieCard: React.FC<MovieCardProps> = (props) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const showTimer = useRef<NodeJS.Timeout | null>(null);
  const hideTimer = useRef<NodeJS.Timeout | null>(null);

  const id = props.content ? props.content.id : props.id;
  
  // Use a more robust way to get the title/name
  const title = (props.content as MultiSearchResultItem)?.title || (props.content as MultiSearchResultItem)?.name || props.title;
  
  const posterPath = props.content ? props.content.poster_path : props.posterPath;
  const voteAverage = props.content ? props.content.vote_average : props.voteAverage;
  const type = props.content ? props.contentType : props.type;
  const content = props.content;
  const genresMap = props.genresMap;

  const getGenresString = (genreIds: number[] | undefined): string => {
    if (!genreIds || !genresMap) return '';
    return genreIds.map(id => genresMap.get(id)).filter(Boolean).join(', ');
  };

  const genres = content ? getGenresString(content.genre_ids) : '';

  if (!id || !posterPath) {
    return null;
  }
  
  const displayTitle = title || "Untitled";
  const imageUrl = getImageUrl(posterPath, 'w500');
  const rating = voteAverage ? voteAverage.toFixed(1) : 'N/A';
  const linkHref = `/${type === 'movie' ? 'movies' : 'tv'}/${id}`;

  const handleMouseEnter = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
    }
    showTimer.current = setTimeout(() => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const cardWidth = rect.width;
        const hoverCardWidth = 320;
        const spaceOnRight = window.innerWidth - rect.right;
        const spaceOnLeft = rect.left;

        let newX = rect.left;
        let newY = rect.top + window.scrollY + rect.height / 2;

        if (spaceOnRight >= hoverCardWidth + 20) {
          newX = rect.right + 20;
        } else if (spaceOnLeft >= hoverCardWidth + 20) {
          newX = rect.left - hoverCardWidth - 20;
        } else {
          newX = rect.left + cardWidth / 2 - hoverCardWidth / 2;
          newY = rect.bottom + window.scrollY + 10;
        }

        setHoverPosition({ x: newX, y: newY });
        setIsHovered(true);
      }
    }, 500);
  };

  const handleMouseLeave = () => {
    if (showTimer.current) {
      clearTimeout(showTimer.current);
    }
    hideTimer.current = setTimeout(() => {
      setIsHovered(false);
    }, 200);
  };

  const handleHoverCardEnter = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
    }
  };

  const handleHoverCardLeave = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
    }
    hideTimer.current = setTimeout(() => {
      setIsHovered(false);
    }, 200);
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative rounded-xl overflow-hidden shadow-lg 
                 bg-secondaryBg cursor-pointer transition-transform duration-300 ease-in-out
                 transform"
    >
      <Link href={linkHref} passHref>
        <div className="relative w-full h-auto pb-[150%] bg-gray-700">
          <Image
            src={imageUrl}
            alt={displayTitle}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            priority={false}
          />
          {voteAverage && voteAverage > 0 && (
            <div className="absolute top-2 right-2 flex items-center bg-accentPurple text-textLight px-2 py-1 rounded-md text-sm font-semibold z-10">
              <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
              {rating}
            </div>
          )}
        </div>
      </Link>

      <div className="p-3 text-center">
        <h3 className="text-textLight text-md md:text-lg font-semibold truncate">
          {displayTitle}
        </h3>
      </div>

      {isHovered && content && (
        <HoverCard
          item={content}
          contentType={type as 'movie' | 'tv'}
          position={hoverPosition}
          genres={genres}
          onMouseEnter={handleHoverCardEnter}
          onMouseLeave={handleHoverCardLeave}
        />
      )}
    </div>
  );
};

export default MovieCard;