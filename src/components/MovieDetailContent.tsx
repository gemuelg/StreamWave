"use client";

import React from 'react'; 
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { getImageUrl, getYouTubeWatchUrl, MovieDetails, Movie, CastMember, CrewMember, Genre } from '@/lib/tmdb';
import MovieCard from '@/components/MovieCard';
import { ClockIcon, StarIcon, UserIcon, PlayIcon } from '@heroicons/react/24/solid';

interface MovieDetailContentProps {
  movie: MovieDetails;
  videoKey: string | null;
  recommendations: Movie[];
  director: CrewMember | undefined;
  writers: CrewMember[] | undefined;
  cast: CastMember[] | undefined;
  genresMap: Map<number, string>;
}

export default function MovieDetailContent({
  movie,
  videoKey,
  recommendations,
  director,
  writers,
  cast,
  genresMap,
}: MovieDetailContentProps) {

  // Premium, low-profile media card configuration for cast members
  const renderPersonCard = (person: { id: number, name: string, profile_path?: string | null, character?: string, job?: string }) => (
    <div key={person.id} className="flex-shrink-0 w-24 sm:w-28 text-center group/cast select-none">
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden mx-auto bg-zinc-900 border border-zinc-800/80 p-0.5 transition-transform duration-500 ease-out group-hover/cast:scale-105">
        {person.profile_path ? (
          <Image
            src={getImageUrl(person.profile_path, 'w185')}
            alt={person.name}
            width={96}
            height={96}
            className="object-cover w-full h-full rounded-full grayscale group-hover/cast:grayscale-0 transition-all duration-700"
            priority={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center rounded-full bg-zinc-900">
            <UserIcon className="h-8 w-8 text-zinc-600" />
          </div>
        )}
      </div>
      <p className="mt-3 text-xs font-medium text-zinc-300 truncate group-hover/cast:text-white transition-colors duration-300">
        {person.name}
      </p>
      {person.character && (
        <p className="text-[11px] text-zinc-500 truncate mt-0.5 tracking-normal">
          {person.character}
        </p>
      )}
    </div>
  );

  // SEO Structured Data Engine
  const movieSchema = {
    "@context": "http://schema.org",
    "@type": "Movie",
    "name": movie.title,
    "url": `https://www.streamwave.xyz/movies/${movie.id}`,
    "image": getImageUrl(movie.poster_path, 'w500'),
    "dateCreated": movie.release_date,
    "duration": movie.runtime ? `PT${movie.runtime}M` : undefined,
    "description": movie.overview,
    "genre": movie.genres.map(g => g.name),
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": movie.vote_average.toFixed(1),
      "reviewCount": movie.vote_count,
    },
    "director": director ? { "@type": "Person", "name": director.name } : undefined,
    "actor": cast?.map(member => ({ "@type": "Person", "name": member.name })) || [],
    ...(videoKey && {
      "trailer": {
        "@type": "VideoObject",
        "name": `Trailer for ${movie.title}`,
        "embedUrl": getYouTubeWatchUrl(videoKey).replace('watch?v=', 'embed/'),
        "thumbnailUrl": `https://img.youtube.com/vi/${videoKey}/hqdefault.jpg`,
        "uploadDate": movie.release_date,
      }
    }),
    "potentialAction": {
      "@type": "WatchAction",
      "target": {
        "@type": "EntryPoint",
        "url": `https://www.streamwave.xyz/watch/movie/${movie.id}`,
        "inLanguage": "en",
        "actionPlatform": [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform"
        ]
      }
    }
  };

  const imageUrl = movie.poster_path ? getImageUrl(movie.poster_path) : null;
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased overflow-x-hidden">
      {/* Structural Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(movieSchema) }}
      />

      <Navbar />
      
      <main className="relative w-full">
        {/* CINEMATIC HERO BACKGROUND BACKDROP */}
        <div className="absolute inset-0 z-0 h-[70vh] md:h-[85vh] lg:h-[95vh] w-full pointer-events-none select-none">
          {movie.backdrop_path ? (
            <div className="relative w-full h-full opacity-35 filter blur-[2px]">
              <Image
                src={getImageUrl(movie.backdrop_path)}
                alt=""
                fill
                className="object-cover object-top"
                priority
              />
            </div>
          ) : (
            <div className="bg-zinc-900/40 w-full h-full"></div>
          )}
          {/* Edge-Bleed Vignette Masking */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/20 via-transparent to-zinc-950/20"></div>
        </div>

        {/* CONTAINER FRAMEWORK */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-28 md:pt-40 lg:pt-48 pb-20">
          
          {/* HEADER HERO SPLITBLOCK */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12 lg:gap-16">
            
            {/* FLAT HIGH-SIGNAL POSTER SLEEVE */}
            <div className="flex-shrink-0 w-48 md:w-60 lg:w-64 aspect-[2/3] relative rounded-lg overflow-hidden bg-zinc-900 border border-white/5 shadow-2xl">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={movie.title}
                  fill
                  sizes="(max-width: 768px) 192px, 256px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs font-medium tracking-wider p-4 uppercase">
                  No Artwork Available
                </div>
              )}
            </div>

            {/* METADATA TRACK AND CONTROL GRID */}
            <div className="flex-1 text-center md:text-left flex flex-col justify-center h-full pt-2">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-white mb-2 leading-tight">
                {movie.title}
              </h1>
              
              {movie.tagline && (
                <p className="text-zinc-400 text-sm md:text-base font-normal tracking-wide italic mb-5 max-w-2xl">
                  "{movie.tagline}"
                </p>
              )}
              
              {/* COMPACT METADATA SEGMENTS */}
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-4 gap-y-2 text-xs md:text-sm text-zinc-400 font-medium tracking-normal">
                <span className="flex items-center gap-1 text-amber-400">
                  <StarIcon className="h-4 w-4 fill-current" />
                  {movie.vote_average > 0 ? movie.vote_average.toFixed(1) : 'N/A'}
                </span>
                <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
                <span className="flex items-center gap-1">
                  <ClockIcon className="h-4 w-4 stroke-2" />
                  {movie.runtime ? `${movie.runtime}m` : 'N/A'}
                </span>
                <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
                <span>{releaseYear}</span>
              </div>
              
              {/* REFINED EMBEDDED GENRE PILLS */}
              <div className="flex flex-wrap justify-center md:justify-start gap-1.5 mt-4">
                {movie.genres.map((genre) => (
                  <span 
                    key={genre.id} 
                    className="bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 text-zinc-300 px-2.5 py-0.5 rounded-md text-[11px] font-medium tracking-wide"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>

                    {/* ACTION MODULE SYSTEM */}
                    <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mt-8">
                      <Link
                        href={`/watch/movie/${movie.id}`}
                        className="group bg-zinc-100 hover:bg-zinc-200 text-zinc-950 px-6 py-2.5 rounded-md font-medium text-sm md:text-base flex items-center gap-2 transition-all duration-300 ease-out hover:scale-[1.02] active:scale-98 shadow-md hover:shadow-xl hover:shadow-white/5"
                        >
                        <PlayIcon className="h-4 w-4 fill-current transition-transform duration-300 ease-out group-hover:translate-x-0.5" />
                          Watch Now
                      </Link>
        
                    {videoKey && (
                      <a
                        href={getYouTubeWatchUrl(videoKey)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-zinc-900/40 border border-zinc-800/80 hover:bg-zinc-800/50 hover:border-zinc-700/80 text-zinc-200 px-5 py-2.5 rounded-md font-medium text-sm md:text-base flex items-center gap-2 transition-colors duration-200"
                      >
                      View Trailer
                      </a>
                    )}
              </div>
            </div>
          </div>

          {/* TWO-COLUMN PRODUCTION AND SYNOPSIS BREAKOUT */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 lg:gap-16 mt-16 pt-10 border-t border-zinc-900">
            <div className="md:col-span-2 space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                Synopsis
              </h2>
              <p className="text-zinc-300 text-sm md:text-base leading-relaxed font-normal max-w-3xl">
                {movie.overview || "No plot summary available for this title."}
              </p>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                Production Details
              </h2>
              <div className="space-y-2.5 text-xs md:text-sm text-zinc-400 border-l border-zinc-900 pl-4">
                {movie.release_date && (
                  <p className="flex justify-between md:flex-col lg:flex-row lg:items-center py-0.5">
                    <strong className="text-zinc-500 font-medium">Release Date</strong> 
                    <span className="text-zinc-300">{new Date(movie.release_date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                  </p>
                )}
                {director && (
                  <p className="flex justify-between md:flex-col lg:flex-row lg:items-center py-0.5 border-t border-zinc-900/50 md:border-t-0 lg:border-t lg:pt-2">
                    <strong className="text-zinc-500 font-medium">Director</strong> 
                    <span className="text-zinc-300 truncate max-w-[180px] md:max-w-none">{director.name}</span>
                  </p>
                )}
                {writers && writers.length > 0 && (
                  <p className="flex justify-between md:flex-col lg:flex-row lg:items-start py-0.5 border-t border-zinc-900/50 md:border-t-0 lg:border-t lg:pt-2">
                    <strong className="text-zinc-500 font-medium flex-shrink-0">Writers</strong> 
                    <span className="text-zinc-300 text-right md:text-left truncate max-w-[180px] md:max-w-none">
                      {writers.slice(0, 3).map(w => w.name).join(', ')}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* HORIZONTAL CAROUSEL SCROLLER FOR CAST MEMBERS */}
          {cast && cast.length > 0 && (
            <div className="mt-16 pt-10 border-t border-zinc-900">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-6">
                Principal Cast
              </h2>
              <div className="flex items-center overflow-x-auto space-x-5 pb-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent mask-image-right">
                {cast.slice(0, 12).map(renderPersonCard)}
              </div>
            </div>
          )}

          {/* RELATED GRID TRACK RECOMMENDATIONS */}
          {recommendations && recommendations.length > 0 && (
            <div className="mt-16 pt-10 border-t border-zinc-900">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-6">
                Recommended Titles
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
                {recommendations.slice(0, 6).map((rec) => (
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

      {/* MINIMALIST COMPACT FOOTER BOUNDARY */}
      <footer className="w-full py-6 text-center text-[11px] font-medium tracking-wider uppercase text-zinc-600 bg-zinc-950 border-t border-zinc-900/60">
        &copy; {new Date().getFullYear()} Stream Wave • Invisible Architecture
      </footer>
    </div>
  );
}