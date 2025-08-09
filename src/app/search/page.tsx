// src/app/search/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import MovieCard from '@/components/MovieCard';
import { searchMulti, MultiSearchResultItem, MultiSearchResults } from '@/lib/tmdb';

// Helper function to generate pagination range (copied from movies/page.tsx)
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

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';

  const [results, setResults] = useState<MultiSearchResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const MAX_PAGES_TO_SHOW = 7;

  const fetchResults = useCallback(async () => {
    if (!query) {
      setResults([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const data: MultiSearchResults = await searchMulti(query, currentPage);
      setResults(data.results);
      setTotalPages(data.total_pages);
    } catch (err) {
      console.error("Failed to fetch search results:", err);
      setError("Failed to load search results. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [query, currentPage]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // Handle page clicks (copied from movies/page.tsx)
  const handlePageClick = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages && pageNumber !== currentPage) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const paginationRange = getPaginationRange(currentPage, totalPages, MAX_PAGES_TO_SHOW);

  return (
    <div className="min-h-screen flex flex-col bg-primaryBg text-textLight">
      <Navbar />

      <main className="flex-grow pt-20 px-4 md:px-8 lg:px-12">
        
        {/* FIX: Use a template literal to fix the ESLint error */}
        <h1 className="text-4xl font-bold text-textLight my-8 text-center">
          {`Search Results for "${query}"`}
        </h1>
        
        {loading && (
          <div className="flex justify-center items-center h-48">
            <p>Searching for content...</p>
          </div>
        )}

        {error && (
          <div className="flex justify-center items-center h-48">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {!loading && !error && results.length === 0 && (
          <div className="flex justify-center items-center h-48">
            <p className="text-textMuted">No results found for your search.</p>
          </div>
        )}

        {!loading && !error && results.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 mb-10">
              
              {results.map((item) => {
                if (item.media_type === 'movie' || item.media_type === 'tv') {
                  return (
                    <MovieCard
                      key={item.id}
                      id={item.id}
                      title={item.media_type === 'movie' ? item.title! : item.name!}
                      posterPath={item.poster_path ?? null}
                      // FIX: Pass the voteAverage prop here
                      voteAverage={item.vote_average ?? 0}
                      type={item.media_type}
                    />
                  );
                }
                return null;
              })}
            </div>

            {/* Pagination from movies/page.tsx */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 py-8">
                <button
                  onClick={() => handlePageClick(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  className="px-4 py-2 bg-secondaryBg text-textLight rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Previous
                </button>

                {paginationRange.map((page, index) =>
                  typeof page === 'number' ? (
                    <button
                      key={index}
                      onClick={() => handlePageClick(page)}
                      disabled={loading}
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
                  onClick={() => handlePageClick(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                  className="px-4 py-2 bg-secondaryBg text-textLight rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="w-full py-4 text-center text-textMuted text-sm bg-primaryBg border-t border-gray-800 mt-auto">
        &copy; {new Date().getFullYear()} Stream Wave. All rights reserved. Data provided by TMDB.
      </footer>
    </div>
  );
}