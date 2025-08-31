// src/components/HomeContent.tsx
"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import ContentCarousel from '@/components/ContentCarousel';
import HomeHero from '@/components/HomeHero'; 
import { Movie, TVShow } from '@/lib/tmdb';

interface HomeContentProps {
  trendingMovies: Movie[];
  nowPlayingMovies: Movie[];
  trendingTVShows: TVShow[];
  onTheAirTVShows: TVShow[];
}

export default function HomeContent({
  trendingMovies,
  nowPlayingMovies,
  trendingTVShows,
  onTheAirTVShows,
}: HomeContentProps) {

  return (
    <div className="min-h-screen flex flex-col bg-primaryBg text-textLight">
      <Navbar />
      
      <main className="flex-grow pt-20">
        <HomeHero content={trendingMovies} contentType="movie" />

        <ContentCarousel title="Latest Movies" content={nowPlayingMovies} contentType="movie" />
        <ContentCarousel title="Latest TV Shows" content={onTheAirTVShows} contentType="tv" />
        <ContentCarousel title="Popular Movies" content={trendingMovies} contentType="movie" />
        <ContentCarousel title="Popular TV Shows" content={trendingTVShows} contentType="tv" />
      </main>

      <footer className="w-full py-4 text-center text-textMuted text-sm bg-primaryBg border-t border-gray-800 mt-8">
        &copy; {new Date().getFullYear()} Stream Wave. All rights reserved.
      </footer>
    </div>
  );
}