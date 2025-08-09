import { Suspense } from 'react';
import MoviesContent from './MoviesContent';
import Navbar from '@/components/Navbar';

export default function MoviesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-primaryBg text-textLight">
      <Navbar />
      <main className="flex-grow pt-20">
        <Suspense fallback={<div>Loading movies...</div>}>
          <MoviesContent />
        </Suspense>
      </main>
      
    </div>
  );
}