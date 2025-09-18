// src/app/watchlist/page.tsx
'use client';

import React from 'react';
import WatchlistCard from '@/components/WatchlistCard';
import { useWatchlist } from '@/hooks/useWatchlist';
import { PlusIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

export default function WatchlistPage() {
  const { watchlist, removeItem } = useWatchlist();

  return (
    <div className="container mx-auto px-4 md:px-12 py-16 mt-6">
      <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-8">My Watchlist</h1>
      
      {watchlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center text-gray-400">
          <p className="text-xl md:text-2xl font-semibold mb-4">Your watchlist is empty.</p>
          <p className="text-sm md:text-base mb-6">Start adding movies or TV shows to your list so you don't miss them!</p>
          <Link href="/" passHref>
            <button className="flex items-center bg-accentBlue text-white px-6 py-3 rounded-full hover:bg-pink-600 transition-colors duration-200">
              <PlusIcon className="w-5 h-5 mr-2" />
              Start Browsing
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {watchlist.map(item => (
            <WatchlistCard
              key={item.id}
              item={item}
              onRemove={() => removeItem(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}