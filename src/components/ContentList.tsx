"use client";

import React from 'react';
import MovieCard from './MovieCard';
import { Movie, TVShow } from '@/lib/tmdb';

type ContentItem = Movie | TVShow;

interface ContentListProps {
  content: ContentItem[];
  mediaType: 'movie' | 'tv';
  totalPages: number;
  currentPage: number;
  onPageClick: (page: number | string) => void;
  genresMap: Map<number, string>;
}

const getPaginationRange = (currentPage: number, totalPages: number, maxPagesToShow: number) => {
  const range: (number | string)[] = [];
  const half = Math.floor(maxPagesToShow / 2);

  if (totalPages <= maxPagesToShow) {
    for (let i = 1; i <= totalPages; i++) {
      range.push(i);
    }
  } else {
    let startPage = currentPage - half;
    let endPage = currentPage + half;

    if (startPage < 1) {
      startPage = 1;
      endPage = maxPagesToShow;
    } else if (endPage > totalPages) {
      endPage = totalPages;
      startPage = totalPages - maxPagesToShow + 1;
    }

    if (startPage > 1) {
      range.push(1);
      if (startPage > 2) {
        range.push('...');
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      range.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        range.push('...');
      }
      range.push(totalPages);
    }
  }
  return range;
};

export default function ContentList({
  content,
  mediaType,
  totalPages,
  currentPage,
  onPageClick,
  genresMap
}: ContentListProps) {
  const MAX_PAGES_TO_SHOW = 7;
  const paginationRange = getPaginationRange(currentPage, totalPages, MAX_PAGES_TO_SHOW);
  
  return (
    <div className="w-full flex flex-col items-center">
      {content.length > 0 ? (
        /* THE INSTANT FIXED GRID ARCHITECTURE:
          - Decreasing to xl:grid-cols-5 instantly scales the cards up to be LARGER.
          - justify-items-stretch forces tracking frames to anchor edge-to-edge, removing left indentations.
        */
        <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-12 mb-14 justify-items-stretch">
          {content.map((item) => (
            <MovieCard
              key={item.id}
              content={item}
              contentType={mediaType}
              genresMap={genresMap}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 w-full border border-dashed border-zinc-800 bg-zinc-900/10 rounded-xl p-6 text-center">
          <p className="text-sm text-zinc-500 tracking-wide">No structural content found for this query parameter.</p>
        </div>
      )}

      {/* REFINED MATTE PAGINATION SYSTEMS ENGINE */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center flex-wrap gap-2 py-6 border-t border-zinc-900/60 w-full mt-4">
          <button
            onClick={() => onPageClick(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800/80 text-zinc-300 hover:text-white rounded-md text-xs font-medium tracking-wide transition-all duration-200 disabled:opacity-30 disabled:hover:bg-zinc-900/40 disabled:hover:text-zinc-300 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {paginationRange.map((page, index) =>
            typeof page === 'number' ? (
              <button
                key={index}
                onClick={() => onPageClick(page)}
                className={`w-9 h-9 flex items-center justify-center rounded-md text-xs font-semibold transition-all duration-200
                  ${currentPage === page 
                    ? 'bg-zinc-100 text-zinc-950 shadow-md hover:bg-white scale-[1.03]' 
                    : 'bg-zinc-900/40 border border-zinc-800/60 text-zinc-400 hover:border-zinc-700 hover:text-white'
                  }`}
              >
                {page}
              </button>
            ) : (
              <span key={index} className="w-7 text-center text-zinc-600 font-mono text-xs select-none">
                {page}
              </span>
            )
          )}
          
          <button
            onClick={() => onPageClick(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800/80 text-zinc-300 hover:text-white rounded-md text-xs font-medium tracking-wide transition-all duration-200 disabled:opacity-30 disabled:hover:bg-zinc-900/40 disabled:hover:text-zinc-300 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}