// src/components/CastCarousel.tsx
"use client";

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y } from 'swiper/modules';
import Image from 'next/image';
import { CastMember, getImageUrl } from '@/lib/tmdb'; // Import CastMember type and getImageUrl

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface CastCarouselProps {
  cast: CastMember[];
}

export default function CastCarousel({ cast }: CastCarouselProps) {
  if (!cast || cast.length === 0) {
    return null;
  }

  // Filter to show only cast members with a profile path
  const filteredCast = cast.filter(member => member.profile_path);

  return (
    <section className="container mx-auto px-6 md:px-12 py-8">
      <h2 className="text-3xl font-bold text-textLight mb-6">Top Billed Cast</h2>
      <Swiper
        modules={[Navigation, Pagination, A11y]}
        spaceBetween={15}
        slidesPerView={3} // Default for smaller screens
        navigation
        breakpoints={{
          // When window width is >= 640px
          640: {
            slidesPerView: 4,
            spaceBetween: 20,
          },
          // When window width is >= 768px
          768: {
            slidesPerView: 5,
            spaceBetween: 20,
          },
          // When window width is >= 1024px
          1024: {
            slidesPerView: 6,
            spaceBetween: 25,
          },
          // When window width is >= 1280px
          1280: {
            slidesPerView: 7,
            spaceBetween: 30,
          },
        }}
      >
        {filteredCast.map((member) => (
          <SwiperSlide key={member.id} className="text-center">
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden mb-2 border-2 border-accentBlue shadow-lg">
                <Image
                  src={getImageUrl(member.profile_path, 'w185')}
                  alt={member.name}
                  fill
                  sizes="(max-width: 768px) 100px, 120px"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <p className="text-textLight font-semibold text-sm sm:text-base leading-tight mb-1">{member.name}</p>
              <p className="text-textMuted text-xs sm:text-sm">{member.character}</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}