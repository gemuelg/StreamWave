"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import axios from 'axios';
import { User } from '@supabase/supabase-js';
import { CheckIcon, ArrowRightIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

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

  useEffect(() => {
    if (hasFetched.current) return;

    const fetchMediaData = async () => {
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
        setError('No configuration assets mapped. Redirecting back...');
        setTimeout(() => router.push('/onboarding/step1'), 3000);
        return;
      }
      const genreIds = genresParam.split(',');

      try {
        const moviePromises = [1, 2].map(page =>
          axios.get(`https://api.themoviedb.org/3/discover/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&with_genres=${genreIds.join(',')}&sort_by=vote_count.desc&vote_count.gte=20&page=${page}`)
        );
        
        const tvPromises = [1, 2].map(page =>
          axios.get(`https://api.themoviedb.org/3/discover/tv?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&with_genres=${genreIds.join(',')}&sort_by=vote_count.desc&vote_count.gte=20&page=${page}`)
        );

        const [movieResponses, tvResponses] = await Promise.all([
          Promise.all(moviePromises),
          Promise.all(tvPromises)
        ]);

        const movieResults = movieResponses.flatMap(res => res.data.results.map((item: any) => ({ ...item, media_type: 'movie' })));
        const tvResults = tvResponses.flatMap(res => res.data.results.map((item: any) => ({ ...item, media_type: 'tv' })));
        
        const allResults = [...movieResults, ...tvResults];
        const shuffledMedia = allResults.sort(() => Math.random() - 0.5);
        setMedia(shuffledMedia.slice(0, 24)); // Expanded to an even 24 items for cleaner multi-device grids

      } catch (err) {
        setError('Failed to instantiate architecture clusters from global index.');
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
      setError('Vector calculation requires at least one asset.');
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

    const { error: interestError } = await supabase
      .from('user_interests')
      .upsert(formattedInterests);

    if (interestError) {
      setError('Matrix write operational failure. Try running execution sequence again.');
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push('/');
  };

  // 1. PREMIUM GLASSMORPHIC SYSTEM LOADING STATE
  if (loading && media.length === 0) {
    return (
      <div className="w-full min-h-screen bg-[#040406] flex items-center justify-center text-white px-4">
        <div className="w-full max-w-md p-8 text-center bg-white/[0.01] border border-white/5 backdrop-blur-xl rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="w-12 h-12 border-2 border-t-cyan-400 border-r-purple-500 border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs font-mono tracking-widest text-zinc-400 uppercase">Synchronizing Media Stream</p>
        </div>
      </div>
    );
  }

  // 2. PREMIUM ERROR FEEDBACK STATE
  if (error && !loading && media.length === 0) {
    return (
      <div className="w-full min-h-screen bg-[#040406] flex items-center justify-center text-white px-4">
        <div className="w-full max-w-md p-8 text-center bg-white/[0.01] border border-red-500/10 backdrop-blur-xl rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.05)]">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500/80 mx-auto mb-4" />
          <h3 className="text-lg font-black tracking-tight mb-2">System Core Error</h3>
          <p className="text-xs text-zinc-400 font-mono mb-6 uppercase leading-relaxed">{error}</p>
          <button
            onClick={() => router.push('/onboarding/step1')}
            className="text-xs font-mono tracking-wider text-cyan-400 border border-cyan-400/20 px-4 py-2 rounded hover:bg-cyan-400/10 transition-all duration-200"
          >
            RETURN TO CONFIG INDEX
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#040406] text-white relative overflow-hidden">
      {/* BRAND AMBIENT BACKGROUND GLOW MATRIX */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-purple-600/5 rounded-full filter blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full filter blur-[140px] pointer-events-none z-0" />

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 py-12 md:py-20 relative z-10">
        <form onSubmit={handleSubmit} className="space-y-12">
          
          {/* HIGH SIGNAL CONTROL HEADER STRIP */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-black tracking-[0.3em] text-cyan-400 block uppercase">
                02 // Media Instancing
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
                Anchor Your Core Taste
              </h1>
              <p className="text-xs md:text-sm text-zinc-400 max-w-xl">
                Select target media profiles below to baseline and seed your deployment catalog.
              </p>
            </div>

            {/* SELECTION TRACKER DECK */}
            <div className="flex items-center space-x-4 self-start md:self-end">
              <span className="bg-white/[0.02] border border-white/5 px-4 py-2 rounded-xl text-xs font-mono text-zinc-400 backdrop-blur-sm">
                SELECTED: <span className="text-white font-bold">{selectedMedia.length}</span> UNITS
              </span>
            </div>
          </div>

          {/* DYNAMIC ASSET PORTFOLO GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {media.map(item => {
              const isSelected = selectedMedia.some(
                mediaItem => mediaItem.id === item.id && mediaItem.type === item.media_type
              );

              return (
                <button
                  key={`${item.media_type}-${item.id}`}
                  type="button"
                  onClick={() => handleSelect(item.id, item.media_type)}
                  className={`group relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-zinc-900 border text-left transition-all duration-500 transform outline-none shadow-md ${
                    isSelected
                      ? 'border-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.25)] scale-[1.02]'
                      : 'border-white/5 hover:border-white/20 hover:scale-[1.02]'
                  }`}
                >
                  {/* POSTER RENDERING RASTER */}
                  {item.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                      alt={item.title || item.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-4 bg-[#0a0a0f] text-xs font-mono text-zinc-500 text-center">
                      {item.title || item.name}
                      <span className="block text-[9px] opacity-40 mt-1 uppercase">No Poster Available</span>
                    </div>
                  )}

                  {/* HIGH CONTRAST GLASS RADAR SHIELD */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent transition-opacity duration-300 flex flex-col justify-between p-4 ${
                    isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}>
                    
                    {/* TOP BADGES LAYER */}
                    <div className="flex justify-between items-start">
                      <span className="bg-black/60 backdrop-blur-md text-[9px] font-mono font-bold tracking-wider px-2 py-0.5 rounded border border-white/10 text-zinc-300 uppercase">
                        {item.media_type}
                      </span>
                      {isSelected && (
                        <div className="bg-cyan-400 text-black p-1 rounded-md shadow-md animate-fade-in">
                          <CheckIcon className="w-3 h-3 stroke-[3.5]" />
                        </div>
                      )}
                    </div>

                    {/* BOTTOM TEXT META */}
                    <div>
                      <h4 className="text-xs sm:text-sm font-black tracking-tight text-white line-clamp-2 leading-tight drop-shadow-md">
                        {item.title || item.name}
                      </h4>
                      {isSelected && (
                        <span className="text-[9px] font-mono font-black text-cyan-400 tracking-widest uppercase block mt-1">
                          [ CACHED INDEX ]
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* SYSTEM ARCHITECTURE INTERACTIVE SUBMIT ROUTE */}
          <div className="flex flex-col items-center justify-center border-t border-white/5 pt-12 mt-12">
            {error && (
              <p className="text-xs font-mono text-red-400 uppercase tracking-wider mb-4 animate-pulse">
                !! {error} !!
              </p>
            )}

            <button
              type="submit"
              disabled={loading || selectedMedia.length === 0}
              className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-xs font-bold tracking-widest uppercase text-white rounded-xl group bg-gradient-to-br from-purple-600 via-cyan-500 to-blue-500 transition-all duration-300 shadow-[0_0_30px_rgba(139,92,246,0.15)] hover:shadow-[0_0_40px_rgba(6,182,212,0.35)] transform hover:scale-[1.02] active:scale-98 disabled:opacity-30 disabled:pointer-events-none"
            >
              <span className="relative flex items-center space-x-3 px-8 py-4 transition-all ease-in duration-200 bg-[#040406]/90 rounded-[10px] group-hover:bg-opacity-0">
                <span>{loading ? 'Committing State...' : 'Finalize Deployment'}</span>
                {!loading && <ArrowRightIcon className="w-4 h-4 text-cyan-400 group-hover:text-white transition-colors duration-300" />}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OnboardingStep2Content;