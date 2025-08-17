// src/components/ui/filters.tsx
"use client";

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { Genre } from '@/lib/tmdb';
import { FunnelIcon } from '@heroicons/react/24/outline';

interface FiltersProps {
  genres: Genre[];
  mediaType: 'movie' | 'tv';
  sortOptions: { name: string; value: string }[];
}

const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);
};

export const Filters = ({ genres, mediaType, sortOptions }: FiltersProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const selectedGenreIds = searchParams.get('genres');
  const selectedYear = searchParams.get('year');
  const selectedSort = searchParams.get('sort_by');

  const years = generateYearOptions();
  const allYears = [{ name: 'All Years', value: '' }, ...years.map(year => ({ name: String(year), value: String(year) }))];
  
  const createQueryString = useCallback(
    (name: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      params.set('page', '1');
      return params.toString();
    },
    [searchParams]
  );

  const handleGenreChange = (genreId: number) => {
    const currentGenres = selectedGenreIds ? selectedGenreIds.split(',') : [];
    const newGenres = currentGenres.includes(String(genreId))
      ? currentGenres.filter(id => id !== String(genreId))
      : [...currentGenres, String(genreId)];

    router.push(pathname + '?' + createQueryString('genres', newGenres.join(',')));
  };

  const handleClearGenres = () => {
    router.push(pathname + '?' + createQueryString('genres', null));
  };

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(pathname + '?' + createQueryString('year', event.target.value || null));
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(pathname + '?' + createQueryString('sort_by', event.target.value));
  };

  const defaultSortValue = sortOptions[0]?.value || 'popularity.desc';

  return (
    <>
      {/* Desktop and Tablet Filters */}
      <div className="hidden tablet:flex flex-wrap items-center gap-4">
        {/* Genre Filter */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-3 rounded-lg bg-secondaryBg text-textLight border border-gray-700 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-accentBlue transition-colors hover:bg-gray-700"
          >
            <FunnelIcon className="h-5 w-5" />
            {selectedGenreIds ? `Selected (${selectedGenreIds.split(',').length})` : 'Filter by Genre'}
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
                      checked={selectedGenreIds?.split(',').includes(String(genre.id)) || false}
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

        {/* Year Filter */}
        <select
          onChange={handleYearChange}
          value={selectedYear || ''}
          className="p-3 rounded-lg bg-secondaryBg text-textLight border border-gray-700 focus:outline-none focus:ring-2 focus:ring-accentBlue"
        >
          {allYears.map(year => (
            <option key={year.value} value={year.value}>{year.name}</option>
          ))}
        </select>
        
        {/* Sort Filter */}
        <select
          onChange={handleSortChange}
          value={selectedSort || defaultSortValue}
          className="p-3 rounded-lg bg-secondaryBg text-textLight border border-gray-700 focus:outline-none focus:ring-2 focus:ring-accentBlue"
        >
          {sortOptions.map(sort => (
            <option key={sort.value} value={sort.value}>{sort.name}</option>
          ))}
        </select>
      </div>

      {/* Mobile Filter Button */}
      <div className="block tablet:hidden relative">
        <button
          onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
          className="p-2 rounded-md bg-secondaryBg text-textLight border border-gray-700 flex items-center justify-center gap-1 focus:outline-none focus:ring-2 focus:ring-accentBlue transition-colors hover:bg-gray-700 text-sm"
        >
          <FunnelIcon className="h-4 w-4" />
          Filter
        </button>
        {isMobileFilterOpen && (
          <div className="absolute top-full right-0 mt-2 w-64 bg-secondaryBg border border-gray-700 rounded-lg shadow-xl z-20 p-4 flex flex-col gap-4">
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-full p-3 rounded-lg bg-primaryBg text-textLight border border-gray-700 flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-accentBlue transition-colors hover:bg-gray-700"
              >
                <span>{selectedGenreIds ? `Selected (${selectedGenreIds.split(',').length})` : 'Filter by Genre'}</span>
                <FunnelIcon className="h-5 w-5" />
              </button>
              {isMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-full bg-secondaryBg border border-gray-700 rounded-lg shadow-xl z-30 p-4 max-h-48 overflow-y-auto custom-scrollbar">
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
                          checked={selectedGenreIds?.split(',').includes(String(genre.id)) || false}
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
              value={selectedYear || ''}
              className="w-full p-3 rounded-lg bg-secondaryBg text-textLight border border-gray-700 focus:outline-none focus:ring-2 focus:ring-accentBlue"
            >
              {allYears.map(year => (
                <option key={year.value} value={year.value}>{year.name}</option>
              ))}
            </select>
            <select
              onChange={handleSortChange}
              value={selectedSort || defaultSortValue}
              className="w-full p-3 rounded-lg bg-secondaryBg text-textLight border border-gray-700 focus:outline-none focus:ring-2 focus:ring-accentBlue"
            >
              {sortOptions.map(sort => (
                <option key={sort.value} value={sort.value}>{sort.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </>
  );
};