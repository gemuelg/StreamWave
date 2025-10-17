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

// --- NEW CONSTANT: SIMPLIFIED AD HTML (NO CHECKBOX OR STYLE) ---
const stickyAdHtml = `
  <div id="aads-ad-content" style="width:100%;height:auto;position:fixed;text-align:center;font-size:0;bottom:0;left:0;right:0;margin:auto; z-index:99999;">
    
    <div onclick="document.getElementById('aads-sticky-container').style.display='none';"
         style="top: 50%; transform: translateY(-50%); right: 24px; position: absolute; border-radius: 4px; background: rgba(248, 248, 249, 0.70); padding: 4px; z-index: 100000; cursor: pointer;">
      <svg fill="#000000" height="16px" width="16px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 490 490">
        <polygon points="456.851,0 245,212.564 33.149,0 0.708,32.337 212.669,245.004 0.708,457.678 33.149,490 245,277.443 456.851,490 489.292,457.678 277.331,245.004 489.292,32.337 "/>
      </svg>
    </div>

    <div id="frame" style="width: 100%; margin: auto; position: relative; z-index: 99998;">
      <iframe data-aa=2412833 src="//acceptable.a-ads.com/2412833/?size=Adaptive" style="border:0; padding:0; width:70%; height:auto; overflow:hidden; margin: auto"></iframe>
    </div>
  </div>
`;

// --- NEW CONSTANT: WHITESPACE REMOVAL SCRIPT ---
const stickyAdInjectionScript = `
  (function() {
    // 1. Get the ad HTML string
    let adHtml = document.getElementById('aads-sticky-container').innerHTML;
    
    // 2. FORCE MINIFICATION: Remove all unnecessary whitespace, newlines, tabs, etc.
    // This is the CRITICAL STEP to eliminate the multiplying &nbsp; issue.
    adHtml = adHtml.replace(/\\s+/g, ' ').replace(/> </g, '><').trim();
    
    // 3. Create a clean, independent container and inject the minified HTML
    const container = document.createElement('div');
    container.id = 'aads-ad-final-wrapper'; // Use a new ID to avoid conflict
    
    // The fixed positioning is applied here to prevent document flow interference
    container.style.cssText = 'z-index:99999; position:fixed; bottom:0; left:0; right:0; width:1px; height:1px; overflow:visible; pointer-events:none; display:block;';
    
    container.innerHTML = adHtml;
    
    // 4. Append the container to the document body
    document.body.appendChild(container);

    // 5. Hide the original container immediately
    document.getElementById('aads-sticky-container').style.display = 'none';
    
  })();
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

        {/* --- AD HTML SOURCE CONTAINER (MUST BE HIDDEN) --- */}
        <div 
            id="aads-sticky-container" 
            // Crucial: Hiding this element to eliminate the immediate blank space.
            style={{ display: 'none', zIndex: -1 }} 
            dangerouslySetInnerHTML={{ __html: stickyAdHtml }} 
        />

        {/* The ad is now functional and controlled by its own element inside the final wrapper */}
      </body>

      
      {/* 1. The Right-Click Disabling Script */}
      <Script 
        id="disable-right-click"
        dangerouslySetInnerHTML={{ __html: disableRightClickScript }}
        strategy="beforeInteractive"
      />

      {/* 2. AD INJECTION SCRIPT (NEW MINIFICATION STEP) */}
      <Script
        id="ad-injection-script"
        dangerouslySetInnerHTML={{ __html: stickyAdInjectionScript }}
        // Using lazyOnload ensures the source HTML is in the DOM before the script runs.
        strategy="lazyOnload" 
      />
    </html>
  );
}