// app/layout.tsx

import './globals.css';
import { ReactNode } from 'react';
import Navbar from '@/components/Navbar';
import AuthListener from '@/components/AuthListener';
import { Analytics } from '@vercel/analytics/next';
import Script from 'next/script'; 

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

  // 🚀 MONETAG VERIFICATION CODE ADDED HERE
  other: {
    'monetag': '806cd68e5207ebaf486345a2f5f2e8ab',
  },
  // ----------------------------------------
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },

};

// =========================================================================
// SCRIPT CONSTANTS (NO WHITESPACE STRIPPER INCLUDED)
// =========================================================================


// Right-Click Disabling Script (remains the same)
const disableRightClickScript = `
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
  });
`;

// =========================================================================
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
          <Navbar />
          <main>{children}</main>
          <div id="portal-root" />
          <AuthListener />
          <Analytics />
        
        {/* 1. The Right-Click Disabling Script */}
        <Script 
          id="disable-right-click"
          dangerouslySetInnerHTML={{ __html: disableRightClickScript }}
          strategy="beforeInteractive"
        />

        
      </body>
    </html>
  );
}