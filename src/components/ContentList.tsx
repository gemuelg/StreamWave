// src/components/ContentList.tsx
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
  onPageClick
}: ContentListProps) {
  const MAX_PAGES_TO_SHOW = 7;
  const paginationRange = getPaginationRange(currentPage, totalPages, MAX_PAGES_TO_SHOW);
  
  return (
    <>
      {content.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 mb-10">
          {content.map((item) => (
            <MovieCard
              key={item.id}
              id={item.id}
              title={'title' in item ? item.title : item.name}
              posterPath={item.poster_path}
              voteAverage={item.vote_average}
              type={mediaType}
            />
          ))}
        </div>
      ) : (
        <div className="flex justify-center items-center h-48">
          <p className="text-textMuted">No content found for this selection.</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center flex-wrap gap-2 py-8">
          <button
            onClick={() => onPageClick(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-secondaryBg text-textLight rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Previous
          </button>
          {paginationRange.map((page, index) =>
            typeof page === 'number' ? (
              <button
                key={index}
                onClick={() => onPageClick(page)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200
                  ${currentPage === page ? 'bg-accentBlue text-textLight' : 'bg-secondaryBg text-textMuted hover:bg-gray-700'}
                  disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {page}
              </button>
            ) : (
              <span key={index} className="px-2 py-2 text-textMuted text-lg">
                {page}
              </span>
            )
          )}
          <button
            onClick={() => onPageClick(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-secondaryBg text-textLight rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}