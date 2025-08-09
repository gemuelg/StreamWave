// src/app/movies/page.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const Navbar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMenuOpen(false); // Close menu on search
    }
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-primaryBg bg-opacity-70 backdrop-blur-lg z-50 shadow-2xl">
      <nav className="px-4 py-4 flex items-center justify-between">
        {/* Wordmark Logo */}
        <Link href="/" className="flex items-center space-x-1 hover:opacity-80 transition-opacity" onClick={closeMenu}>
          <span className="text-2xl font-extrabold text-textLight">Stream</span>
          <span className="text-2xl font-light text-accentBlue">Wave</span>
        </Link>
        
        {/* Desktop Navigation & Search (visible on 927px and larger screens) */}
        <div className="hidden min-[927px]:flex items-center space-x-6 lg:space-x-8 xl:space-x-12">
          <Link href="/" className="text-textLight hover:text-accentBlue transition-colors text-md font-semibold">
            Home
          </Link>
          <Link href="/movies" className="text-textLight hover:text-accentBlue transition-colors text-md font-semibold">
            Movies
          </Link>
          <Link href="/tv" className="text-textLight hover:text-accentBlue transition-colors text-md font-semibold">
            TV Shows
          </Link>
          <form onSubmit={handleSearchSubmit} className="relative flex items-center max-w-sm lg:max-w-md xl:max-w-lg">
            <input
              type="text"
              placeholder="Search movies, TV shows..."
              className="w-50 py-2 pl-4 pr-10 rounded-full bg-secondaryBg bg-opacity-70 text-textLight border-2 border-transparent
                          focus:outline-none focus:border-accentBlue focus:ring-2 focus:ring-accentBlue transition-all duration-300
                          placeholder:text-textMuted"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-textMuted hover:text-accentBlue
                          focus:outline-none focus:ring-2 focus:ring-accentBlue rounded-full"
              aria-label="Search"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
          </form>
        </div>

        {/* Hamburger Menu Button (visible on screens below 927px) */}
        <div className="min-[927px]:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-textLight hover:text-accentBlue focus:outline-none focus:ring-2 focus:ring-accentBlue rounded-md"
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? (
              <XMarkIcon className="h-7 w-7" />
            ) : (
              <Bars3Icon className="h-7 w-7" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown (visible on screens below 927px when menu is open) */}
      <div className={`min-[927px]:hidden absolute top-full left-0 w-full bg-primaryBg bg-opacity-90 backdrop-blur-lg transition-all duration-300 ease-in-out ${isMenuOpen ? 'h-auto max-h-screen opacity-100' : 'h-0 max-h-0 overflow-hidden opacity-0'}`}>
        <div className="flex flex-col items-center py-4 space-y-4">
          {/* Search bar inside the mobile menu */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full px-4">
            <input
              type="text"
              placeholder="Search..."
              className="w-full py-2 pl-4 pr-10 rounded-full bg-secondaryBg bg-opacity-70 text-textLight border-2 border-transparent
                          focus:outline-none focus:border-accentBlue focus:ring-2 focus:ring-accentBlue transition-all duration-300
                          placeholder:text-textMuted"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-6 top-1/2 -translate-y-1/2 p-1 text-textMuted hover:text-accentBlue
                          focus:outline-none focus:ring-2 focus:ring-accentBlue rounded-full"
              aria-label="Search"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
          </form>
          <Link href="/" onClick={closeMenu} className="text-textLight hover:text-accentBlue transition-colors text-md font-semibold w-full text-center py-2">
            Home
          </Link>
          <Link href="/movies" onClick={closeMenu} className="text-textLight hover:text-accentBlue transition-colors text-md font-semibold w-full text-center py-2">
            Movies
          </Link>
          <Link href="/tv" onClick={closeMenu} className="text-textLight hover:text-accentBlue transition-colors text-md font-semibold w-full text-center py-2">
            TV Shows
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;