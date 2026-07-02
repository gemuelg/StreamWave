"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, Bars3Icon, XMarkIcon, UserIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';

const Navbar: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isRandomLoading, setIsRandomLoading] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            subscription.unsubscribe();
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
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
            console.error("TMDB API key missing.");
            setIsRandomLoading(false);
            return;
        }

        const mediaTypeAPI = Math.random() < 0.5 ? 'movie' : 'tv';
        const randomPage = Math.floor(Math.random() * 400) + 1;

        try {
            const response = await fetch(`https://api.themoviedb.org/3/discover/${mediaTypeAPI}?api_key=${apiKey}&language=en-US&sort_by=popularity.desc&include_adult=false&page=${randomPage}`);
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
                const randomIndex = Math.floor(Math.random() * data.results.length);
                const randomItem = data.results[randomIndex];
                const mediaTypeRoute = mediaTypeAPI === 'movie' ? 'movies' : 'tv';

                router.push(`/${mediaTypeRoute}/${randomItem.id}`);
            } else {
                await handleRandomClick();
            }
        } catch (error) {
            console.error("Failed to fetch random content:", error);
        } finally {
            setIsRandomLoading(false);
            setIsMenuOpen(false);
        }
    };

    const username = user?.user_metadata?.username;

    return (
        <header 
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
                isScrolled 
                    ? 'bg-[#040406]/90 backdrop-blur-xl border-b border-white/[0.06] py-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]' 
                    : 'bg-gradient-to-b from-[#040406]/90 to-transparent py-6'
            }`}
        >
            <nav className="max-w-[1440px] mx-auto px-8 flex items-center justify-between relative" aria-label="Global Navigation">
                
                {/* 1. BRAND LOGO */}
                <Link href="/" className="flex items-center space-x-3 group active:scale-98 transition-transform z-10">
                    <div className="relative p-2 bg-gradient-to-b from-white/[0.08] to-transparent border border-white/10 rounded-xl group-hover:border-purple-500/40 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all duration-300">
                        <svg className="h-5 w-5 transition-transform duration-500 group-hover:scale-105" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 12C5.1 7.5 7 9.5 12C11.5 17 13.5 17 15.5 12C17.5 7 20 7 21 12" stroke="url(#premiumWave)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M5 12C6.8 8.5 8.8 8.5 10.5 12C12.2 15.5 14.2 15.5 15.5 12" stroke="url(#premiumWaveCyan)" strokeWidth="1.8" strokeLinecap="round" opacity="0.5"/>
                            <circle cx="12" cy="12" r="1.5" fill="#ffffff" className="animate-ping" />
                            <defs>
                                <linearGradient id="premiumWave" x1="3" y1="12" x2="21" y2="12" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#A78BFA" />
                                    <stop offset="0.5" stopColor="#8B5CF6" />
                                    <stop offset="1" stopColor="#06B6D4" />
                                </linearGradient>
                                <linearGradient id="premiumWaveCyan" x1="5" y1="12" x2="15.5" y2="12" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#06B6D4" />
                                    <stop offset="1" stopColor="#3B82F6" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <span className="text-lg font-black tracking-widest uppercase text-white font-mono">
                        Stream<span className="text-cyan-400 font-light lowercase tracking-normal">wave</span>
                    </span>
                </Link>

                {/* 2. DESKTOP CENTER NAVIGATION PILL */}
                <div className="hidden min-[927px]:flex absolute left-1/2 -translate-x-1/2 items-center bg-white/[0.02] border border-white/[0.08] backdrop-blur-md rounded-full p-1 shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
                    <Link href="/home" className="text-slate-400 hover:text-white transition-all text-[11px] font-bold tracking-widest uppercase px-5 py-2 rounded-full hover:bg-white/[0.04]">
                        Home
                    </Link>
                    <Link href="/movies" className="text-slate-400 hover:text-white transition-all text-[11px] font-bold tracking-widest uppercase px-5 py-2 rounded-full hover:bg-white/[0.04]">
                        Movies
                    </Link>
                    <Link href="/tv" className="text-slate-400 hover:text-white transition-all text-[11px] font-bold tracking-widest uppercase px-5 py-2 rounded-full hover:bg-white/[0.04]">
                        TV Shows
                    </Link>
                </div>

                {/* 3. DESKTOP RIGHT PANEL ACTIONS */}
                <div className="hidden min-[927px]:flex items-center gap-4 z-10">
                    <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-48 py-1.5 pl-4 pr-10 rounded-full bg-white/[0.04] border border-white/10 text-xs text-white
                                     focus:outline-none focus:w-60 focus:bg-[#060609] focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/[0.05] transition-all duration-500
                                     placeholder:text-slate-500 placeholder:tracking-wider"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-cyan-400 transition-colors">
                            <MagnifyingGlassIcon className="h-3.5 w-3.5" />
                        </button>
                    </form>

                    <button
                        onClick={handleRandomClick}
                        disabled={isRandomLoading}
                        className={`p-2 rounded-xl border border-white/10 bg-white/[0.02] transition-all duration-300 group ${
                            isRandomLoading ? 'text-purple-400 cursor-not-allowed bg-purple-500/10' : 'text-slate-400 hover:text-purple-400 hover:border-purple-500/20 hover:bg-purple-500/[0.06]'
                        }`}
                        title="Algorithmic Shuffle Search"
                    >
                        <svg className={`h-4 w-4 ${isRandomLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="16 3 21 3 21 8"></polyline>
                            <line x1="4" y1="20" x2="21" y2="3"></line>
                            <polyline points="21 16 21 21 16 21"></polyline>
                            <line x1="15" y1="15" x2="21" y2="21"></line>
                            <line x1="4" y1="4" x2="9" y2="9"></line>
                        </svg>
                    </button>

                    {user ? (
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="border border-purple-500/20 bg-purple-500/[0.08] text-white px-4 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300 flex items-center space-x-2 hover:border-purple-500/40"
                            >
                                <UserIcon className="h-3.5 w-3.5 text-purple-400" />
                                <span className="max-w-[80px] truncate">{username || 'Account'}</span>
                            </button>
                            {isUserMenuOpen && (
                                <div className="absolute top-full right-0 mt-3 w-48 bg-[#060609]/95 backdrop-blur-xl rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.8)] border border-white/10 overflow-hidden z-50">
                                    <Link href="/watchlist" className="block px-4 py-2.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors" onClick={() => setIsUserMenuOpen(false)}>
                                        Watchlist
                                    </Link>
                                    <button onClick={handleSignOut} className="w-full text-left px-4 py-2.5 text-xs font-medium text-rose-400 hover:bg-rose-500/[0.08] transition-colors border-t border-white/5">
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link href="/auth" className="relative overflow-hidden border border-cyan-500/20 text-white px-5 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300 group hover:border-cyan-400/50">
                            <span className="relative z-10 group-hover:text-black transition-colors duration-300">Sign In</span>
                            <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100" />
                        </Link>
                    )}
                </div>

                {/* 4. MOBILE INTERACTIVE ACTION LAYER */}
                <div className="min-[927px]:hidden flex items-center space-x-2 z-10">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2 text-slate-300 bg-white/[0.04] border border-white/5 rounded-xl transition-all"
                        aria-label="Toggle Menu"
                    >
                        {isMenuOpen ? <XMarkIcon className="h-4 w-4" /> : <Bars3Icon className="h-4 w-4" />}
                    </button>
                </div>
            </nav>

            {/* 5. MOBILE EXPANDABLE DRAWER OVERLAY */}
            <div className={`min-[927px]:hidden absolute top-full left-0 w-full bg-[#040406]/95 backdrop-blur-xl border-b border-white/[0.08] transition-all duration-300 ease-in-out ${isMenuOpen ? 'opacity-100 max-h-screen py-6 shadow-2xl' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                <div className="flex flex-col items-center space-y-4 px-6">
                    <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
                        <input
                            type="text"
                            placeholder="Search content nodes..."
                            className="w-full py-2 pl-4 pr-10 rounded-full bg-white/[0.04] text-white text-xs border border-white/10 focus:outline-none focus:border-purple-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                            <MagnifyingGlassIcon className="h-4 w-4" />
                        </button>
                    </form>
                    
                    <Link href="/home" onClick={() => setIsMenuOpen(false)} className="text-slate-300 text-xs font-bold tracking-widest uppercase w-full text-center py-2.5 rounded-xl hover:bg-white/[0.04]">
                        Home
                    </Link>
                    <Link href="/movies" onClick={() => setIsMenuOpen(false)} className="text-slate-300 text-xs font-bold tracking-widest uppercase w-full text-center py-2.5 rounded-xl hover:bg-white/[0.04]">
                        Movies
                    </Link>
                    <Link href="/tv" onClick={() => setIsMenuOpen(false)} className="text-slate-300 text-xs font-bold tracking-widest uppercase w-full text-center py-2.5 rounded-xl hover:bg-white/[0.04]">
                        TV Shows
                    </Link>

                    <button 
                        onClick={handleRandomClick}
                        className="w-full text-center py-2.5 text-xs text-purple-400 font-bold tracking-widest uppercase border-t border-white/5 flex items-center justify-center space-x-2"
                    >
                        <span>Surprise Me</span>
                    </button>
                    
                    {user ? (
                        <div className="w-full border-t border-white/5 pt-2 flex flex-col items-center">
                            <Link href="/watchlist" onClick={() => setIsMenuOpen(false)} className="text-slate-400 text-xs py-2">
                                My Watchlist ({username || 'Profile'})
                            </Link>
                            <button onClick={handleSignOut} className="text-rose-400 text-xs py-2 font-semibold">
                                Disconnect Session
                            </button>
                        </div>
                    ) : (
                        <Link href="/auth" onClick={() => setIsMenuOpen(false)} className="text-cyan-400 text-xs font-bold tracking-widest uppercase w-full text-center py-3 border-t border-white/5">
                            Authorize Account
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;