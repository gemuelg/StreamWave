"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getImageUrl, Movie, TVShow } from '@/lib/tmdb';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import { PlayCircleIcon } from '@heroicons/react/24/outline';

// Import Swiper styles
import 'swiper/css';
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
    <section className="relative w-full h-[55vh] md:h-[75vh] lg:h-[85vh] overflow-hidden">
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
          <SwiperSlide key={item.id}>
            <div className="absolute inset-0 z-0">
              <Image
                src={getImageUrl(item.backdrop_path, 'original')}
                alt={contentType === 'movie' ? (item as Movie).title : (item as TVShow).name}
                fill
                objectFit="cover"
                className="absolute inset-0 transition-opacity duration-300 object-center"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primaryBg via-primaryBg/70 to-transparent z-10"></div>
            </div>
            
            <div className="relative z-20 w-full h-full flex items-end">
              <div className="container px-6 md:px-12 lg:px-20 py-10 md:py-16 text-white text-left">
                <div className="max-w-xl md:max-w-2xl lg:max-w-4xl">
                  <h2 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-2 md:mb-4 drop-shadow-lg leading-tight">
                    {contentType === 'movie' ? (item as Movie).title : (item as TVShow).name}
                  </h2>
                  <div className="flex items-center text-sm md:text-base lg:text-lg text-gray-300 font-medium mb-2">
                    <span>{getReleaseYear(item)}</span>
                    <span className="mx-2 text-white">·</span>
                    <span>⭐ {getRating(item)}</span>
                  </div>
                  <p className="text-base md:text-lg mb-4 md:mb-6 max-w-2xl line-clamp-2">
                    {item.overview || "No overview available."}
                  </p>
                  <div className="mt-8">
                    <Link
                      href={`/${contentType === 'movie' ? 'movies' : 'tv'}/${item.id}`}
                      className="inline-flex items-center px-6 py-3 md:px-8 md:py-4 bg-accentBlue text-white text-base md:text-lg lg:text-xl font-bold rounded-lg
                                hover:bg-accentPurple transition-colors duration-300 shadow-xl"
                    >
                      Watch Now
                      <PlayCircleIcon className="ml-2 w-5 h-5 md:ml-3 md:w-6 md:h-6" />
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