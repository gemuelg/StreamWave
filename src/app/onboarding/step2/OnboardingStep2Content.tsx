"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import axios from 'axios';
import { User } from '@supabase/supabase-js';

// Define data interfaces for type safety
interface Media {
    id: number;
    title?: string;
    name?: string;
    poster_path: string;
    media_type: 'movie' | 'tv';
}

const OnboardingStep2Content: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [user, setUser] = useState<User | null>(null);
    const [media, setMedia] = useState<Media[]>([]);
    const [selectedMedia, setSelectedMedia] = useState<{ id: number; type: 'movie' | 'tv' }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const hasFetched = useRef(false);

    // Fetch user session and initial data
    useEffect(() => {
        // Only proceed if the data hasn't been fetched yet
        if (hasFetched.current) {
            return;
        }

        const fetchMediaData = async () => {
            // Set ref to true to prevent future re-fetches
            hasFetched.current = true;
            setLoading(true);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/auth');
                return;
            }
            setUser(user);

            const genresParam = searchParams.get('genres');
            if (!genresParam) {
                setError('No genres selected. Redirecting...');
                setTimeout(() => router.push('/onboarding/step1'), 3000);
                return;
            }
            const genreIds = genresParam.split(',');

            let allResults: Media[] = [];

            try {
                const moviePromises = [1, 2, 3].map(page =>
                    axios.get(`https://api.themoviedb.org/3/discover/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&with_genres=${genreIds.join(',')}&sort_by=vote_count.desc&vote_count.gte=20&page=${page}`)
                );
                
                const tvPromises = [1, 2, 3].map(page =>
                    axios.get(`https://api.themoviedb.org/3/discover/tv?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&with_genres=${genreIds.join(',')}&sort_by=vote_count.desc&vote_count.gte=20&page=${page}`)
                );

                const [movieResponses, tvResponses] = await Promise.all([
                    Promise.all(moviePromises),
                    Promise.all(tvPromises)
                ]);

                const movieResults = movieResponses.flatMap(res => res.data.results.map((item: any) => ({ ...item, media_type: 'movie' })));
                const tvResults = tvResponses.flatMap(res => res.data.results.map((item: any) => ({ ...item, media_type: 'tv' })));
                
                allResults = [...movieResults, ...tvResults];
                
                const shuffledMedia = allResults.sort(() => Math.random() - 0.5);
                setMedia(shuffledMedia.slice(0, 20));

            } catch (err) {
                setError('Failed to load media. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchMediaData();
    }, [searchParams, router]);

    const handleSelect = (id: number, type: 'movie' | 'tv') => {
        setSelectedMedia(prev => {
            const exists = prev.some(item => item.id === id && item.type === type);
            if (exists) {
                return prev.filter(item => !(item.id === id && item.type === type));
            } else {
                return [...prev, { id, type }];
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || selectedMedia.length === 0) {
            setError('Please select at least one title.');
            return;
        }

        setLoading(true);
        setError(null);

        const genresParam = searchParams.get('genres');
        const genreIds = genresParam ? genresParam.split(',').map(Number) : [];

        const allInterests = [
            ...genreIds.map(id => ({ id, type: 'genre' as 'genre' })),
            ...selectedMedia.map(item => ({ id: item.id, type: item.type })),
        ];

        const formattedInterests = allInterests.map(item => ({
            user_id: user.id,
            interest_id: item.id,
            interest_type: item.type,
        }));

        const { data, error: interestError } = await supabase
            .from('user_interests')
            .upsert(formattedInterests);

        if (interestError) {
            setError('Failed to save interests. Please try again.');
            setLoading(false);
            return;
        }

        setLoading(false);
        router.push('/');
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
    }

    if (error && !loading) {
        return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
    }
    
    if (media.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-white text-center">
                <p>No popular titles found for your selected genres. Please try again with different genres.</p>
                <button
                    onClick={() => router.push('/onboarding/step1')}
                    className="mt-4 bg-accentBlue text-white font-bold py-2 px-4 rounded-full hover:bg-accentPurple"
                >
                    Back to Genres
                </button>
            </div>
        );
    }

    return (
        <div className="bg-primaryBg min-h-screen flex flex-col items-center justify-center text-white px-4 py-12 pt-20">
            <div className="max-w-4xl w-full">
                <form onSubmit={handleSubmit}>
                    <div className="mb-12">
                        <h2 className="text-4xl font-semibold mb-4 text-center">Pick a few titles you love</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 justify-items-center">
                            {media.map(item => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => handleSelect(item.id, item.media_type)}
                                    className={`relative rounded-lg overflow-hidden transition-all duration-300
                                                ${selectedMedia.some(mediaItem => mediaItem.id === item.id && mediaItem.type === item.media_type)
                                            ? 'ring-4 ring-accentBlue ring-offset-4 ring-offset-primaryBg'
                                            : 'hover:scale-105'
                                    }`}
                                >
                                    <img
                                        src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                                        alt={item.title || item.name}
                                        className="w-full h-auto"
                                    />
                                    <span className="absolute inset-0 bg-black bg-opacity-40 flex items-end p-2 opacity-0 hover:opacity-100 transition-opacity text-center text-sm font-semibold">
                                        {item.title || item.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="text-center mt-12">
                        <button
                            type="submit"
                            disabled={loading || selectedMedia.length === 0}
                            className={`bg-accentBlue text-white font-bold py-3 px-8 rounded-full text-lg
                                        transition-colors duration-300 ${loading || selectedMedia.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accentPurple'}`}
                        >
                            {loading ? 'Saving...' : 'Continue'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OnboardingStep2Content;