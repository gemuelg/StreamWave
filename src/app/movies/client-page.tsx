// src/app/movies/client-page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import MovieCard from '@/components/MovieCard';
import {
  getPopularMovies,
  getMoviesByGenre,
  getMovieDetails,
  getFilteredContentWithVideos,
  Movie,
  Genre
} from '@/lib/tmdb';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

interface MoviesClientPageProps {
  initialMovies: Movie[];
  initialTotalPages: number;
  genres: Genre[];
}

// Helper function to generate pagination range
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

export default function MoviesClientPage({
  initialMovies,
  initialTotalPages,
  genres,
}: MoviesClientPageProps) {
  const [movies, setMovies] = useState(initialMovies);
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MAX_PAGES_TO_SHOW = 7;

  const fetchMovies = useCallback(async (page: number, genreId: number | null) => {
    try {
      setLoading(true);
      setError(null);
      let data;
      if (genreId) {
        // We still need to filter when fetching by genre
        const fetchFunction = (p: number) => getMoviesByGenre(genreId, p);
        data = await getFilteredContentWithVideos(fetchFunction, getMovieDetails, page);
      } else {
        data = await getFilteredContentWithVideos(getPopularMovies, getMovieDetails, page);
      }
      setMovies(data.results);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("Error fetching movies:", err);
      setError("Failed to load movies. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovies(currentPage, selectedGenreId);
  }, [currentPage, selectedGenreId, fetchMovies]);

  const handleGenreClick = (genreId: number | null) => {
    setSelectedGenreId(genreId);
    setCurrentPage(1);
  };

  const handlePageClick = (pageNumber: number) => {
    if (typeof pageNumber === 'number' && pageNumber >= 1 && pageNumber <= totalPages && pageNumber !== currentPage) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const title = selectedGenreId
    ? `Movies in ${genres.find(g => g.id === selectedGenreId)?.name || 'Category'}`
    : 'Popular Movies';

  const paginationRange = getPaginationRange(currentPage, totalPages, MAX_PAGES_TO_SHOW);

  return (
    <div className="min-h-screen flex flex-col bg-primaryBg text-textLight">
      <Navbar />

      <main className="flex-grow pt-24 px-4 md:px-8 lg:px-12">
        <h1 className="text-4xl lg:text-5xl font-bold text-textLight mt-8 mb-6 lg:mt-10 lg:mb-8">{title}</h1>

        {/* Polished Genre Filter Buttons */}
        <div className="flex flex-wrap justify-start gap-2 sm:gap-3 mb-8">
          <button
            onClick={() => handleGenreClick(null)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200
                        ${selectedGenreId === null ? 'bg-accentBlue text-textLight' : 'bg-secondaryBg text-textMuted hover:bg-tertiaryBg'}`}
          >
            All
          </button>
          {genres.map((genre) => (
            <button
              key={genre.id}
              onClick={() => handleGenreClick(genre.id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200
                          ${selectedGenreId === genre.id ? 'bg-accentBlue text-textLight' : 'bg-secondaryBg text-textMuted hover:bg-tertiaryBg'}`}
            >
              {genre.name}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <svg className="animate-spin h-10 w-10 text-accentBlue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}

        {error && (
          <div className="flex justify-center items-center h-64">
            <p className="text-red-500 font-medium text-lg">{error}</p>
          </div>
        )}

        {!loading && !error && movies.length === 0 && (
          <div className="flex justify-center items-center h-64">
            <p className="text-textMuted text-lg">No movies found for this selection.</p>
          </div>
        )}

        {!loading && !error && movies.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 mb-10">
              {movies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  id={movie.id}
                  title={movie.title}
                  posterPath={movie.poster_path}
                  voteAverage={movie.vote_average}
                  type="movie"
                />
              ))}
            </div>

            {/* Refined Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 py-8">
                <button
                  onClick={() => handlePageClick(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  className="p-3 bg-secondaryBg text-textLight rounded-full hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>

                {paginationRange.map((page, index) =>
                  typeof page === 'number' ? (
                    <button
                      key={index}
                      onClick={() => handlePageClick(page)}
                      disabled={loading}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200
                                  ${currentPage === page ? 'bg-accentBlue text-textLight' : 'bg-secondaryBg text-textMuted hover:bg-tertiaryBg'}
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
                  className="p-3 bg-secondaryBg text-textLight rounded-full hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <ChevronRightIcon className="h-5 w-5" />
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