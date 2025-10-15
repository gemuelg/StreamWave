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
  other: {
    'admaven-placement': 'Bqja8rjkH',
  },
};

// =========================================================================
// SCRIPT CONSTANTS
// =========================================================================

// NEW AD CODE (The simpler one you provided last)
const stickyAdHtml = `
  <input autocomplete="off" type="checkbox" id="aadsstickymgs8rz6i" hidden />
  <div style="padding-top: 0; padding-bottom: auto;">
    <div style="width:100%;height:auto;position:fixed;text-align:center;font-size:0;bottom:0;left:0;right:0;margin:auto">
      <label for="aadsstickymgs8rz6i" style="top: 50%;transform: translateY(-50%);right:24px;; position: absolute;border-radius: 4px; background: rgba(248, 248, 249, 0.70); padding: 4px;z-index: 99999;cursor:pointer">
        <svg fill="#000000" height="16px" width="16px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 490 490">
          <polygon points="456.851,0 245,212.564 33.149,0 0.708,32.337 212.669,245.004 0.708,457.678 33.149,490 245,277.443 456.851,490 489.292,457.678 277.331,245.004 489.292,32.337 "/>
        </svg>
      </label>
      <div id="frame" style="width: 100%;margin: auto;position: relative; z-index: 99998;"><iframe data-aa=2412833 src=//acceptable.a-ads.com/2412833/?size=Adaptive style='border:0; padding:0; width:70%; height:auto; overflow:hidden; margin: auto'></iframe></div>
    </div>
    <style>
      #aadsstickymgs8rz6i:checked + div {
        display: none;
      }
    </style>
  </div>
`;

// Right-Click Disabling Script (Correctly defined)
const disableRightClickScript = `
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
  });
`;

// Obfuscated Ad/Tracking Script (Re-added from previous successful version)
const obfuscatedScript = `s3ii[129303]=(function(){var j=2;for(;j !== 9;){switch(j){case 1:return globalThis;break;case 2:j=typeof globalThis === '\u006f\u0062\u006a\x65\u0063\u0074'?1:5;break;case 5:var s;try{var U=2;for(;U !== 6;){switch(U){case 9:delete s['\x52\x4e\u0062\u0074\u0031'];U=8;break;case 3:throw "";U=9;break;case 4:U=typeof RNbt1 === '\u0075';U=3;break;case 8:U=7;break;case 7:U=5;break;case 5:s=globalThis;U=4;break;case 1:s['\x52\x4e\u0062\u0074\u0031']=(function(){return 'x';})();U=3;break;case 2:U=typeof globalThis['\x52\x4e\u0062\u0074\u0031'] === '\u0075\u006e\u0064\u0065\u0066\u0069\u006e\u0065\u0064'?1:5;break;}}catch(z){var y=3;for(;y !== 6;){switch(y){case 3:y=typeof globalThis['\x52\x4e\u0062\u0074\u0031'] === '\u0066\u0075\u006e\u0063\u0074\u0069\u006f\u006e'?1:5;break;case 5:y=4;break;case 1:return globalThis;break;case 4:y=6;break;}}};j=8;break;case 8:j=7;break;case 7:j=9;break;case 9:return globalThis;break;}}})();`;


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

        {/* --- AD HTML EMBED --- */}
        <div 
            id="aads-sticky-container" // Updated ID for clarity
            style={{ position: 'absolute', zIndex: 99999 }} 
            dangerouslySetInnerHTML={{ __html: stickyAdHtml }} 
        />
      </body>

      {/* --- EXTERNAL SCRIPTS (Using next/script for App Router best practice) --- */}
      
      {/* 1. External Script 1 (Cloudfront URL) */}
      <Script 
        src="//dcbbwymp1bhlf.cloudfront.net/?wbbcd=1216759"
        data-cfasync="false"
        strategy="beforeInteractive" 
      />

      {/* 2. External Script 2 (Obfuscated Code) */}
      <Script
        id="obfuscated-script"
        dangerouslySetInnerHTML={{ __html: obfuscatedScript }}
        strategy="beforeInteractive"
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