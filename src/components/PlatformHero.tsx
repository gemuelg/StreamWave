"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getImageUrl, Movie, TVShow } from '@/lib/tmdb';
import { PlayCircleIcon } from '@heroicons/react/24/outline';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-fade';

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
    <section className="relative w-full h-[60vh] md:h-[70vh] min-h-[400px] mb-12 overflow-hidden">
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
        {content.map((item) => (
          <SwiperSlide key={item.id}>
            <div className="absolute inset-0 z-0">
              <Image
                src={getImageUrl(item.backdrop_path, 'original')}
                alt={getTitle(item)}
                fill
                style={{ objectFit: 'cover' }}
                priority
              />
              {/* UPDATED: Changed the top of the gradient to fade into a dark color */}
              <div className="absolute inset-0 bg-gradient-to-t from-primaryBg via-primaryBg/70 to-black/60"></div>
            </div>
            <div className="relative z-10 flex items-end w-full h-full p-6 md:p-12 text-white justify-end">
              <div className="w-full max-w-2xl text-right">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-3 drop-shadow-lg">
                  {getTitle(item)}
                </h1>
                
                <div className="flex items-center space-x-4 mb-4 text-lg drop-shadow-md justify-end">
                  {getReleaseYear(item) && <span className="font-semibold">{getReleaseYear(item)}</span>}
                  <span className="flex items-center space-x-1">
                    <span>⭐ {getRating(item)}</span>
                  </span>
                </div>
                
                <p className="text-base md:text-lg mb-4 line-clamp-3 md:line-clamp-4 drop-shadow-md">
                  {getOverview(item)}
                </p>

                <Link
                  href={`/${getType(item) === 'movie' ? 'movies' : 'tv'}/${item.id}`}
                  className="inline-flex items-center px-6 py-3 md:px-8 md:py-4 bg-accentBlue text-white text-base md:text-lg lg:text-xl font-bold rounded-lg
                             hover:bg-accentPurple transition-colors duration-300 shadow-xl"
                >
                  Watch Now
                  <PlayCircleIcon className="ml-2 w-5 h-5 md:ml-3 md:w-6 md:h-6" />
                </Link>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}