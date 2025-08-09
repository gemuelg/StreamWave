// src/app/tv/page.tsx
import React, { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import TVContent from './TVContent';

export default function TVShowsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-primaryBg text-textLight">
      <Navbar />

      <main className="flex-grow pt-20">
        <Suspense fallback={
          <div className="flex justify-center items-center h-48">
            <p>Loading TV shows...</p>
          </div>
        }>
          <TVContent />
        </Suspense>
      </main>

      <footer className="w-full py-4 text-center text-textMuted text-sm bg-primaryBg border-t border-gray-800 mt-auto">
        &copy; {new Date().getFullYear()} Stream Wave. All rights reserved. Data provided by TMDB.
      </footer>
    </div>
  );
}