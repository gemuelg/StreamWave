// src/components/HomeContent.tsx
"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import ContentCarousel from '@/components/ContentCarousel';
import HomeHero from '@/components/HomeHero';
import PlatformHero from '@/components/PlatformHero';
import { Movie, TVShow, Genre } from '@/lib/tmdb';

// Add the new genres prop to the interface
interface HomeContentProps {
  trendingMovies: Movie[];
  nowPlayingMovies: Movie[];
  trendingTVShows: TVShow[];
  onTheAirTVShows: TVShow[];
  genres: Genre[]; // <--- THIS LINE IS ADDED
  netflixMovies: Movie[];
  huluTVShows: TVShow[];
  huluMovies: Movie[];
  disneyPlusMovies: Movie[];
  amazonPrimeMovies: Movie[];
  hboMaxMovies: Movie[];
  amazonPrimeTVShows: TVShow[];
  hboMaxTVShows: TVShow[];
  netflixTVShows: TVShow[];
  disneyPlusTVShows: TVShow[];
  forYouMedia: (Movie | TVShow)[];
}

export default function HomeContent({
  trendingMovies,
  nowPlayingMovies,
  trendingTVShows,
  onTheAirTVShows,
  genres, // <--- THIS LINE IS ADDED
  netflixMovies,
  huluTVShows,
  disneyPlusMovies,
  amazonPrimeMovies,
  hboMaxMovies,
  amazonPrimeTVShows,
  hboMaxTVShows,
  netflixTVShows,
  huluMovies,
  disneyPlusTVShows,
  forYouMedia,
}: HomeContentProps) {

  return (
    <div className="min-h-screen flex flex-col bg-primaryBg text-textLight">
      <Navbar />

      <main className="flex-grow pt-10">
        <HomeHero content={trendingMovies} contentType="movie" />

        {/* PERSONALIZED RECOMMENDATIONS */}
        {forYouMedia.length > 0 && (
          <ContentCarousel title="For You" content={forYouMedia} contentType="mixed" allGenres={genres} />
        )}

        {/* General Content Carousels */}
        {nowPlayingMovies.length > 0 && (
          <ContentCarousel title="Latest Movies" content={nowPlayingMovies} contentType="movie" allGenres={genres} />
        )}
        {onTheAirTVShows.length > 0 && (
          <ContentCarousel title="Latest TV Shows" content={onTheAirTVShows} contentType="tv" allGenres={genres} />
        )}
        {trendingMovies.length > 0 && (
          <ContentCarousel title="Popular Movies" content={trendingMovies} contentType="movie" allGenres={genres} />
        )}
        {trendingTVShows.length > 0 && (
          <ContentCarousel title="Popular TV Shows" content={trendingTVShows} contentType="tv" allGenres={genres} />
        )}

        {/* GROUPED BY STREAMING PLATFORM */}
        {(netflixMovies.length > 0 || netflixTVShows.length > 0) && (
          <div className="mt-8">
            <PlatformHero content={[...netflixMovies.slice(0, 1), ...netflixTVShows.slice(0, 2)]} />
            {netflixMovies.length > 0 && (
              <ContentCarousel title="Latest on Netflix" content={netflixMovies} contentType="movie" allGenres={genres} />
            )}
            {netflixTVShows.length > 0 && (
              <ContentCarousel title="Latest TV Shows on Netflix" content={netflixTVShows} contentType="tv" allGenres={genres} />
            )}
          </div>
        )}

        {(huluMovies.length > 0 || huluTVShows.length > 0) && (
          <div className="mt-8">
            <PlatformHero content={[...huluMovies.slice(0, 1), ...huluTVShows.slice(0, 2)]} />
            {huluMovies.length > 0 && (
              <ContentCarousel title="Latest on Hulu" content={huluMovies} contentType="movie" allGenres={genres} />
            )}
            {huluTVShows.length > 0 && (
              <ContentCarousel title="Latest TV Shows on Hulu" content={huluTVShows} contentType="tv" allGenres={genres} />
            )}
          </div>
        )}

        {(disneyPlusMovies.length > 0 || disneyPlusTVShows.length > 0) && (
          <div className="mt-8">
            <PlatformHero content={[...disneyPlusMovies.slice(0, 1), ...disneyPlusTVShows.slice(0, 2)]} />
            {disneyPlusMovies.length > 0 && (
              <ContentCarousel title="Latest on Disney+" content={disneyPlusMovies} contentType="movie" allGenres={genres} />
            )}
            {disneyPlusTVShows.length > 0 && (
              <ContentCarousel title="Latest TV Shows on Disney+" content={disneyPlusTVShows} contentType="tv" allGenres={genres} />
            )}
          </div>
        )}
        
        {(amazonPrimeMovies.length > 0 || amazonPrimeTVShows.length > 0) && (
          <div className="mt-8">
            <PlatformHero content={[...amazonPrimeMovies.slice(0, 1), ...amazonPrimeTVShows.slice(0, 2)]} />
            {amazonPrimeMovies.length > 0 && (
              <ContentCarousel title="Latest on Amazon Prime" content={amazonPrimeMovies} contentType="movie" allGenres={genres} />
            )}
            {amazonPrimeTVShows.length > 0 && (
              <ContentCarousel title="Latest TV Shows on Prime" content={amazonPrimeTVShows} contentType="tv" allGenres={genres} />
            )}
          </div>
        )}
        
        {(hboMaxMovies.length > 0 || hboMaxTVShows.length > 0) && (
          <div className="mt-8">
            <PlatformHero content={[...hboMaxMovies.slice(0, 1), ...hboMaxTVShows.slice(0, 2)]} />
            {hboMaxMovies.length > 0 && (
              <ContentCarousel title="Latest on Max" content={hboMaxMovies} contentType="movie" allGenres={genres} />
            )}
            {hboMaxTVShows.length > 0 && (
              <ContentCarousel title="Latest TV Shows on Max" content={hboMaxTVShows} contentType="tv" allGenres={genres} />
            )}
          </div>
        )}
      </main>
      <footer className="w-full py-4 text-center text-textMuted text-sm bg-primaryBg border-t border-gray-800 mt-8">
        &copy; {new Date().getFullYear()} Stream Wave. All rights reserved.
      </footer>
    </div>
  );
}