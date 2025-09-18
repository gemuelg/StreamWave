// src/components/ContentCarousel.tsx
"use client";

import React, { useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y } from 'swiper/modules';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import MovieCard from './MovieCard';
import { Movie, TVShow, Genre } from '@/lib/tmdb';
import HoverCard from './HoverCard';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface ContentCarouselProps {
  title: string;
  content: (Movie | TVShow)[];
  contentType: 'movie' | 'tv' | 'mixed';
  allGenres: Genre[];
}

export default function ContentCarousel({ title, content, contentType, allGenres }: ContentCarouselProps) {
  const [hoveredItem, setHoveredItem] = useState<Movie | TVShow | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);
  const hideTimer = useRef<NodeJS.Timeout | null>(null);

  if (!content || content.length === 0) {
    return null;
  }

  const prevRef = useRef(null);
  const nextRef = useRef(null);

  const handleMouseEnter = (item: Movie | TVShow, event: React.MouseEvent<HTMLDivElement>) => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    setHoveredItem(item);
    const rect = event.currentTarget.getBoundingClientRect();
    setHoverPosition({ 
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    });
  };

  const handleMouseLeave = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
    }
    hideTimer.current = setTimeout(() => {
      setHoveredItem(null);
      setHoverPosition(null);
    }, 200);
  };

  const onHoverCardEnter = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  };

  const onHoverCardLeave = () => {
    setHoveredItem(null);
    setHoverPosition(null);
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  };

  const mapGenreIdsToNames = (ids?: number[]) => {
    if (!ids || ids.length === 0) return "N/A";
    const genreNames = ids.map(id => {
      const genre = allGenres.find(g => g.id === id);
      return genre ? genre.name : null;
    }).filter(Boolean);

    return genreNames.join(', ') || "N/A";
  };

  return (
    <section className="container mx-auto px-6 md:px-12 py-8 relative group">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-extrabold text-textLight">{title}</h2>
      </div>
      <Swiper
        modules={[Navigation, Pagination, A11y]}
        spaceBetween={20}
        slidesPerView={2}
        navigation={{
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        }}
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
        className="mySwiper pb-8 overflow-visible"
        onInit={(swiper: any) => {
          swiper.params.navigation.prevEl = prevRef.current;
          swiper.params.navigation.nextEl = nextRef.current;
          swiper.navigation.init();
          swiper.navigation.update();
        }}
      >
        {/* Update the z-index here to be higher than the hover card */}
        <div className="absolute top-1/2 left-0 z-[60] transform -translate-y-1/2 hidden md:flex w-full justify-between items-center px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <button ref={prevRef} className="w-10 h-10 flex items-center justify-center rounded-full bg-secondaryBg hover:bg-accentBlue transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accentBlue pointer-events-auto">
            <ChevronLeftIcon className="h-6 w-6 text-textLight" />
          </button>
          <button ref={nextRef} className="w-10 h-10 flex items-center justify-center rounded-full bg-secondaryBg hover:bg-accentBlue transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accentBlue pointer-events-auto">
            <ChevronRightIcon className="h-6 w-6 text-textLight" />
          </button>
        </div>
        {content.map((item) => (
          <SwiperSlide key={item.id} className="h-full">
            <div
              className="relative"
              onMouseEnter={(e) => handleMouseEnter(item, e)}
              onMouseLeave={handleMouseLeave}
            >
              <MovieCard
                id={item.id}
                title={'title' in item ? item.title : item.name}
                posterPath={item.poster_path}
                voteAverage={item.vote_average}
                type={'media_type' in item ? item.media_type as 'movie' | 'tv' : contentType as 'movie' | 'tv'}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      {hoveredItem && hoverPosition && (
        <HoverCard
          item={hoveredItem}
          contentType={'media_type' in hoveredItem ? hoveredItem.media_type as 'movie' | 'tv' : contentType as 'movie' | 'tv'}
          position={hoverPosition}
          genres={mapGenreIdsToNames(hoveredItem.genre_ids)}
          onMouseEnter={onHoverCardEnter}
          onMouseLeave={onHoverCardLeave}
        />
      )}
    </section>
  );
}