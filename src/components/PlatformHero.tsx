"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getImageUrl, Movie, TVShow } from '@/lib/tmdb';
import { PlayIcon } from '@heroicons/react/24/solid';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';

interface PlatformHeroProps {
  content: (Movie | TVShow)[];
}

const getTitle = (content: Movie | TVShow): string => {
  if ('title' in content) {
    return content.title || '';
  }
  if ('name' in content) {
    return content.name || '';
  }
  return '';
};

const getOverview = (content: Movie | TVShow): string => {
  return content.overview || 'No overview available.';
};

const getReleaseYear = (item: Movie | TVShow) => {
  const date = 'release_date' in item ? item.release_date : item.first_air_date;
  return date ? new Date(date).getFullYear() : 'N/A';
};

const getRating = (item: Movie | TVShow) => {
  return item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
};

const getType = (item: Movie | TVShow) => {
  return 'title' in item ? 'movie' : 'tv';
};

export default function PlatformHero({ content }: PlatformHeroProps) {
  if (!content || content.length === 0) {
    return null;
  }

  return (
    <section className="relative w-full h-[56.25vw] min-h-[550px] max-h-[800px] lg:h-[85vh] overflow-hidden select-none bg-[#040406]">
      <Swiper
        modules={[Autoplay, EffectFade]}
        effect="fade"
        fadeEffect={{
          crossFade: true
        }}
        slidesPerView={1}
        loop={true}
        autoplay={{
          delay: 6000,
          disableOnInteraction: false,
        }}
        className="w-full h-full"
      >
        {content.map((item) => (
          <SwiperSlide key={item.id} className="relative w-full h-full">
            
            {/* BACKGROUND CANVAS WITH COMPREHENSIVE MULTI-AXIS BLENDING */}
            <div className="absolute inset-0 z-0">
              <Image
                src={getImageUrl(item.backdrop_path, 'original')}
                alt={getTitle(item)}
                fill
                style={{ objectFit: 'cover' }}
                priority
                className="object-top"
              />
              
              {/* NEW - Top Bleed Fade: Melts the top asset boundary into your dark #040406 canvas/navbar area */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#040406] via-[#040406]/30 to-transparent z-[2]" />
              
              {/* Right Edge Horizon Fade: Secures text contrast and readability */}
              <div className="absolute inset-0 bg-gradient-to-l from-[#040406] via-[#040406]/45 to-transparent z-[2]" />
              
              {/* Bottom Bleed Fade: Eliminates seams with content rows beneath */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#040406] via-[#040406]/10 to-transparent z-[2]" />
              
              {/* Base ambient lighting filter */}
              <div className="absolute inset-0 bg-black/10 z-[1]" />
            </div>

            {/* RIGHT-ALIGNED CONTENT LAYOUT CONTAINER */}
            <div className="relative z-10 flex items-center w-full h-full px-4 sm:px-8 md:px-[4%] lg:px-[4%] text-white justify-end">
              <div className="w-full max-w-xl md:max-w-2xl flex flex-col items-end pt-20 md:pt-28 lg:pt-36 text-right">
                
                {/* HERO TITLE */}
                <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-4 tracking-tighter leading-[1.05] text-white font-sans uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
                  {getTitle(item)}
                </h1>
                
                {/* METADATA METRICS BAR */}
                <div className="flex items-center justify-end space-x-3 mb-4 text-xs sm:text-sm md:text-base font-bold text-white drop-shadow-md">
                  <span className="text-emerald-400 tracking-tight font-sans">
                    {Math.round((item.vote_average || 7) * 10)}% Match
                  </span>
                  <span className="text-zinc-300 font-normal">
                    {getReleaseYear(item)}
                  </span>
                  <span className="flex items-center justify-center bg-transparent border border-zinc-500/60 px-1.5 py-0.5 rounded text-[10px] tracking-widest text-zinc-300 font-mono scale-90">
                    HD
                  </span>
                  <span className="text-zinc-300 font-medium tracking-tight text-xs bg-zinc-800/40 px-2 py-0.5 rounded border border-white/5">
                    ★ {getRating(item)}
                  </span>
                </div>
                
                {/* PLOT OVERVIEW BLOCK */}
                <p className="text-xs sm:text-sm md:text-base lg:text-lg text-[#e5e5e5] font-normal leading-normal md:leading-relaxed mb-6 line-clamp-3 md:line-clamp-3 max-w-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-sans">
                  {getOverview(item)}
                </p>

                {/* CALL TO ACTION BUTTON */}
                <Link
                  href={`/${getType(item) === 'movie' ? 'movies' : 'tv'}/${item.id}`}
                  className="inline-flex items-center justify-center px-7 py-2 md:px-8 md:py-3 bg-white text-black text-sm md:text-base font-extrabold rounded-md transition-all duration-200 hover:bg-white/80 active:scale-95 shadow-[0_4px_12px_rgba(0,0,0,0.3)] font-sans tracking-wide"
                >
                  <PlayIcon className="mr-3 w-5 h-5 md:w-6 md:h-6 text-black fill-current" />
                  Play Now
                </Link>

              </div>
            </div>

          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}