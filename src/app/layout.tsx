// src/app/layout.tsx

// @ts-ignore: CSS module declarations may not be available in this environment
import './globals.css';
import { ReactNode } from 'react';
import { Metadata } from 'next'; // Added for strict structural checking
import Navbar from '@/components/Navbar';
import AuthListener from '@/components/AuthListener';
import Script from 'next/script'; 

// CRITICAL SEO FIX: Aligned perfectly with sitemaps and robots.ts domain rules
const BASE_URL = 'https://streamwave.xyz'; 

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'StreamWave - Your Next-Generation Streaming Platform', 
    template: '%s | StreamWave', 
  },
  description: 'StreamWave is your next-generation platform for discovering the latest and greatest movies and TV shows. Explore, search, and manage your personalized watchlist for a seamless entertainment experience.',
  applicationName: 'StreamWave',
  keywords: ['streaming platform', 'movie database', 'TV shows', 'watchlist', 'discover movies', 'latest trailers'],

  // Open Graph / Facebook Social Metadata
  openGraph: {
    title: 'StreamWave - Your Next-Generation Streaming Platform',
    description: 'Explore, search, and manage your personalized watchlist for a seamless entertainment experience.',
    url: BASE_URL,
    siteName: 'StreamWave',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png', // Make sure to place an 1200x630px image in your public/ directory
        width: 1200,
        height: 630,
        alt: 'StreamWave Streaming Platform Preview',
      },
    ],
  },

  // Twitter/X Cards Link Previews
  twitter: {
    card: 'summary_large_image',
    title: 'StreamWave - Your Next-Generation Streaming Platform',
    description: 'Explore, search, and manage your personalized watchlist for a seamless entertainment experience.',
    images: ['/og-image.png'],
  },

  other: {
    'monetag': 'ad854dacaea5d7f56b7849ec18d067fe',
    'google-adsense-account': 'ca-pub-4043491676034249',
  },
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

const disableRightClickScript = `
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
  });
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
          <Navbar />
          <main>{children}</main>
          <div id="portal-root" />
          <AuthListener />
           
          {/* Right-Click Disabling Script */}
          <Script 
            id="disable-right-click"
            dangerouslySetInnerHTML={{ __html: disableRightClickScript }}
            strategy="afterInteractive" // Performance tweak: Don't block core layout execution
          />

          {/* ============================================================= */}
          {/* 🚀 MONETAG AD MULTI-ZONE ENGINE PIPELINE                      */}
          {/* ============================================================= */}
          <Script
            id="monetag-active-tag"
            src="https://quge5.com/88/tag.min.js"
            data-zone="251043"
            data-cfasync="false"
            strategy="afterInteractive"
          />
      </body>
    </html>
  );
}