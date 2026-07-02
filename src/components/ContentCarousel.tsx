"use client";

import React, { useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, A11y } from 'swiper/modules';
import MovieCard from './MovieCard';
import { Movie, TVShow, Genre } from '@/lib/tmdb';
import HoverCard from './HoverCard';

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

  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

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
    if (!ids || ids.length === 0) return "";
    return ids
      .map(id => allGenres.find(g => g.id === id)?.name)
      .filter(Boolean)
      .slice(0, 2)
      .join(' • ');
  };

  return (
    <section className="w-full px-6 md:px-[6%] py-6 bg-transparent text-white overflow-hidden select-none">
      
      {/* MINIMALIST CATEGORY HEADER TRACK */}
      <div className="w-full flex items-center justify-between mb-4">
        <h2 className="text-lg md:text-xl font-medium tracking-wide text-zinc-200 font-sans">
          {title}
        </h2>

        {/* REFINED DIRECTIONAL CONTROLS */}
        <div className="flex items-center space-x-2">
          <button 
            ref={prevRef}
            className="w-8 h-8 flex items-center justify-center bg-zinc-900/40 border border-zinc-800/60 text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-all duration-200 rounded-full cursor-pointer disabled:opacity-30 text-sm z-10"
            aria-label="Previous Slides"
          >
            ‹
          </button>
          <button 
            ref={nextRef}
            className="w-8 h-8 flex items-center justify-center bg-zinc-900/40 border border-zinc-800/60 text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-all duration-200 rounded-full cursor-pointer disabled:opacity-30 text-sm z-10"
            aria-label="Next Slides"
          >
            ›
          </button>
        </div>
      </div>

      {/* MODIFIED: HORIZONTAL LOCKING CLAMP BOX CONTAINER */}
      {/* This structural block allows vertical overflow for cards to pop up, but kills the horizontal window scroll track leak */}
      <div className="relative w-full overflow-x-hidden overflow-y-visible px-4 -mx-4 py-4 -my-4">
        <Swiper
          modules={[Navigation, A11y]}
          spaceBetween={20}
          slidesPerView={2}
          centeredSlides={false}
          loop={true}
          
          // Allow swiping gestures by default on mobile viewports
          allowTouchMove={true}
          
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          breakpoints={{
            480: { slidesPerView: 3, spaceBetween: 16, allowTouchMove: true },
            768: { slidesPerView: 4, spaceBetween: 18, allowTouchMove: true },
            // MODIFIED: Hard-locks gesture controls on desktop viewports. Arrow buttons are now mandatory.
            1024: { slidesPerView: 5, spaceBetween: 20, allowTouchMove: false },
            1400: { slidesPerView: 6, spaceBetween: 22, allowTouchMove: false },
          }}
          className="mySwiper !overflow-visible w-full"
          onInit={(swiper: any) => {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
            swiper.navigation.init();
            swiper.navigation.update();
          }}
        >
          {content.map((item) => (
            <SwiperSlide key={`slide-${item.id}`} className="h-full">
              <div
                className="relative transition-transform duration-300 ease-out"
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
      </div>

      {/* CURATED DETAIL OVERLAY MATRIX */}
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