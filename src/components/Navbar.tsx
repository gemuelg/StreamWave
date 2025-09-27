"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, Bars3Icon, XMarkIcon, UserIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';

const Navbar: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isRandomLoading, setIsRandomLoading] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (!error) {
            window.location.href = '/';
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
            setIsMenuOpen(false);
        }
    };

    const handleRandomClick = async () => {
    if (isRandomLoading) return;
    setIsRandomLoading(true);

    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    if (!apiKey) {
        console.error("TMDB API key is not set. Please add NEXT_PUBLIC_TMDB_API_KEY to your .env.local file.");
        setIsRandomLoading(false);
        return;
    }

    const mediaTypeAPI = Math.random() < 0.5 ? 'movie' : 'tv';
    
    const randomPage = Math.floor(Math.random() * 500) + 1;

    try {
        const response = await fetch(`https://api.themoviedb.org/3/discover/${mediaTypeAPI}?api_key=${apiKey}&language=en-US&sort_by=popularity.desc&include_adult=false&page=${randomPage}`);
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            const randomIndex = Math.floor(Math.random() * data.results.length);
            const randomItem = data.results[randomIndex];

            // Correctly set the URL to the plural form for your router
            const mediaTypeRoute = mediaTypeAPI === 'movie' ? 'movies' : 'tv';

            router.push(`/${mediaTypeRoute}/${randomItem.id}`);
        } else {
            console.warn("No results found on the selected random page. Trying again...");
            await handleRandomClick();
        }
    } catch (error) {
        console.error("Failed to fetch random content:", error);
        setIsRandomLoading(false);
    } finally {
        if (!isRandomLoading) {
            closeMenu();
        }
    }
};

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    const username = user?.user_metadata?.username;

    return (
        <header className="fixed top-0 left-0 w-full bg-primaryBg bg-opacity-70 backdrop-blur-lg z-50 shadow-2xl" role="banner">
            <nav className="px-4 py-4 flex items-center justify-between" aria-label="Main navigation links">
                <Link href="/" className="flex items-center space-x-1 hover:opacity-80 transition-opacity" onClick={closeMenu}>
                    <span className="text-2xl font-extrabold text-textLight">Stream</span>
                    <span className="text-2xl font-light text-accentBlue">Wave</span>
                </Link>
                
                <div className="hidden min-[927px]:flex items-center justify-between flex-1 pl-12 pr-4">
                    <div className="flex items-center gap-6 lg:gap-8 xl:gap-10">
                        <Link href="/" className="text-textLight hover:text-accentBlue transition-colors text-md font-semibold">
                            Home
                        </Link>
                        <Link href="/movies" className="text-textLight hover:text-accentBlue transition-colors text-md font-semibold">
                            Movies
                        </Link>
                        <Link href="/tv" className="text-textLight hover:text-accentBlue transition-colors text-md font-semibold">
                            TV Shows
                        </Link>
                    </div>
                    
                    <div className="flex items-center gap-6 lg:gap-8 xl:gap-10">
                        <form onSubmit={handleSearchSubmit} className="relative flex items-center" role="search">
                            <input
                                type="text"
                                placeholder="Search movies, TV shows..."
                                className="w-56 py-1 pl-4 pr-10 rounded-full bg-secondaryBg bg-opacity-70 text-textLight border-2 border-transparent
                                             focus:outline-none focus:border-accentBlue focus:ring-2 focus:ring-accentBlue transition-all duration-300
                                             placeholder:text-textMuted"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-textMuted hover:text-accentBlue
                                             focus:outline-none focus:ring-2 focus:ring-accentBlue rounded-full"
                                aria-label="Submit search query"
                            >
                                <MagnifyingGlassIcon className="h-5 w-5" />
                            </button>
                        </form>

                        <button
                            onClick={handleRandomClick}
                            disabled={isRandomLoading}
                            className={`p-2 rounded-full transition-colors duration-300 ${isRandomLoading ? 'text-textMuted animate-pulse' : 'text-textLight hover:text-accentBlue'}`}
                            title="Go to a random movie or TV show"
                            aria-label="Discover a Random Movie or TV Show"
                        >
                            <ArrowPathIcon className="h-6 w-6" />
                        </button>

                        {user ? (
                            <div className="relative" ref={userMenuRef}>
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="relative overflow-hidden border-2 border-accentBlue text-white px-6 py-1 rounded-full text-sm font-semibold transition-all duration-300 group"
                                >
                                    <span className="flex items-center space-x-2 relative z-10 transition-colors duration-300 group-hover:text-textLight">
                                        <UserIcon className="h-5 w-5" />
                                        <span>{username ? username : 'My Account'}</span>
                                    </span>
                                    <span className="absolute inset-0 bg-accentBlue transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></span>
                                </button>
                                {isUserMenuOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-48 bg-primaryBg/90 backdrop-blur-md rounded-md shadow-lg border border-gray-700 overflow-hidden z-50">
                                        <div className="px-4 py-2 text-textLight font-semibold border-b border-gray-600">
                                            {username ? `Hello, ${username}` : 'My Account'}
                                        </div>
                                        <Link href="/watchlist" className="block px-4 py-2 text-textMuted hover:bg-secondaryBg/70 transition-colors" onClick={() => setIsUserMenuOpen(false)}>
                                            Watchlist
                                        </Link>
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full text-left px-4 py-2 text-textMuted hover:bg-secondaryBg/70 transition-colors"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link 
                                href="/auth" 
                                className="relative overflow-hidden border-2 border-accentBlue text-white px-6 py-1 rounded-full text-sm font-semibold transition-all duration-300 group"
                            >
                                <span className="relative z-10 transition-colors duration-300 group-hover:text-textLight">
                                    Sign In
                                </span>
                                <span className="absolute inset-0 bg-accentBlue transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></span>
                            </Link>
                        )}
                    </div>
                </div>
                
                <div className="min-[927px]:hidden flex items-center space-x-4">
                    {user ? (
                        <div className="relative" ref={userMenuRef}>
                            <button 
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="p-2 text-textLight hover:text-accentBlue focus:outline-none focus:ring-2 focus:ring-accentBlue rounded-md"
                            >
                                <UserIcon className="h-7 w-7" />
                            </button>
                            {isUserMenuOpen && (
                                <div className="absolute top-full right-0 mt-2 w-48 bg-primaryBg/90 backdrop-blur-md rounded-md shadow-lg border border-gray-700 overflow-hidden z-50">
                                    <div className="px-4 py-2 text-textLight font-semibold border-b border-gray-600">
                                        {username ? `Hello, ${username}` : 'My Account'}
                                    </div>
                                    <Link href="/watchlist" className="block px-4 py-2 text-textMuted hover:bg-secondaryBg/70 transition-colors" onClick={() => setIsUserMenuOpen(false)}>
                                        Watchlist
                                    </Link>
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full text-left px-4 py-2 text-textMuted hover:bg-secondaryBg/70 transition-colors"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        null
                    )}

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

            <div className={`min-[927px]:hidden absolute top-full left-0 w-full bg-primaryBg bg-opacity-90 backdrop-blur-lg transition-all duration-300 ease-in-out ${isMenuOpen ? 'h-auto max-h-screen opacity-100' : 'h-0 max-h-0 overflow-hidden opacity-0'}`}>
                <div className="flex flex-col items-center py-4 space-y-4">
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
                    
                    {!user && (
                        <Link href="/auth" onClick={closeMenu} className="text-textLight hover:text-accentBlue transition-colors text-md font-semibold w-full text-center py-2">
                            <span className="inline-flex items-center space-x-2">
                                <UserIcon className="h-5 w-5" />
                                <span>Sign In / Register</span>
                            </span>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;