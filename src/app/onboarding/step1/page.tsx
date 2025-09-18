"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { supabase } from '@/lib/supabaseClient';

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
                setError('Failed to load genres. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchGenres();
    }, [router]);

    const handleSelectGenre = (genreId: number) => {
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
            setError('Please select at least one genre to continue.');
            return;
        }
        // Redirect to the next step, passing the selected genre IDs in the URL
        router.push(`/onboarding/step2?genres=${selectedGenreIds.join(',')}`);
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
    }

    if (error) {
        return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
    }

    return (
        <div className="bg-primaryBg min-h-screen flex flex-col items-center justify-center text-white px-4 py-12">
            <div className="max-w-3xl w-full text-center">
                <h1 className="text-3xl sm:text-4xl font-bold mb-4">Welcome to StreamWave!</h1>
                <p className="text-textMuted mb-12 text-lg">
                    Tell us what you love to watch.
                </p>

                <div className="mb-12">
                    <h2 className="text-2xl font-semibold mb-6">First, what genres do you like?</h2>
                    <div className="flex flex-wrap justify-center gap-2">
                        {genres.map(genre => (
                            <button
                                key={genre.id}
                                type="button"
                                onClick={() => handleSelectGenre(genre.id)}
                                className={`px-6 py-2 rounded-full font-semibold transition-colors
                                            ${selectedGenreIds.includes(genre.id)
                                        ? 'bg-accentBlue text-white'
                                        : 'bg-secondaryBg/70 text-textMuted hover:bg-secondaryBg/90'
                                }`}
                            >
                                {genre.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="text-center mt-12">
                    <button
                        onClick={handleNext}
                        className={`bg-accentBlue text-white font-bold py-3 px-8 rounded-full text-lg
                                    transition-colors duration-300 ${selectedGenreIds.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accentPurple'}`}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OnboardingStep1;