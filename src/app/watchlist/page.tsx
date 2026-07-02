'use client';

import React, { useState, useEffect } from 'react';
import WatchlistCard from '@/components/WatchlistCard';
import { useWatchlist } from '@/hooks/useWatchlist';
import { PlusIcon, QueueListIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function WatchlistPage() {
  const { watchlist, removeItem } = useWatchlist();
  const [browsingPath, setBrowsingPath] = useState('/');
  const [checkingUser, setCheckingUser] = useState(true);

  // Filter out any duplicate items returned by the hook or the database query
  // by mapped unique record IDs before rendering the UI layers.
  const uniqueWatchlist = Array.from(
    new Map(watchlist.map(item => [item.id, item])).values()
  );

  useEffect(() => {
    async function determineUserFlow() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const isNewUser = !user.user_metadata?.onboarding_completed;

          if (isNewUser) {
            setBrowsingPath('/onboarding/step1');
          } else {
            setBrowsingPath('/');
          }
        }
      } catch (error) {
        console.error('Error authenticating user route vectors:', error);
      } finally {
        setCheckingUser(false);
      }
    }

    determineUserFlow();
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#040406] text-white relative overflow-hidden">
      {/* BRAND AMBIENT BACKGROUND GLOWS */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/5 rounded-full filter blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full filter blur-[120px] pointer-events-none z-0" />

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 py-12 md:py-20 relative z-10">
        
        {/* PREMIUM HERO HEADER MATRIX */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6 mb-8 md:mb-12">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-md">
                My Watchlist
              </h1>
              
              {/* GLASSMORPHIC METADATA ASSET COUNTER */}
              {uniqueWatchlist.length > 0 && (
                <span className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-black px-2.5 py-1 rounded-md tracking-wider backdrop-blur-sm self-end mb-1">
                  {uniqueWatchlist.length} {uniqueWatchlist.length === 1 ? 'ASSET' : 'ASSETS'}
                </span>
              )}
            </div>
            <p className="text-xs md:text-sm text-zinc-400 font-normal tracking-wide">
              Your personalized priority entertainment index.
            </p>
          </div>
        </div>
        
        {uniqueWatchlist.length === 0 ? (
          /* PREMIUM GLASSMORPHIC EMPTY ARCHIVE DECK */
          <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center p-8 sm:p-16 text-center bg-white/[0.01] border border-white/5 backdrop-blur-xl rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] my-12">
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="absolute inset-0 bg-purple-500/10 rounded-full blur-xl animate-pulse" />
              <QueueListIcon className="w-16 h-16 text-zinc-600 relative z-10" />
            </div>
            
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
              Index Queue Empty
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-sm mb-8">
              No target media architectures have been cached inside this cluster. Populate your feed by browsing our deployment index.
            </p>
            
            {/* SIGNATURE BRAND HERO ACTION BUTTON */}
            <Link 
              href={browsingPath} 
              className={`relative inline-flex items-center justify-center p-0.5 overflow-hidden text-xs font-bold tracking-widest uppercase text-white rounded-xl group bg-gradient-to-br from-purple-600 via-cyan-500 to-blue-500 transition-all duration-300 shadow-[0_0_30px_rgba(139,92,246,0.15)] hover:shadow-[0_0_40px_rgba(6,182,212,0.35)] transform hover:scale-[1.02] active:scale-98 ${
                checkingUser ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              <span className="relative flex items-center space-x-3 px-6 py-3.5 transition-all ease-in duration-200 bg-[#040406]/90 rounded-[10px] group-hover:bg-opacity-0">
                <span>{checkingUser ? 'Calibrating Route...' : 'Start Browsing'}</span>
                {!checkingUser && <PlusIcon className="w-4 h-4 text-cyan-400 group-hover:text-white transition-colors duration-300" />}
              </span>
            </Link>
          </div>
        ) : (
          /* RESPONSIVE DISPLAY GRID SYSTEM */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 transition-all duration-300">
            {uniqueWatchlist.map(item => (
              <div 
                key={item.id} 
                className="transform transition-all duration-300 hover:scale-[1.02]"
              >
                <WatchlistCard
                  item={item}
                  onRemove={() => removeItem(item.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}