"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import MovieCard from '@/components/MovieCard';
import { searchMulti, MultiSearchResultItem, MultiSearchResults, getMovieGenres, getTVGenres, Genre } from '@/lib/tmdb';

const MIN_VOTES_FOR_JUNK = 10;
const MIN_RATING_FOR_JUNK = 3.0;
const MIN_RESULTS_TO_POPULATE = 30;
const MIN_LOAD_MORE_RESULTS = 20;
const MAX_PAGES_TO_FETCH_PER_REQUEST = 6;

export default function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';

  const [results, setResults] = useState<MultiSearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [genres, setGenres] = useState<Genre[]>([]);

  const pageInfoRef = useRef({ lastFetched: 0, totalPages: 1 });
  const isFetchingRef = useRef(false);

  const genresMap = useMemo(() => {
    return new Map(genres.map(genre => [genre.id, genre.name]));
  }, [genres]);

  const { filteredResults, combinedTotal } = useMemo(() => {
    const movies = results.filter(item => item.media_type === 'movie');
    const tvShows = results.filter(item => item.media_type === 'tv');
    const merged = [...movies, ...tvShows];
    
    merged.sort((a, b) => {
      const voteCountDifference = (b.vote_count || 0) - (a.vote_count || 0);
      if (voteCountDifference !== 0) return voteCountDifference;
      return (b.vote_average || 0) - (a.vote_average || 0);
    });
    
    return { filteredResults: merged, combinedTotal: merged.length };
  }, [results]);

  const filterAndSortResults = useCallback((items: MultiSearchResultItem[]) => {
    return items.filter(item => {
      const isMovieOrTV = item.media_type === 'movie' || item.media_type === 'tv';
      const hasPoster = !!item.poster_path;
      const isJunk = (item.vote_count || 0) < MIN_VOTES_FOR_JUNK && (item.vote_average || 0) < MIN_RATING_FOR_JUNK;
      return isMovieOrTV && hasPoster && !isJunk;
    });
  }, []);

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
        return isLoadMore ? [...prev, ...uniqueFiltered] : uniqueFiltered;
      });
      pageInfoRef.current.lastFetched = apiPage - 1;

    } catch (err) {
      console.error(err);
      setError("Unable to connect to the catalog database. Please attempt later.");
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [query, filterAndSortResults]);

  useEffect(() => {
    const fetchGenresData = async () => {
      try {
        const [movieGenres, tvGenres] = await Promise.all([getMovieGenres(), getTVGenres()]);
        setGenres([...movieGenres, ...tvGenres]);
      } catch (err) {
        console.error(err);
      }
    };
    fetchGenresData();
  }, []);

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
    <div className="min-h-screen flex flex-col bg-[#020202] text-[#e0e0e0] font-sans antialiased overflow-x-hidden">
      
      <main className="flex-grow w-full max-w-[1600px] mx-auto px-4 sm:px-8 pt-28 pb-20 flex flex-col items-center">
        
        {/* HEADER BLOCK */}
        <div className="w-full flex flex-col items-center text-center pb-8 mb-12 border-b border-[#1a1a1a] max-w-5xl">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Curated results for: <span className="font-medium italic text-[#c0c0c0]">"{query}"</span>
          </h1>
          {!showInitialLoading && !error && results.length > 0 && (
            <p className="text-sm font-medium text-[#c0c0c0] tracking-wide mt-3">
              {combinedTotal} titles discovered within the collection, sorted by audience reception.
            </p>
          )}
        </div>

        {/* LOADING SKELETON */}
        {showInitialLoading && (
          <div className="w-full flex flex-col items-center">
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-12 w-full">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="space-y-4 w-[220px] shrink-0">
                  <div className="aspect-[2/3] w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg" />
                  <div className="h-4 bg-[#0a0a0a] rounded w-5/6 mx-auto" />
                  <div className="h-3 bg-[#0a0a0a] rounded w-1/2 mx-auto" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ERROR STATE */}
        {error && (
          <div className="flex flex-col items-center justify-center h-80 w-full border border-[#1a1a1a] bg-[#050505] rounded-xl p-8 text-center max-w-xl mx-auto my-12">
            <p className="text-sm font-medium text-[#e0e0e0] tracking-wide mb-1.5">Database Disruption</p>
            <p className="text-xs text-[#a0a0a0] leading-relaxed">{error}</p>
          </div>
        )}

        {/* EMPTY STATE */}
        {!showInitialLoading && !error && results.length === 0 && (
          <div className="flex flex-col items-center justify-center h-96 w-full border border-dashed border-[#1a1a1a] bg-[#050505] rounded-xl p-8 text-center max-w-xl mx-auto my-12">
            <p className="text-sm text-[#e0e0e0] font-medium tracking-wide mb-1.5">No Discoveries Found</p>
            <p className="text-xs text-[#a0a0a0] max-w-xs leading-relaxed">
              We couldn’t find any matches in the catalog collection. Try broadening your terms.
            </p>
          </div>
        )}

        {/* THE FIXED RECENTEREING GALLERY */}
        {!error && results.length > 0 && (
          <div className="w-full flex flex-col items-center flex-grow">
            
            {/* THE BALANCING SOLUTION:
              - Completely dropped CSS Grid to prevent cell stretching layout bugs.
              - Standardized an unyielding fixed item card width wrapper (w-[220px] shrink-0).
              - Combined with flex-wrap and justify-center to lock the entire block 
                into mathematical symmetry with zero residual right-side spacing.
            */}
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-12 w-full mb-16">
              {filteredResults.map((item) => (
                <div key={item.id} className="w-[220px] shrink-0 flex justify-center">
                  <div className="w-full">
                    <MovieCard
                      content={item}
                      contentType={item.media_type as 'movie' | 'tv'}
                      genresMap={genresMap}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* BUTTON */}
            {showLoadMoreButton && (
              <div className="flex justify-center items-center pt-8 border-t border-[#1a1a1a] w-full max-w-5xl">
                <button
                  onClick={handleLoadMore}
                  className="px-12 py-3.5 bg-white text-[#020202] rounded-full text-xs font-semibold tracking-wide transition-all duration-300 hover:bg-[#e0e0e0]"
                >
                  Discover More Titles
                </button>
              </div>
            )}
            
            {/* SPINNER */}
            {loading && !showInitialLoading && (
              <div className="flex justify-center items-center py-12 w-full max-w-5xl border-t border-[#1a1a1a]">
                <div className="w-5 h-5 border border-[#404040] border-t-white rounded-full animate-spin" />
              </div>
            )}
            
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="w-full py-6 text-center text-xs font-medium text-[#707070] bg-[#020202] border-t border-[#1a1a1a] mt-auto">
        &copy; {new Date().getFullYear()} Stream Wave Catalog • Curated Media Collection.
      </footer>
    </div>
  );
}