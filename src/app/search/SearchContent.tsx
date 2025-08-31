// src/app/search/SearchContent.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import MovieCard from '@/components/MovieCard';
import { searchMulti, MultiSearchResultItem, MultiSearchResults } from '@/lib/tmdb';

const MIN_VOTES_FOR_JUNK = 10;
const MIN_RATING_FOR_JUNK = 3.0;
const MIN_RESULTS_TO_POPULATE = 20;
const MIN_LOAD_MORE_RESULTS = 10;
const MAX_PAGES_TO_FETCH_PER_REQUEST = 5;

export default function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';

  const [results, setResults] = useState<MultiSearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pageInfoRef = useRef({ lastFetched: 0, totalPages: 1 });
  const isFetchingRef = useRef(false);

  // A helper function to filter and sort all results
  const filterAndSortResults = useCallback((items: MultiSearchResultItem[]) => {
    // Filter out items that are not movies/tv shows, are missing a poster,
    // or are "junk" (very low rating and very few votes)
    const filtered = items.filter(item => {
      const isMovieOrTV = item.media_type === 'movie' || item.media_type === 'tv';
      const hasPoster = !!item.poster_path;
      const isJunk = (item.vote_count || 0) < MIN_VOTES_FOR_JUNK && (item.vote_average || 0) < MIN_RATING_FOR_JUNK;

      return isMovieOrTV && hasPoster && !isJunk;
    });
    
    // Perform a single, unified sort
    filtered.sort((a, b) => {
      // Primary sort: vote_count descending
      const voteCountDifference = (b.vote_count || 0) - (a.vote_count || 0);
      if (voteCountDifference !== 0) {
        return voteCountDifference;
      }
      // Secondary sort: vote_average descending
      return (b.vote_average || 0) - (a.vote_average || 0);
    });

    return filtered;
  }, []);

  // Main fetching function for all types of requests
  const fetchResults = useCallback(async (isInitialLoad: boolean, isLoadMore: boolean) => {
    if (!query || isFetchingRef.current) return;
    
    isFetchingRef.current = true;
    setLoading(true);
    setError(null);

    let combinedResults: MultiSearchResultItem[] = [];
    let apiPage = isLoadMore ? pageInfoRef.current.lastFetched + 1 : 1;
    let targetCount = isLoadMore ? MIN_LOAD_MORE_RESULTS : MIN_RESULTS_TO_POPULATE;

    try {
      let pagesFetched = 0;
      while (combinedResults.length < targetCount && apiPage <= pageInfoRef.current.totalPages && pagesFetched < MAX_PAGES_TO_FETCH_PER_REQUEST) {
        const data: MultiSearchResults = await searchMulti(query, apiPage);
        pageInfoRef.current.totalPages = data.total_pages;
        
        const filtered = filterAndSortResults(data.results);
        combinedResults = [...combinedResults, ...filtered];
        apiPage++;
        pagesFetched++;
      }
      
      setResults(prev => {
        const uniqueFiltered = combinedResults.filter(item => !prev.some(res => res.id === item.id));
        return [...prev, ...uniqueFiltered];
      });
      pageInfoRef.current.lastFetched = apiPage - 1;

    } catch (err) {
      console.error("Failed to fetch search results:", err);
      setError("Failed to load search results. Please try again.");
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [query, filterAndSortResults]);

  // UseEffect to trigger the initial search
  useEffect(() => {
    setResults([]);
    pageInfoRef.current = { lastFetched: 0, totalPages: 1 };
    if (query) {
      fetchResults(true, false);
    } else {
      setLoading(false);
      setError(null);
    }
  }, [query, fetchResults]);

  const handleLoadMore = useCallback(() => {
    fetchResults(false, true);
  }, [fetchResults]);

  const showLoadMoreButton = !loading && results.length > 0 && pageInfoRef.current.lastFetched < pageInfoRef.current.totalPages;
  const showInitialLoading = loading && results.length === 0;

  return (
  <>
    <main className="flex-grow pt-20 px-4 md:px-8 lg:px-12">
      <h1 className="text-4xl font-bold text-textLight my-8 text-center">
        {`Search Results for "${query}"`}
      </h1>

      {showInitialLoading && (
        <div className="flex justify-center items-center h-48">
          <p>Searching for content...</p>
        </div>
      )}

      {error && (
        <div className="flex justify-center items-center h-48">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {!showInitialLoading && !error && results.length === 0 && (
        <div className="flex justify-center items-center h-48">
          <p className="text-textMuted">No results found for your search.</p>
        </div>
      )}

      {!error && results.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 mb-10">
            {results.map((item) => (
              <MovieCard
                key={item.id}
                id={item.id}
                title={item.media_type === 'movie' ? item.title! : item.name!}
                posterPath={item.poster_path ?? null}
                voteAverage={item.vote_average ?? 0}
                type={item.media_type as 'movie' | 'tv'}
              />
            ))}
          </div>

          {showLoadMoreButton && (
            <div className="flex justify-center items-center mb-10">
              <button
                onClick={handleLoadMore}
                className="px-6 py-3 bg-secondaryBg text-textLight rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </main>
    <footer className="w-full py-4 text-center text-textMuted text-sm bg-primaryBg border-t border-gray-800 mt-8">
        &copy; {new Date().getFullYear()} Stream Wave. All rights reserved.
    </footer>
  </>
  );
}