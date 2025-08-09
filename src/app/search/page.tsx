// src/app/search/page.tsx
import React, { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import SearchContent from './SearchContent';

export default function SearchPage() {
  return (
    <div className="min-h-screen flex flex-col bg-primaryBg text-textLight">
      <Navbar />

      <Suspense fallback={
        <div className="flex justify-center items-center h-48">
          <p>Searching for content...</p>
        </div>
      }>
        <SearchContent />
      </Suspense>

    </div>
  );
}