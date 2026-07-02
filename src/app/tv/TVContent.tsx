"use client";

import React, { useMemo } from 'react';
import Navbar from '@/components/Navbar';
import { TVShow, Genre } from '@/lib/tmdb';
import { useRouter, useSearchParams } from 'next/navigation';
import ContentList from '@/components/ContentList';
import { Filters } from '@/components/ui/filters';

interface TVContentProps {
  initialTVShows: TVShow[];
  initialTotalPages: number;
  genres: Genre[];
  currentPage: number;
}

const tvSortOptions = [
  { name: 'Trending', value: 'popularity.desc' },
  { name: 'Release Date', value: 'first_air_date.desc' },
  { name: 'Name A-Z', value: 'name.asc' },
];

export default function TVContent({
  initialTVShows,
  initialTotalPages,
  genres,
  currentPage,
}: TVContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const genresMap = useMemo(() => {
    return new Map(genres.map(genre => [genre.id, genre.name]));
  }, [genres]);

  const handlePageClick = (pageNumber: number | string) => {
    if (typeof pageNumber !== 'number') return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', pageNumber.toString());
    router.push(`/tv?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 antialiased select-none">
      <Navbar />
      
      {/* SPLIT PANEL MASTER LAYOUT ENGINE
        Transitions from a single column stack on mobile to a multi-pane interface on wide displays.
      */}
      <div className="flex-grow w-full max-w-[1600px] mx-auto flex flex-col lg:flex-row pt-24 min-h-0">
        
        {/* LEFT COMPONENT PANEL: FIXED CONTROL DECK */}
        <aside className="w-full lg:w-[340px] flex-shrink-0 px-6 lg:pl-12 lg:pr-8 py-6 lg:py-10 lg:sticky lg:top-24 lg:h-[calc(100vh-96px)] flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-zinc-900/60">
          <div className="space-y-8">
            {/* System Status Tracker */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                  Broadcast Node Active
                </p>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white uppercase font-sans">
                TV <br className="hidden lg:block" />Showcase
              </h1>
            </div>

            {/* Micro Metadata Statistics Box */}
            <div className="hidden lg:block p-4 rounded-lg bg-zinc-900/20 border border-zinc-900/80 font-mono text-[11px] text-zinc-400 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-zinc-600">INDEX:</span>
                <span>TMDB_TV_LIVE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">PAGE STAGE:</span>
                <span>{currentPage} / {initialTotalPages}</span>
              </div>
            </div>

            {/* Filter Module Anchor Wrapper */}
            <div className="pt-2">
              <p className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider mb-3 px-1 lg:block hidden">
                Filter Configurations
              </p>
              <div className="w-full bg-zinc-900/10 lg:bg-transparent rounded-lg p-1 lg:p-0">
                <Filters genres={genres} mediaType="tv" sortOptions={tvSortOptions} />
              </div>
            </div>
          </div>

          {/* Clean Editorial Segment Indicator */}
          <div className="hidden lg:block pt-6 border-t border-zinc-900">
            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
              Stream Wave Operational Architecture &copy; 2026
            </p>
          </div>
        </aside>

        {/* RIGHT COMPONENT PANEL: EXPANSIVE CONTENT DISPLAY STAGE */}
        <main className="flex-1 min-w-0 px-6 lg:px-12 py-8 lg:py-10">
          <section className="w-full">
            <ContentList
              content={initialTVShows}
              mediaType="tv"
              totalPages={initialTotalPages}
              currentPage={currentPage}
              onPageClick={handlePageClick}
              genresMap={genresMap}
            />
          </section>
        </main>

      </div>

      {/* FOOTER SYSTEM UNIT */}
      <footer className="w-full py-4 text-center text-[10px] font-mono tracking-widest uppercase text-zinc-700 bg-zinc-950 border-t border-zinc-950/80">
        System Operational Matrix &bull; Terminus Platform Connection
      </footer>
    </div>
  );
}