// src/components/MovieCard.tsx

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getImageUrl, Movie, TVShow } from '@/lib/tmdb';
import StarIcon from '@heroicons/react/24/solid/StarIcon'; 

// Updated to be a flexible prop interface
interface MovieCardProps {
  // Option 1: Pass individual props (legacy support)
  id?: number;
  title?: string;
  posterPath?: string | null;
  voteAverage?: number;
  type?: 'movie' | 'tv';
  
  // Option 2: Pass a single content object (new, preferred method)
  content?: Movie | TVShow;
  contentType?: 'movie' | 'tv';
}

const MovieCard: React.FC<MovieCardProps> = (props) => {
  // Use the new content prop if available, otherwise fall back to individual props
  const id = props.content ? props.content.id : props.id;
  const title = props.content ? (props.contentType === 'movie' ? (props.content as Movie).title : (props.content as TVShow).name) : props.title;
  const posterPath = props.content ? props.content.poster_path : props.posterPath;
  const voteAverage = props.content ? props.content.vote_average : props.voteAverage;
  const type = props.content ? props.contentType : props.type;

  // Handle cases where data is missing
  if (!id || !posterPath) {
    return null;
  }
  
  const displayTitle = title || "Untitled";
  const imageUrl = getImageUrl(posterPath, 'w500');
  const rating = voteAverage ? voteAverage.toFixed(1) : 'N/A';

  // CORRECTED LINE: Change the link to point to the /movies and /tv pages
  const linkHref = `/${type === 'movie' ? 'movies' : 'tv'}/${id}`;

  return (
    <Link href={linkHref} passHref>
      <div className="relative group rounded-xl overflow-hidden shadow-lg hover:shadow-2xl
                       bg-secondaryBg cursor-pointer transition-transform duration-300 ease-in-out
                       hover:scale-105 transform">
        {/* Image Section */}
        <div className="relative w-full h-auto pb-[150%] bg-gray-700">
          <Image
            src={imageUrl}
            alt={displayTitle}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: 'cover' }}
            className="transition-opacity duration-300 group-hover:opacity-80"
            priority={false}
          />
          {/* Optional: Overlay for rating */}
          {voteAverage && voteAverage > 0 && (
            <div className="absolute top-2 right-2 flex items-center bg-accentPurple text-textLight px-2 py-1 rounded-md text-sm font-semibold z-10">
              <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
              {rating}
            </div>
          )}
        </div>

        {/* Content Section (Title) */}
        <div className="p-3 text-center">
          <h3 className="text-textLight text-md md:text-lg font-semibold truncate mb-1">
            {displayTitle}
          </h3>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;