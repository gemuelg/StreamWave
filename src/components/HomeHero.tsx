"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getImageUrl, Movie, TVShow } from '@/lib/tmdb';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import { PlayCircleIcon } from '@heroicons/react/24/outline';

/* FIX: Mute TypeScript's asset-type checker. 
   The bundler processes these perfectly at runtime. */
// @ts-ignore
import 'swiper/css';
// @ts-ignore
import 'swiper/css/effect-fade';

interface HomeHeroProps {
  content: (Movie | TVShow)[];
  contentType: 'movie' | 'tv';
}

export default function HomeHero({ content, contentType }: HomeHeroProps) {
  if (!content || content.length === 0) {
    return null;
  }

  const slides = content.slice(0, 5);

  const getReleaseYear = (item: Movie | TVShow) => {
    const date = 'release_date' in item ? item.release_date : item.first_air_date;
    return date ? new Date(date).getFullYear() : 'N/A';
  };

  const getRating = (item: Movie | TVShow) => {
    return item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
  };

  return (
    <section className="relative w-full h-[65vh] md:h-[80vh] lg:h-[88vh] overflow-hidden bg-[#040406]">
      <Swiper
        modules={[Autoplay, EffectFade]}
        effect="fade"
        fadeEffect={{
          crossFade: true
        }}
        slidesPerView={1}
        loop={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        className="w-full h-full"
      >
        {slides.map((item) => (
          <SwiperSlide key={item.id} className="relative w-full h-full">
            
            {/* BACKDROP MULTI-GRADIENT COATING LAYER */}
            <div className="absolute inset-0 z-0">
              <Image
                src={getImageUrl(item.backdrop_path, 'original')}
                alt={contentType === 'movie' ? (item as Movie).title : (item as TVShow).name}
                fill
                priority
                className="absolute inset-0 transition-transform duration-[5000ms] ease-out scale-100 object-cover object-center"
              />
              
              {/* Left-to-Right Shading Mask */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#040406] via-[#040406]/60 to-transparent z-10" />
              
              {/* Bottom-to-Top Shading Mask */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#040406] via-[#040406]/10 to-transparent z-10" />
            </div>
            
            {/* CONTENT ANCHOR GRID */}
            <div className="relative z-20 w-full h-full flex items-end">
              <div className="max-w-[1440px] mx-auto w-full px-8 md:px-12 lg:px-16 pb-12 md:pb-20 text-white text-left">
                <div className="max-w-xl md:max-w-2xl lg:max-w-3xl space-y-4 md:space-y-5">
                  
                  {/* GLASSMORPHIC METADATA ARRAYS */}
                  <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono tracking-wider">
                    <span className="bg-white/[0.04] border border-white/10 px-3 py-1 rounded-md font-bold text-slate-300 backdrop-blur-sm">
                      {getReleaseYear(item)}
                    </span>
                    <span className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-3 py-1 rounded-md font-black flex items-center space-x-1 backdrop-blur-sm">
                      <span>★</span>
                      <span>{getRating(item)}</span>
                    </span>
                    <span className="text-[10px] uppercase font-black tracking-widest bg-purple-500/10 border border-purple-500/20 text-purple-400 px-3 py-1 rounded-md backdrop-blur-sm">
                      {contentType === 'movie' ? 'Feature Film' : 'TV Series'}
                    </span>
                  </div>

                  {/* PREMIUM HERO TITLE */}
                  <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] leading-[1.1] text-white">
                    {contentType === 'movie' ? (item as Movie).title : (item as TVShow).name}
                  </h2>
                  
                  {/* OVERVIEW CONTENT NODE */}
                  <p className="text-sm md:text-base text-slate-400 font-normal leading-relaxed max-w-2xl drop-shadow-md line-clamp-2 md:line-clamp-3">
                    {item.overview || "No extended overview metrics cataloged for this asset cluster."}
                  </p>
                  
                  {/* UPGRADED HERO BRAND CALL ACTION LINK */}
                  <div className="pt-4">
                    <Link
                      href={`/${contentType === 'movie' ? 'movies' : 'tv'}/${item.id}`}
                      className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-xs font-bold tracking-widest uppercase text-white rounded-xl group bg-gradient-to-br from-purple-600 via-cyan-500 to-blue-500 transition-all duration-300 shadow-[0_0_30px_rgba(139,92,246,0.2)] hover:shadow-[0_0_40px_rgba(6,182,212,0.4)] transform hover:scale-[1.02] active:scale-98"
                    >
                      <span className="relative flex items-center space-x-3 px-6 py-3.5 md:px-8 md:py-4 transition-all ease-in duration-200 bg-[#040406]/90 rounded-[10px] group-hover:bg-opacity-0">
                        <span>Watch Now</span>
                        {/* FIX: Corrected missing md: prefix on the height modifier to eliminate the CSS conflict */}
                        <PlayCircleIcon className="w-5 h-5 md:w-6 md:h-6 text-cyan-400 group-hover:text-white transition-colors duration-300" />
                      </span>
                    </Link>
                  </div>

                </div>
              </div>
            </div>

          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}