// src/components/MovieDetailContent.tsx
"use client";

import React, { useState, useEffect, useMemo } from 'react'; // ADD useMemo here
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
// IMPORT getMovieGenres and Genre
import { getImageUrl, getYouTubeWatchUrl, MovieDetails, Movie, TVShow, CastMember, CrewMember, getMovieGenres, Genre } from '@/lib/tmdb';
import MovieCard from '@/components/MovieCard';
import { ClockIcon, StarIcon, UserIcon, PlayCircleIcon } from '@heroicons/react/24/outline';

interface MovieDetailContentProps {
  movie: MovieDetails;
  videoKey: string | null;
  recommendations: Movie[];
  director: CrewMember | undefined;
  writers: CrewMember[] | undefined;
  cast: CastMember[] | undefined;
}

export default function MovieDetailContent({
  movie,
  videoKey,
  recommendations,
  director,
  writers,
  cast,
}: MovieDetailContentProps) {
  // --- ADD STATE FOR GENRES
  const [genres, setGenres] = useState<Genre[]>([]);

  // --- USEEFFECT TO FETCH GENRES ONCE
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const movieGenres = await getMovieGenres();
        setGenres(movieGenres);
      } catch (err) {
        console.error("Failed to fetch movie genres:", err);
      }
    };
    fetchGenres();
  }, []);

  // --- CREATE A MEMOIZED MAP FROM THE GENRES
  const genresMap = useMemo(() => {
    return new Map(genres.map(genre => [genre.id, genre.name]));
  }, [genres]);
  
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
 // --- 1. CONSTRUCT MOVIE SCHEMA OBJECT ---
  const movieSchema = {
    "@context": "http://schema.org",
    "@type": "Movie",
    "name": movie.title,
    "url": `https://www.streamwave.xyz/movies/${movie.id}`, // IMPORTANT: Change yourdomain.com
    "image": getImageUrl(movie.poster_path, 'w500'),
    "dateCreated": movie.release_date,
    "duration": movie.runtime ? `PT${movie.runtime}M` : undefined, // Format: PT[minutes]M
    "description": movie.overview,
    "genre": movie.genres.map(g => g.name),
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": movie.vote_average.toFixed(1),
      "reviewCount": movie.vote_count,
    },
    // Director
    "director": director ? { "@type": "Person", "name": director.name } : undefined,
    // Cast (Actors)
    "actor": cast?.map(member => ({ "@type": "Person", "name": member.name })) || [],
    // Trailer Link
    ...(videoKey && {
      "trailer": {
        "@type": "VideoObject",
        "name": `Trailer for ${movie.title}`,
        "embedUrl": getYouTubeWatchUrl(videoKey).replace('watch?v=', 'embed/'),
        "thumbnailUrl": `https://img.youtube.com/vi/${videoKey}/hqdefault.jpg`,
        "uploadDate": movie.release_date,
      }
    }),
    // Provide a URL for streaming/purchase, signaling it's available
    "potentialAction": {
      "@type": "WatchAction",
      "target": {
        "@type": "EntryPoint",
        "url": `https://www.streamwave.xyz/watch/movie/${movie.id}`, // IMPORTANT: Change yourdomain.com
        "inLanguage": "en",
        "actionPlatform": [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform"
        ]
      }
    }
  };
  return (
    <div className="min-h-screen bg-primaryBg text-textLight">
      <Navbar />
      <main className="relative pt-16">
        {/* Hero Section with Backdrop */}
        <div className="absolute inset-0 z-0 h-[80vh] md:h-[90vh] lg:h-screen">
          {movie.backdrop_path ? (
            <Image
              src={getImageUrl(movie.backdrop_path)}
              alt={movie.title}
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
              {movie.poster_path ? (
                <Image
                  src={getImageUrl(movie.poster_path)}
                  alt={movie.title}
                  width={224}
                  height={336}
                  className="rounded-lg"
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
              <h1 className="text-4xl md:text-6xl font-extrabold mb-2 text-white drop-shadow-md">{movie.title}</h1>
              <p className="text-textMuted text-lg md:text-xl font-medium mb-4 italic">{movie.tagline}</p>
              
              <div className="flex justify-center md:justify-start items-center gap-4 text-sm md:text-base">
                <span className="flex items-center gap-1 text-yellow-400 font-semibold">
                  <StarIcon className="h-5 w-5" />
                  {movie.vote_average.toFixed(1)}
                </span>
                <span className="flex items-center gap-1 text-textMuted">
                  <ClockIcon className="h-5 w-5" />
                  {movie.runtime ? `${movie.runtime} min` : 'N/A'}
                </span>
              </div>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                {movie.genres.map((genre) => (
                  <span key={genre.id} className="bg-secondaryBg text-textLight px-3 py-1 rounded-full text-xs font-semibold">
                    {genre.name}
                  </span>
                ))}
              </div>

                {/* WATCH NOW AND VIEW TRAILER BUTTONS */}
              <div className="flex justify-center md:justify-start gap-4 mt-6">
                <Link
                  href={`/watch/movie/${movie.id}`}
                  className="text-white px-2 py-3 rounded-full font-bold text-lg flex items-center gap-2 hover:bg-accent transition-colors duration-200"
                >
                  <PlayCircleIcon className="h-6 w-6" />
                  Watch Now
                </Link>
                {videoKey && (
                  <a
                    href={getYouTubeWatchUrl(videoKey)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-textLight px-6 py-3 rounded-full font-bold text-lg flex items-center gap-2 hover:bg-secondaryBg transition-colors duration-200"
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
              <p className="text-textMuted leading-relaxed">{movie.overview}</p>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold mb-4 border-b border-secondaryBg pb-2">Movie Info</h3>
              <div className="space-y-2 text-textMuted text-sm md:text-base">
                {movie.release_date && <p><strong>Release Date:</strong> {new Date(movie.release_date).toLocaleDateString()}</p>}
                {movie.runtime && <p><strong>Runtime:</strong> {movie.runtime} min</p>}
                {director && (
                  <p><strong>Director:</strong> {director.name}</p>
                )}
                {writers && writers.length > 0 && (
                  <p><strong>Writers:</strong> {writers.map(w => w.name).join(', ')}</p>
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
                  // --- UPDATED MOVIECARD TO PASS ALL REQUIRED PROPS
                  <MovieCard
                    key={rec.id}
                    content={rec}
                    contentType="movie"
                    genresMap={genresMap}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <footer className="w-full py-4 text-center text-textMuted text-sm bg-primaryBg border-t border-gray-800 mt-8">
        &copy; {new Date().getFullYear()} Stream Wave. All rights reserved.
    </footer>
    </div>
  );
}