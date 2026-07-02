"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { supabase } from '@/lib/supabaseClient';
import { SparklesIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface Genre {
    id: number;
    name: string;
}

const OnboardingStep1: React.FC = () => {
    const router = useRouter();
    const [genres, setGenres] = useState<Genre[]>([]);
    const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchGenres = async () => {
            setLoading(true);
            try {
                // Check if user is logged in
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    router.push('/auth');
                    return;
                }

                const genreRes = await axios.get(
                    `https://api.themoviedb.org/3/genre/movie/list?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
                );
                setGenres(genreRes.data.genres);
            } catch (err) {
                setError('Failed to download localized genre matrix vectors.');
            } finally {
                setLoading(false);
            }
        };

        fetchGenres();
    }, [router]);

    const handleSelectGenre = (genreId: number) => {
        setError(null); // Clear any block errors when user interacts
        setSelectedGenreIds(prev => {
            if (prev.includes(genreId)) {
                return prev.filter(id => id !== genreId);
            } else {
                return [...prev, genreId];
            }
        });
    };

    const handleNext = () => {
        if (selectedGenreIds.length === 0) {
            setError('Please isolate at least one genre to calibrate your dashboard feed.');
            return;
        }
        router.push(`/onboarding/step2?genres=${selectedGenreIds.join(',')}`);
    };

    // Sleek cinematic loading sequence
    if (loading) {
        return (
            <div className="min-h-screen w-full bg-[#040406] flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full filter blur-[120px] pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full filter blur-[120px] pointer-events-none" />
                <div className="relative z-10 flex flex-col items-center space-y-4">
                    <svg className="animate-spin h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="font-mono text-xs tracking-widest text-zinc-500 uppercase animate-pulse">Initializing Catalog Matrix...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#040406] min-h-screen w-full flex flex-col items-center justify-center text-white px-6 py-12 relative overflow-hidden">
            {/* ATMOSPHERIC BACKGROUND SYSTEM */}
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/5 rounded-full filter blur-[140px] pointer-events-none z-0" />
            <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full filter blur-[140px] pointer-events-none z-0" />

            <div className="max-w-3xl w-full relative z-10 bg-white/[0.01] border border-white/5 backdrop-blur-xl rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.6)] p-8 sm:p-12 md:p-16">
                
                {/* TIMELINE PROGRESS ANCHOR */}
                <div className="flex justify-center mb-8">
                    <span className="font-mono text-[10px] tracking-[0.3em] text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full uppercase">
                        Step 01 // 02
                    </span>
                </div>

                {/* HEADER BLOCKS */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-3">
                        Welcome to StreamWave
                    </h1>
                    <p className="text-zinc-400 text-sm sm:text-base max-w-md mx-auto font-normal tracking-wide">
                        Calibrate your personalized array interface. Tell us what you love to watch.
                    </p>
                </div>

                {/* ERROR FEEDBACK BAR */}
                {error && (
                    <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono text-center tracking-wide">
                        ⚠️ {error}
                    </div>
                )}

                {/* INTERACTIVE GENRE MATRIX */}
                <div className="space-y-6">
                    <div className="flex items-center justify-center space-x-2 text-zinc-400 mb-2">
                        <SparklesIcon className="w-4 h-4 text-purple-400" />
                        <h2 className="text-sm font-mono tracking-wider uppercase text-zinc-300">Select Preferential Categories</h2>
                    </div>
                    
                    <div className="flex flex-wrap justify-center gap-3">
                        {genres.map(genre => {
                            const isSelected = selectedGenreIds.includes(genre.id);
                            return (
                                <button
                                    key={genre.id}
                                    type="button"
                                    onClick={() => handleSelectGenre(genre.id)}
                                    className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-200 backdrop-blur-sm border transform active:scale-95 ${
                                        isSelected
                                            ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                                            : 'bg-white/[0.02] border-white/10 text-zinc-400 hover:bg-white/[0.06] hover:border-white/20 hover:text-white'
                                    }`}
                                >
                                    {genre.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ACTION BLOCK */}
                <div className="text-center mt-12 pt-6 border-t border-white/5">
                    <button
                        onClick={handleNext}
                        disabled={selectedGenreIds.length === 0}
                        className={`relative inline-flex items-center justify-center p-0.5 overflow-hidden text-xs font-bold tracking-widest uppercase text-white rounded-xl group bg-gradient-to-br from-purple-600 via-cyan-500 to-blue-500 transition-all duration-300 transform active:scale-[0.99] ${
                            selectedGenreIds.length === 0 
                                ? 'opacity-30 cursor-not-allowed filter grayscale' 
                                : 'shadow-[0_0_30px_rgba(139,92,246,0.15)] hover:shadow-[0_0_40px_rgba(6,182,212,0.35)] hover:scale-[1.01]'
                        }`}
                    >
                        <span className="relative flex items-center space-x-2 px-8 py-4 transition-all ease-in duration-200 bg-[#040406]/90 rounded-[10px] group-hover:bg-opacity-0">
                            <span>Proceed Deck</span>
                            <ChevronRightIcon className="w-4 h-4 text-cyan-400 group-hover:text-white transition-colors duration-300" />
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OnboardingStep1;