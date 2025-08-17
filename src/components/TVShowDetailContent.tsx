// src/components/TVShowDetailContent.tsx
"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { getImageUrl, getYouTubeWatchUrl, TVShowDetails, TVShow, CastMember, CrewMember } from '@/lib/tmdb';
import MovieCard from '@/components/MovieCard';
import { ClockIcon, StarIcon, UserIcon, PlayCircleIcon } from '@heroicons/react/24/outline';

interface TVShowDetailContentProps {
  tvShow: TVShowDetails;
  videoKey: string | null;
  recommendations: TVShow[];
  creators: CrewMember[] | undefined;
  cast: CastMember[] | undefined;
}

export default function TVShowDetailContent({
  tvShow,
  videoKey,
  recommendations,
  creators,
  cast,
}: TVShowDetailContentProps) {
  
  // Helper for rendering a person's card
  const renderPersonCard = (person: { id: number, name: string, profile_path?: string | null, character?: string, job?: string }) => (
    <div key={person.id} className="flex-shrink-0 w-24 sm:w-32 text-center">
      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden mx-auto bg-secondaryBg flex items-center justify-center">
        {person.profile_path ? (
          <Image
            src={getImageUrl(person.profile_path, 'w185')}
            alt={person.name}
            width={128}
            height={128}
            className="object-cover w-full h-full"
            priority={false}
          />
        ) : (
          <UserIcon className="h-16 w-16 text-textMuted" />
        )}
      </div>
      <p className="mt-2 text-sm font-semibold truncate">{person.name}</p>
      {person.character && <p className="text-xs text-textMuted truncate">{person.character}</p>}
      {person.job && <p className="text-xs text-textMuted truncate">{person.job}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-primaryBg text-textLight">
      <Navbar />
      <main className="relative pt-16">
        {/* Hero Section with Backdrop */}
        <div className="absolute inset-0 z-0 h-[80vh] md:h-[90vh] lg:h-screen">
          {tvShow.backdrop_path ? (
            <Image
              src={getImageUrl(tvShow.backdrop_path)}
              alt={tvShow.name}
              fill
              style={{ objectFit: 'cover' }}
              className="absolute inset-0 transition-opacity duration-300"
              priority
            />
          ) : (
            <div className="bg-gray-800 w-full h-full"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-primaryBg via-primaryBg/50 to-transparent"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 md:px-8 lg:px-12 pt-32 md:pt-48 pb-16">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-8 md:space-y-0 md:space-x-10">
            {/* Poster Image */}
            <div className="flex-shrink-0 w-56 h-auto transition-transform duration-300 transform hover:scale-105">
              {tvShow.poster_path ? (
                <Image
                  src={getImageUrl(tvShow.poster_path)}
                  alt={tvShow.name}
                  width={224}
                  height={336}
                  className="rounded-lg shadow-2xl" 
                  priority
                />
              ) : (
                <div className="w-56 h-84 bg-secondaryBg rounded-lg flex items-center justify-center text-textMuted text-center p-4 shadow-lg">
                  No Poster Available
                </div>
              )}
            </div>

            {/* Main Details */}
            <div className="text-center md:text-left mt-4 md:mt-0">
              <h1 className="text-4xl md:text-6xl font-extrabold mb-2 text-white drop-shadow-md">{tvShow.name}</h1>
              <p className="text-textMuted text-lg md:text-xl font-medium mb-4 italic">{tvShow.tagline}</p>
              
              <div className="flex justify-center md:justify-start items-center gap-4 text-sm md:text-base">
                <span className="flex items-center gap-1 text-yellow-400 font-semibold">
                  <StarIcon className="h-5 w-5" />
                  {tvShow.vote_average.toFixed(1)}
                </span>
                <span className="flex items-center gap-1 text-textMuted">
                  <ClockIcon className="h-5 w-5" />
                  {tvShow.episode_run_times?.[0] ? `${tvShow.episode_run_times[0]} min` : 'N/A'}
                </span>
              </div>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                {tvShow.genres.map((genre) => (
                  <span key={genre.id} className="bg-secondaryBg text-textLight px-3 py-1 rounded-full text-xs font-semibold">
                    {genre.name}
                  </span>
                ))}
              </div>

              <div className="flex justify-center md:justify-start gap-4 mt-6">
                <Link
                    href={`/watch/tv/${tvShow.id}`}
                    className="bg-transparent text-white px-6 py-3 rounded-full font-bold text-lg flex items-center gap-2 hover:bg-accentDark transition-colors duration-200"
                >
                <PlayCircleIcon className="h-6 w-6" />
                  Watch Now
                </Link>
                {videoKey && (
                  <a
                  href={getYouTubeWatchUrl(videoKey)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-secondaryBg text-textLight px-6 py-3 rounded-full font-bold text-lg flex items-center gap-2 hover:bg-secondaryBgDark transition-colors duration-200"
                  >
                  View Trailer
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <div>
              <h2 className="text-2xl font-bold mb-4 border-b border-secondaryBg pb-2">Overview</h2>
              <p className="text-textMuted leading-relaxed">{tvShow.overview}</p>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold mb-4 border-b border-secondaryBg pb-2">Show Info</h3>
              <div className="space-y-2 text-textMuted text-sm md:text-base">
                <p><strong>Status:</strong> {tvShow.status}</p>
                <p><strong>Original Language:</strong> {tvShow.original_language?.toUpperCase()}</p>
                {tvShow.first_air_date && <p><strong>First Aired:</strong> {new Date(tvShow.first_air_date).toLocaleDateString()}</p>}
                <p><strong>Seasons:</strong> {tvShow.number_of_seasons}</p>
                <p><strong>Episodes:</strong> {tvShow.number_of_episodes}</p>
                {creators && creators.length > 0 && (
                  <p><strong>Created by:</strong> {creators.map(c => c.name).join(', ')}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Cast Section - Horizontally Scrollable */}
          {cast && cast.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-4 border-b border-secondaryBg pb-2">Top Cast</h2>
              <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide">
                {cast.map(renderPersonCard)}
              </div>
            </div>
          )}

          {/* Recommendations Section */}
          {recommendations && recommendations.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-4 border-b border-secondaryBg pb-2">More Like This</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {recommendations.map((rec) => (
                  <MovieCard
                    key={rec.id}
                    id={rec.id}
                    title={rec.name}
                    posterPath={rec.poster_path}
                    voteAverage={rec.vote_average}
                    type="tv"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}