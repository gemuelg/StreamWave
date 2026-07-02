"use client";

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getImageUrl, Movie, TVShow, MultiSearchResultItem } from '@/lib/tmdb';
import { StarIcon } from '@heroicons/react/24/solid';
import HoverCard from './HoverCard';

interface MovieCardProps {
  id?: number;
  title?: string;
  posterPath?: string | null;
  voteAverage?: number;
  type?: 'movie' | 'tv';
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
      className="relative rounded-lg overflow-hidden bg-transparent cursor-pointer transition-all duration-500 ease-out group/card w-full"
    >
      {/* PREMIUM SMOOTH CARD FRAME */}
      <Link href={linkHref} passHref prefetch={false}>
        <div className="relative w-full h-auto pb-[150%] bg-zinc-900 overflow-hidden rounded-lg shadow-md group-hover/card:shadow-xl transition-shadow duration-500">
          <Image
            src={imageUrl}
            alt={displayTitle}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover/card:scale-104"
            priority={false}
          />
          
          {/* FLOATING GLASS RATING BADGE */}
          {voteAverage !== undefined && voteAverage > 0 && (
            <div className="absolute top-2.5 right-2.5 flex items-center bg-[#040406]/70 backdrop-blur-md text-white px-2 py-1 rounded-md text-xs font-medium tracking-normal z-10 border border-white/10 shadow-sm opacity-90 group-hover/card:opacity-100 transition-opacity duration-300">
              <StarIcon className="w-3 h-3 text-amber-400 mr-1 fill-current" />
              {rating}
            </div>
          )}
        </div>
      </Link>

      {/* MINIMALIST COMPACT FOOTER */}
      <div className="pt-2.5 pb-1 px-1 text-left">
        <h3 className="text-zinc-300 text-xs sm:text-sm font-medium tracking-wide truncate transition-colors duration-300 group-hover/card:text-white">
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