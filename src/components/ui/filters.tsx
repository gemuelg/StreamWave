"use client";

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { Genre } from '@/lib/tmdb';

interface FiltersProps {
  genres: Genre[];
  mediaType: 'movie' | 'tv';
  sortOptions: { name: string; value: string }[];
}

const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: currentYear - 1920 + 1 }, (_, i) => currentYear - i);
};

export const Filters = ({ genres, mediaType, sortOptions }: FiltersProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Active parameter extractions
  const selectedGenreIds = searchParams.get('genres') ? searchParams.get('genres')!.split(',') : [];
  const selectedYear = searchParams.get('year') || '';
  const selectedSort = searchParams.get('sort_by') || sortOptions[0]?.value || 'popularity.desc';

  const years = generateYearOptions();

  // State parameter compiler
  const createQueryString = useCallback(
    (name: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      params.set('page', '1'); // Reset pages when criteria shifts
      return params.toString();
    },
    [searchParams]
  );

  const handleGenreChange = (genreId: number) => {
    const idString = String(genreId);
    const newGenres = selectedGenreIds.includes(idString)
      ? selectedGenreIds.filter(id => id !== idString)
      : [...selectedGenreIds, idString];

    const queryString = newGenres.length > 0 
      ? createQueryString('genres', newGenres.join(','))
      : createQueryString('genres', null);

    router.push(`${pathname}?${queryString}`);
  };

  const handleClearAll = () => {
    router.push(pathname);
    setIsMobileDrawerOpen(false);
  };

  const hasActiveFilters = searchParams.has('genres') || searchParams.has('year') || searchParams.has('sort_by');

  // RENDER INTERACTION ELEMENT FOR MAIN SELECTIONS
  const FilterDashboardBody = () => (
    <div className="flex flex-col gap-7">
      
      {/* MODULE 1: SEQUENCING CORE */}
      <div className="space-y-2.5">
        <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 flex items-center gap-2">
          <span className="w-1 h-1 bg-zinc-500 rounded-full" /> Sort Matrix
        </label>
        <div className="grid grid-cols-1 gap-1">
          {sortOptions.map((sort) => {
            const isSelected = selectedSort === sort.value;
            return (
              <button
                key={sort.value}
                onClick={() => router.push(`${pathname}?${createQueryString('sort_by', sort.value)}`)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium tracking-wide transition-all text-left
                  ${isSelected 
                    ? 'bg-zinc-100 text-zinc-950 font-bold border-l-2 border-zinc-400 pl-2.5 shadow-sm' 
                    : 'bg-zinc-900/30 border border-zinc-900/40 hover:border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
              >
                <span>{sort.name}</span>
                {isSelected && <span className="w-1 h-1 rounded-full bg-zinc-950" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* MODULE 2: RE-ENGINEERED GENRE CLUSTER */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 flex items-center gap-2">
            <span className="w-1 h-1 bg-zinc-500 rounded-full" /> Genre Classifications
          </label>
          {selectedGenreIds.length > 0 && (
            <button
              onClick={() => router.push(`${pathname}?${createQueryString('genres', null)}`)}
              className="text-[10px] font-mono uppercase text-rose-400 hover:text-rose-300 transition-colors"
            >
              Reset Tags
            </button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-1.5 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
          {genres.map((genre) => {
            const isSelected = selectedGenreIds.includes(String(genre.id));
            return (
              <button
                key={genre.id}
                onClick={() => handleGenreChange(genre.id)}
                className={`px-2.5 py-1.5 rounded text-[11px] font-medium tracking-wide transition-all duration-150 flex items-center gap-1.5 border
                  ${isSelected
                    ? 'bg-zinc-200 text-zinc-950 font-semibold border-white'
                    : 'bg-zinc-900/30 text-zinc-400 border-zinc-900/60 hover:border-zinc-800 hover:text-zinc-200'
                  }`}
              >
                <span>{genre.name}</span>
                {isSelected && (
                  <svg className="w-3 h-3 text-zinc-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* MODULE 3: TEMPORAL CHRONOLOGY DECK */}
      <div className="space-y-2.5">
        <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 flex items-center gap-2">
          <span className="w-1 h-1 bg-zinc-500 rounded-full" /> Temporal Index
        </label>
        <div className="relative w-full">
          <select
            value={selectedYear}
            onChange={(e) => router.push(`${pathname}?${createQueryString('year', e.target.value || null)}`)}
            className="w-full px-3 py-2.5 rounded-md bg-zinc-900/40 border border-zinc-900 text-xs font-medium tracking-wide text-zinc-300 hover:text-white hover:border-zinc-800 focus:outline-none focus:border-zinc-700 appearance-none cursor-pointer"
          >
            <option value="" className="bg-zinc-950 text-zinc-400">All Timeline Eras</option>
            {years.map((year) => (
              <option key={year} value={String(year)} className="bg-zinc-950 text-zinc-200">
                Release Matrix: {year}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* MODULE 4: FLUSH ENTIRE WORKSPACE CONTROL */}
      {hasActiveFilters && (
        <button
          onClick={handleClearAll}
          className="w-full py-2.5 mt-2 bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-md text-[10px] font-mono tracking-widest uppercase transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Reset Catalog Filters
        </button>
      )}

    </div>
  );

  return (
    <>
      {/* 1. DESKTOP VIEWPORT SIDEBAR INTERFACE FRAME */}
      <div className="hidden lg:block w-full">
        <FilterDashboardBody />
      </div>

      {/* 2. MOBILE FLOATING ACTION TRIGGER */}
      <div className="block lg:hidden w-full px-4">
        <button
          onClick={() => setIsMobileDrawerOpen(true)}
          className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-800/60 flex items-center justify-between text-xs font-medium tracking-wide text-zinc-300 hover:text-white"
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <span>Configure Engine Matrix</span>
          </div>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          )}
        </button>
      </div>

      {/* 3. MOBILE MODAL WORKSPACE OVERLAY BOTTOM-SHEET */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 block lg:hidden animate-fade-in">
          {/* Glass Overlay backdrop panel */}
          <div 
            className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm" 
            onClick={() => setIsMobileDrawerOpen(false)}
          />
          
          {/* Slide up sheet housing container */}
          <div className="absolute bottom-0 inset-x-0 bg-zinc-950 border-t border-zinc-900 rounded-t-2xl max-h-[85vh] overflow-y-auto p-6 shadow-2xl flex flex-col gap-6">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
              <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-400">Control Parameters</h3>
              <button 
                onClick={() => setIsMobileDrawerOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-zinc-900 text-zinc-400 hover:text-white"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="pb-4">
              <FilterDashboardBody />
            </div>
          </div>
        </div>
      )}
    </>
  );
};