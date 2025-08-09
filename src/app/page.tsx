// src/app/page.tsx

"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ContentCarousel from '@/components/ContentCarousel';
import Navbar from '@/components/Navbar';
import {
  getTrendingMovies,
  getTrendingTVShows,
  getNowPlayingMovies,
  getOnTheAirTVShows,
  getImageUrl,
  Movie,
  TVShow
} from '@/lib/tmdb';

type FeaturedContent = (Movie | TVShow) & { type: 'movie' | 'tv' };

export default function HomePage() {
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [trendingTVShows, setTrendingTVShows] = useState<TVShow[]>([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState<Movie[]>([]);
  const [onTheAirTVShows, setOnTheAirTVShows] = useState<TVShow[]>([]);
  const [featuredContent, setFeaturedContent] = useState<FeaturedContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          movies,
          tvShows,
          nowPlaying,
          onTheAir
        ] = await Promise.all([
          getTrendingMovies(),
          getTrendingTVShows(),
          getNowPlayingMovies(),
          getOnTheAirTVShows(),
        ]);

        setTrendingMovies(movies);
        setTrendingTVShows(tvShows);
        setNowPlayingMovies(nowPlaying);
        setOnTheAirTVShows(onTheAir);

        if (movies.length > 0) {
          setFeaturedContent({ ...movies[0], type: 'movie' });
        } else if (tvShows.length > 0) {
          setFeaturedContent({ ...tvShows[0], type: 'tv' });
        } else if (nowPlaying.length > 0) {
          setFeaturedContent({ ...nowPlaying[0], type: 'movie' });
        } else if (onTheAir.length > 0) {
          setFeaturedContent({ ...onTheAir[0], type: 'tv' });
        }
      } catch (err) {
        console.error("Error fetching homepage data:", err);
        setError("Failed to load content. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primaryBg text-textLight">
        <p>Loading content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primaryBg text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-primaryBg text-textLight">
      <Navbar />
      
      <main className="flex-grow pt-20">
        {featuredContent && (
          <section className="relative w-full h-[55vh] md:h-[75vh] lg:h-[85vh] overflow-hidden flex items-end">
            <Image
              src={getImageUrl(featuredContent.backdrop_path, 'original')}
              alt={featuredContent.type === 'movie' ? (featuredContent as Movie).title : (featuredContent as TVShow).name}
              fill
              objectFit="cover"
              className="absolute inset-0 z-0 opacity-30 object-center"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primaryBg via-primaryBg/70 to-transparent z-10"></div>
            <div className="relative z-20 w-full px-6 md:px-12 lg:px-20 py-10 md:py-16">
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-textLight mb-4 drop-shadow-lg leading-tight">
                {featuredContent.type === 'movie' ? (featuredContent as Movie).title : (featuredContent as TVShow).name}
              </h2>
              <p className="text-textLight text-base md:text-lg mb-6 max-w-2xl line-clamp-3">
                {featuredContent.overview || "No overview available."}
              </p>
              <Link
                href={`/${featuredContent.type === 'movie' ? 'movies' : 'tv'}/${featuredContent.id}`}
                className="inline-flex items-center px-8 py-4 bg-accentBlue text-textLight text-xl font-bold rounded-lg
                           hover:bg-accentPurple transition-colors duration-300 shadow-xl"
              >
                Watch Now
                <svg className="ml-3 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </Link>
            </div>
          </section>
        )}
        
        <ContentCarousel title="Latest Movies" content={nowPlayingMovies} contentType="movie" />
        <ContentCarousel title="Latest TV Shows" content={onTheAirTVShows} contentType="tv" />
        <ContentCarousel title="Popular Movies" content={trendingMovies} contentType="movie" />
        <ContentCarousel title="Popular TV Shows" content={trendingTVShows} contentType="tv" />
      </main>

      <footer className="w-full py-4 text-center text-textMuted text-sm bg-primaryBg border-t border-gray-800 mt-8">
        &copy; {new Date().getFullYear()} Stream Wave. All rights reserved. Data provided by TMDB.
      </footer>
    </div>
  );
}