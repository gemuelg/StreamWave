// src/app/tv/TVContent.tsx
"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import { TVShow, Genre } from '@/lib/tmdb';
import { useRouter, useSearchParams } from 'next/navigation';
import ContentList from '@/components/ContentList';
import { Filters } from '@/components/ui/filters';

interface TVContentProps {
  initialTVShows: TVShow[];
  initialTotalPages: number;
  genres: Genre[];
  currentPage: number;
}

// Define the sort options specific to TV shows
const tvSortOptions = [
  { name: 'Trending', value: 'popularity.desc' },
  { name: 'Release Date', value: 'first_air_date.desc' },
  { name: 'Name A-Z', value: 'name.asc' },
];

export default function TVContent({
  initialTVShows,
  initialTotalPages,
  genres,
  currentPage,
}: TVContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageClick = (pageNumber: number | string) => {
    if (typeof pageNumber !== 'number') return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', pageNumber.toString());
    router.push(`/tv?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-primaryBg text-textLight">
      <Navbar />
      <main className="flex-grow pt-20">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex justify-between items-center my-8">
            <h1 className="text-2xl md:text-4xl font-bold text-textLight">
              <span className="flex items-center gap-2">
                <span className="h-8 w-2 bg-accentBlue rounded-full"></span>
                <span>TV Shows</span>
              </span>
            </h1>
            {/* Pass the TV show specific sort options to the Filters component */}
            <Filters genres={genres} mediaType="tv" sortOptions={tvSortOptions} />
          </div>
          
          <ContentList
            content={initialTVShows}
            mediaType="tv"
            totalPages={initialTotalPages}
            currentPage={currentPage}
            onPageClick={handlePageClick}
          />
        </div>
      </main>
      <footer className="w-full py-4 text-center text-textMuted text-sm bg-primaryBg border-t border-gray-800 mt-auto">
        &copy; {new Date().getFullYear()} Stream Wave. All rights reserved.
      </footer>
    </div>
  );
}