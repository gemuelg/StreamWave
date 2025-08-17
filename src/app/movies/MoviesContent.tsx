// src/app/movies/MoviesContent.tsx
"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import { Movie, Genre } from '@/lib/tmdb';
import { useRouter, useSearchParams } from 'next/navigation';
import ContentList from '@/components/ContentList';
import { Filters } from '@/components/ui/filters';

interface MoviesContentProps {
  initialMovies: Movie[];
  initialTotalPages: number;
  genres: Genre[];
  currentPage: number;
}

// Define the sort options specific to movies
const movieSortOptions = [
  { name: 'Trending', value: 'popularity.desc' },
  { name: 'Release Date', value: 'primary_release_date.desc' },
  { name: 'Name A-Z', value: 'title.asc' },
];

export default function MoviesContent({
  initialMovies,
  initialTotalPages,
  genres,
  currentPage,
}: MoviesContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageClick = (pageNumber: number | string) => {
    if (typeof pageNumber !== 'number') return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', pageNumber.toString());
    router.push(`/movies?${params.toString()}`);
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
                <span>Movies</span>
              </span>
            </h1>
            {/* Pass the movie specific sort options to the Filters component */}
            <Filters genres={genres} mediaType="movie" sortOptions={movieSortOptions} />
          </div>
          
          <ContentList
            content={initialMovies}
            mediaType="movie"
            totalPages={initialTotalPages}
            currentPage={currentPage}
            onPageClick={handlePageClick}
          />
        </div>
      </main>
      <footer className="w-full py-4 text-center text-textMuted text-sm bg-primaryBg border-t border-gray-800 mt-auto">
        &copy; {new Date().getFullYear()} Stream Wave. All rights reserved. Data provided by TMDB.
      </footer>
    </div>
  );
}