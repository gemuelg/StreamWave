// src/components/WatchlistCard.tsx
import React from 'react';
import Image from 'next/image';
import { Movie, TVShow } from '@/lib/tmdb';
import Link from 'next/link';
import { TrashIcon, StarIcon } from '@heroicons/react/24/solid';

// A simple utility to get the correct URL path
const getMediaPath = (type: string) => {
    switch (type) {
        case 'movie':
            return 'movies';
        case 'tv':
            return 'tv';
        default:
            return '';
    }
};

const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'text-green-400';
    if (rating >= 6) return 'text-yellow-400';
    return 'text-red-400';
};

interface WatchlistCardProps {
    item: Movie | TVShow;
    onRemove: () => void;
}

const WatchlistCard: React.FC<WatchlistCardProps> = ({ item, onRemove }) => {
    const isMovie = 'title' in item;
    const title = isMovie ? item.title : item.name;
    const type = isMovie ? 'movie' : 'tv';

    const posterUrl = item.poster_path 
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
        : '/placeholder.jpg';

    return (
        <div className="relative group overflow-hidden rounded-lg shadow-lg transform transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-2xl h-full w-full">
            {/* CORRECTED LINE: Using the utility function to get the plural path */}
            <Link href={`/${getMediaPath(type)}/${item.id}`}>
                <div className="w-full h-full relative">
                    <Image
                        src={posterUrl}
                        alt={title || 'Media Poster'}
                        width={500}
                        height={750}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <h3 className="text-white text-lg font-bold line-clamp-1">{title}</h3>
                    <div className="flex items-center text-sm">
                        <StarIcon className={`w-4 h-4 mr-1 ${getRatingColor(item.vote_average)}`} />
                        <span className="text-gray-300">{item.vote_average.toFixed(1)}</span>
                    </div>
                </div>
            </Link>
            
            <button
                onClick={onRemove}
                className="absolute top-2 right-2 p-2 bg-red-600 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                aria-label={`Remove ${title} from watchlist`}
            >
                <TrashIcon className="w-5 h-5" />
            </button>
        </div>
    );
};

export default WatchlistCard;