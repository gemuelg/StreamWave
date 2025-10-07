// app/layout.tsx

import './globals.css';
import { ReactNode } from 'react';
import Navbar from '@/components/Navbar';
import AuthListener from '@/components/AuthListener';
import { Analytics } from '@vercel/analytics/next';

// 🚨 ACTION REQUIRED: Replace with your actual live domain URL
const BASE_URL = 'https://www.streamwave.xyz'; 

export const metadata = {
  // 1. BASE URL (CRITICAL FOR ABSOLUTE PATHS)
  metadataBase: new URL(BASE_URL),
  
  // 2. CORE SEO
  title: {
    default: 'StreamWave - Your Next-Generation Streaming Platform', 
    template: '%s | StreamWave', 
  },
  description: 'StreamWave is your next-generation platform for discovering the latest and greatest movies and TV shows. Explore, search, and manage your personalized watchlist for a seamless entertainment experience.',
  applicationName: 'StreamWave',
  keywords: ['streaming platform', 'movie database', 'TV shows', 'watchlist', 'discover movies', 'latest trailers'],

  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  other: {
    'admaven-placement': 'Bqja8rjkH',
  },
};


export default function RootLayout({ children }: { children: ReactNode }) {
  const disableRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
  };
  return (
    <html lang="en" onContextMenu={disableRightClick}>
      <body>
        <Navbar />
        <main>{children}</main>
        <div id="portal-root" />
        <AuthListener />
        <Analytics />
      </body>
    </html>
  );
}