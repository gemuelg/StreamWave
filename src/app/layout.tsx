// app/layout.tsx

import './globals.css';
import { ReactNode } from 'react';
import Navbar from '@/components/Navbar';
import AuthListener from '@/components/AuthListener';
import { Analytics } from '@vercel/analytics/next';
import Script from 'next/script'; // Ensure this is imported

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
  /*other: {
    'admaven-placement': 'Bqja8rjkH',
  },*/
};

// =========================================================================
// SCRIPT CONSTANTS
// =========================================================================

const aadsStickyScript = `
  var s = document.createElement('script');
  s.type = 'text/javascript';
  s.src = '//acceptable.a-ads.com/js/sticky.js';
  s.async = true;
  document.body.appendChild(s);
  var i = document.createElement('iframe');
  i.src = '//acceptable.a-ads.com/2412833/?size=Adaptive&background_color=26599a&title_hover_color=4b225e&link_color=359cd7';
  i.style = 'border:0; padding:0; width:100%; height:75px; overflow:hidden; margin:auto;';
  i.setAttribute('data-aa', 2412833);
  
  // Create the main wrapper container for the sticky ad
  var container = document.createElement('div');
  container.id = 'aads-sticky-ad';
  container.style.cssText = 'position:fixed; bottom:0; left:0; right:0; margin:auto; z-index:99999; text-align:center; width: 70%;';
  
  // Append the iframe and the sticky script loader
  container.appendChild(i);
  document.body.appendChild(container);
`;

// Right-Click Disabling Script (Correctly defined)
const disableRightClickScript = `
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
  });
`;



// =========================================================================
// LAYOUT COMPONENT
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
      </body>

      <Script
        id="aads-standard-sticky"
        dangerouslySetInnerHTML={{ __html: aadsStickyScript }}
        strategy="lazyOnload" // Ensure the main content loads first
      />
      {/* 3. The Right-Click Disabling Script */}
      <Script 
        id="disable-right-click"
        dangerouslySetInnerHTML={{ __html: disableRightClickScript }}
        strategy="beforeInteractive"
      />
    </html>
  );
}