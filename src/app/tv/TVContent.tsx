// src/app/tv/TVContent.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import MovieCard from '@/components/MovieCard';
import { getTVShowGenres, getFilteredTVShows, TVShow, Genre } from '@/lib/tmdb';
import { FunnelIcon } from '@heroicons/react/24/outline';
import { useRouter, useSearchParams } from 'next/navigation';

// Custom keyword filter to catch content not flagged by TMDB
const explicitKeywords = [
  'erotic', 'porn', 'sex', 'sexual', 'explicit', 'nude', 'nudity', 'hardcore', 'softcore'
];

const containsExplicitKeyword = (text: string | null): boolean => {
  if (!text) return false;
  const lowerCaseText = text.toLowerCase();
  return explicitKeywords.some(keyword => lowerCaseText.includes(keyword));
};

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

export default function TVContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tvShows, setTVShows] = useState<TVShow[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const currentPage = useMemo(() => {
    const pageParam = searchParams.get('page');
    return pageParam ? parseInt(pageParam) : 1;
  }, [searchParams]);

  const selectedGenreIds = useMemo(() => {
    const genresParam = searchParams.get('genres');
    return genresParam ? genresParam.split(',').map(id => parseInt(id)) : [];
  }, [searchParams]);

  const selectedYear = useMemo(() => {
    const yearParam = searchParams.get('year');
    return yearParam ? parseInt(yearParam) : null;
  }, [searchParams]);

  const selectedSort = useMemo(() => {
    const sortParam = searchParams.get('sort_by');
    return sortParam || 'popularity.desc';
  }, [searchParams]);
  
  const [totalPages, setTotalPages] = useState(1);

  const MAX_PAGES_TO_SHOW = 7;

  const fetchTVShows = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getFilteredTVShows(currentPage, selectedGenreIds.join(','), selectedYear, selectedSort);
      
      // Filter out TV shows with explicit keywords after fetching
      const safeTVShows = data.results.filter(tvShow =>
        !containsExplicitKeyword(tvShow.name) &&
        !containsExplicitKeyword(tvShow.overview)
      );

      setTVShows(safeTVShows);
      setTotalPages(data.total_pages);
    } catch (err) {
      console.error("Error fetching TV shows:", err);
      setError("Failed to load TV shows. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedGenreIds, selectedYear, selectedSort]);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const tvGenres = await getTVShowGenres();
        setGenres(tvGenres);
      } catch (err) {
        console.error("Error fetching genres:", err);
      }
    };
    fetchGenres();
  }, []);

  useEffect(() => {
    fetchTVShows();
  }, [fetchTVShows]);

  const handlePageClick = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', pageNumber.toString());
    router.push(`?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGenreChange = (genreId: number) => {
    const params = new URLSearchParams(searchParams.toString());
    
    const newGenreIds = selectedGenreIds.includes(genreId)
      ? selectedGenreIds.filter(id => id !== genreId)
      : [...selectedGenreIds, genreId];
    
    if (newGenreIds.length > 0) {
      params.set('genres', newGenreIds.join(','));
    } else {
      params.delete('genres');
    }
    
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const handleClearGenres = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('genres');
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (event.target.value === 'all') {
      params.delete('year');
    } else {
      params.set('year', event.target.value);
    }
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort_by', event.target.value);
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const title = selectedGenreIds.length > 0 || selectedYear
    ? (
        <span className="flex items-center gap-2">
          <span className="h-6 w-2 bg-accentBlue rounded-full"></span>
          <span className="text-2xl">TV Shows</span>
        </span>
      )
    : (
        <span className="flex items-center gap-1">
          <span className="h-8 w-2 mt-1 bg-accentBlue rounded-full"></span>
          <span className="text-2xl">TV Shows</span>
        </span>
      );

  const paginationRange = getPaginationRange(currentPage, totalPages, MAX_PAGES_TO_SHOW);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);

  return (
    <div className="container mx-auto px-4 md:px-8 lg:px-12">
      <div className="flex justify-between items-center my-8 relative">
        <h1 className="text-2xl md:text-4xl font-bold text-textLight text-center md:text-left">
          {title}
        </h1>

        {/* Desktop Filters (visible on lg and above) */}
        <div className="hidden lg:flex flex-wrap items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-3 rounded-lg bg-secondaryBg text-textLight border border-gray-700 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-accentBlue transition-colors hover:bg-gray-700"
            >
              <FunnelIcon className="h-5 w-5" />
              {selectedGenreIds.length > 0 ? `Selected (${selectedGenreIds.length})` : 'Filter by Genre'}
            </button>
            {isMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-secondaryBg border border-gray-700 rounded-lg shadow-xl z-20 p-4 max-h-80 overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold">Genres</h3>
                  <button
                    onClick={handleClearGenres}
                    className="text-sm text-accentRed hover:underline"
                  >
                    Clear
                  </button>
                </div>
                <div className="space-y-2">
                  {genres.map(genre => (
                    <div key={genre.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`genre-${genre.id}`}
                        checked={selectedGenreIds.includes(genre.id)}
                        onChange={() => handleGenreChange(genre.id)}
                        className="w-4 h-4 text-accentBlue bg-gray-600 border-gray-500 rounded focus:ring-accentBlue"
                      />
                      <label htmlFor={`genre-${genre.id}`} className="ml-2 text-textLight cursor-pointer">
                        {genre.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <select
            onChange={handleYearChange}
            value={selectedYear || 'all'}
            className="p-3 rounded-lg bg-secondaryBg text-textLight border border-gray-700 focus:outline-none focus:ring-2 focus:ring-accentBlue"
          >
            <option value="all">All Years</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          
          <select
            onChange={handleSortChange}
            value={selectedSort}
            className="p-3 rounded-lg bg-secondaryBg text-textLight border border-gray-700 focus:outline-none focus:ring-2 focus:ring-accentBlue"
          >
            <option value="popularity.desc">Trending</option>
            <option value="first_air_date.desc">Release date</option>
            <option value="name.asc">Name A-Z</option>
          </select>
        </div>

        {/* Mobile Filter Button (visible below lg) */}
        <button
          onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
          className="lg:hidden p-3 rounded-lg bg-secondaryBg text-textLight border border-gray-700 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-accentBlue transition-colors hover:bg-gray-700"
        >
          <FunnelIcon className="h-5 w-5" />
          Filter
        </button>

        {/* Mobile Filter Menu */}
        {isMobileFilterOpen && (
          <div className="absolute top-16 right-0 w-64 bg-secondaryBg border border-gray-700 rounded-lg shadow-xl z-20 p-4 flex flex-col gap-4">
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-full p-3 rounded-lg bg-secondaryBg text-textLight border border-gray-700 flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-accentBlue transition-colors hover:bg-gray-700"
              >
                <span>{selectedGenreIds.length > 0 ? `Selected (${selectedGenreIds.length})` : 'Filter by Genre'}</span>
                <FunnelIcon className="h-5 w-5" />
              </button>
              {isMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-full bg-secondaryBg border border-gray-700 rounded-lg shadow-xl z-30 p-4 max-h-48 overflow-y-auto custom-scrollbar">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold">Genres</h3>
                    <button
                      onClick={handleClearGenres}
                      className="text-sm text-accentRed hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="space-y-2">
                    {genres.map(genre => (
                      <div key={genre.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`mobile-genre-${genre.id}`}
                          checked={selectedGenreIds.includes(genre.id)}
                          onChange={() => handleGenreChange(genre.id)}
                          className="w-4 h-4 text-accentBlue bg-gray-600 border-gray-500 rounded focus:ring-accentBlue"
                        />
                        <label htmlFor={`mobile-genre-${genre.id}`} className="ml-2 text-textLight cursor-pointer">
                          {genre.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <select
              onChange={handleYearChange}
              value={selectedYear || 'all'}
              className="w-full p-3 rounded-lg bg-secondaryBg text-textLight border border-gray-700 focus:outline-none focus:ring-2 focus:ring-accentBlue"
            >
              <option value="all">All Years</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <select
              onChange={handleSortChange}
              value={selectedSort}
              className="w-full p-3 rounded-lg bg-secondaryBg text-textLight border border-gray-700 focus:outline-none focus:ring-2 focus:ring-accentBlue"
            >
              <option value="popularity.desc">Trending</option>
              <option value="first_air_date.desc">Release date</option>
              <option value="name.asc">Name A-Z</option>
            </select>
          </div>
        )}
      </div>

      {loading && (
        <div className="flex justify-center items-center h-48">
          <p>Loading TV shows...</p>
        </div>
      )}

      {error && (
        <div className="flex justify-center items-center h-48">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {!loading && !error && tvShows.length === 0 && (
        <div className="flex justify-center items-center h-48">
          <p className="text-textMuted">No TV shows found for this selection.</p>
        </div>
      )}

      {!loading && !error && tvShows.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 mb-10">
            {tvShows.map((tvShow) => (
              <MovieCard
                key={tvShow.id}
                id={tvShow.id}
                title={tvShow.name}
                posterPath={tvShow.poster_path}
                voteAverage={tvShow.vote_average}
                type="tv"
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center flex-wrap gap-2 py-8">
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
    </div>
  );
}