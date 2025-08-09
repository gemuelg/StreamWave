// src/components/ContentCarousel.tsx
"use client";

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y } from 'swiper/modules';
import MovieCard from './MovieCard';
import { Movie, TVShow } from '@/lib/tmdb';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface ContentCarouselProps {
  title: string;
  content: (Movie | TVShow)[];
  contentType: 'movie' | 'tv';
}

export default function ContentCarousel({ title, content, contentType }: ContentCarouselProps) {
  if (!content || content.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto px-6 md:px-12 py-8">
      <h2 className="text-3xl font-bold text-textLight mb-6">{title}</h2>
      <Swiper
        modules={[Navigation, Pagination, A11y]}
        spaceBetween={20}
        slidesPerView={2}
        navigation
        pagination={{ clickable: true }}
        breakpoints={{
          640: {
            slidesPerView: 3,
            spaceBetween: 20,
          },
          768: {
            slidesPerView: 4,
            spaceBetween: 25,
          },
          1024: {
            slidesPerView: 5,
            spaceBetween: 30,
          },
          1280: {
            slidesPerView: 6,
            spaceBetween: 30,
          },
        }}
        // Adding pt-4 to give space for navigation, and pb-8 for pagination dots
        className="mySwiper pt-4 pb-8" 
      >
        {content.map((item) => (
          <SwiperSlide key={item.id} className="h-full">
            <MovieCard
              id={item.id}
              title={contentType === 'movie' ? (item as Movie).title : (item as TVShow).name}
              posterPath={item.poster_path}
              voteAverage={item.vote_average}
              type={contentType}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}