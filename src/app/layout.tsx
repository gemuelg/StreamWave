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

  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
/*other: 
  { 'admaven-placement': 'Bqja8rjkH', },
*/
};

// =========================================================================
// SCRIPT CONSTANTS
// =========================================================================

// --- MINIFIED AD HTML (UNCHANGED) ---
const stickyAdHtml = '<div id="aads-ad-content" style="width:100%;height:auto;position:fixed;text-align:center;font-size:0;bottom:0;left:0;right:0;margin:auto;z-index:99999;"><div id="ad-outer-fixed-wrapper" style="width:100%;height:auto;position:fixed;text-align:center;font-size:0;bottom:0;left:0;right:0;margin:auto;z-index:99999;"><div onclick="document.getElementById(\'aads-ad-final-wrapper\').style.display=\'none\';" style="top: 50%;transform:translateY(-50%);right:24px;position:absolute;border-radius:4px;background:rgba(248,248,249,0.7);padding:4px;z-index:100000;cursor:pointer;"><svg fill="#000000" height="16px" width="16px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 490 490"><polygon points="456.851,0 245,212.564 33.149,0 0.708,32.337 212.669,245.004 0.708,457.678 33.149,490 245,277.443 456.851,490 489.292,457.678 277.331,245.004 489.292,32.337 "/></svg></div><div id="frame" style="width:100%;margin:auto;position:relative;z-index:99998;"><iframe data-aa=2412833 src="//acceptable.a-ads.com/2412833/?size=Adaptive" style="border:0;padding:0;width:70%;height:auto;overflow:hidden;margin:auto"></iframe></div></div></div>';

// --- AD INJECTION SCRIPT (UNCHANGED) ---
const stickyAdInjectionScript = `
  (function() {
    const adHtml = \`${stickyAdHtml}\`; 
    
    const container = document.createElement('div');
    container.id = 'aads-ad-final-wrapper'; 
    container.style.cssText = 'z-index:99999; position:fixed; bottom:0; left:0; right:0; width:1px; height:1px; overflow:visible; pointer-events:auto;';
    container.innerHTML = adHtml;
    
    document.body.appendChild(container);
  })();
`;

// --- GLOBAL WHITESPACE STRIPPER FUNCTION (Used directly in JSX) ---
const globalWhitespaceStripperFunction = `
  (function() {
    const root = document.documentElement;
    if (!root) return;

    const walker = document.createTreeWalker(
      root, 
      NodeFilter.SHOW_TEXT, 
      null, 
      false
    );

    let node;
    const nodesToStrip = [];

    while (node = walker.nextNode()) {
      if (node.nodeValue.trim() === '') {
          const prevSibling = node.previousSibling;
          const nextSibling = node.nextSibling;

          // Aggressively remove any whitespace-only Text Node that sits between two Element Nodes
          if (prevSibling && prevSibling.nodeType === 1 && nextSibling && nextSibling.nodeType === 1) {
            nodesToStrip.push(node);
          }
      }
    }

    nodesToStrip.forEach(node => {
      try {
        node.parentNode.removeChild(node);
      } catch (e) {
        // Ignore
      }
    });
  })();
`;

// Right-Click Disabling Script (remains the same)
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
      {/* 🚨 CRITICAL FIX: INLINE SCRIPT FOR IMMEDIATE EXECUTION */}
      <head>
        {/* We use a standard script tag here to ensure it is inlined and executes before the body renders */}
        <script dangerouslySetInnerHTML={{ __html: globalWhitespaceStripperFunction }} />
      </head>
      
      <body>
        {/* CRITICAL: The Scrollable Content Wrapper remains for layout integrity */}
        <div id="page-content-wrapper"> 
          <Navbar />
          <main>{children}</main>
          <div id="portal-root" />
          <AuthListener />
          <Analytics />
        </div> 
      </body>

      
      {/* 2. The Right-Click Disabling Script (Can still use next/script) */}
      <Script 
        id="disable-right-click"
        dangerouslySetInnerHTML={{ __html: disableRightClickScript }}
        strategy="beforeInteractive"
      />

      {/* 3. AD INJECTION SCRIPT */}
      <Script
        id="ad-injection-script"
        dangerouslySetInnerHTML={{ __html: stickyAdInjectionScript }}
        strategy="lazyOnload" 
      />
    </html>
  );
}