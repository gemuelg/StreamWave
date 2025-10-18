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
   /*other: {
    'admaven-placement': 'Bqja8rjkH',
  },*/
};

// =========================================================================
// SCRIPT CONSTANTS
// =========================================================================

// --- CRITICAL: MINIFIED AD HTML (ALL ON ONE LINE) ---
// This prevents compiler-injected whitespace from breaking the close button (checkbox + div logic)
const stickyAdHtml = '<input autocomplete="off" type="checkbox" id="aadsstickymgs8rz6i" hidden /><div style="padding-top:0;padding-bottom:auto;"><div style="width:100%;height:auto;position:fixed;text-align:center;font-size:0;bottom:0;left:0;right:0;margin:auto"><label for="aadsstickymgs8rz6i" style="top:50%;transform:translateY(-50%);right:24px;position:absolute;border-radius:4px;background:rgba(248,248,249,0.7);padding:4px;z-index:99999;cursor:pointer"><svg fill="#000000" height="16px" width="16px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 490 490"><polygon points="456.851,0 245,212.564 33.149,0 0.708,32.337 212.669,245.004 0.708,457.678 33.149,490 245,277.443 456.851,490 489.292,457.678 277.331,245.004 489.292,32.337 "/></svg></label><div id="frame" style="width:100%;margin:auto;position:relative;z-index:99998;"><iframe data-aa=2412833 src="//acceptable.a-ads.com/2412833/?size=Adaptive" style="border:0;padding:0;width:70%;height:auto;overflow:hidden;margin:auto"></iframe></div></div><style>#aadsstickymgs8rz6i:checked+div{display:none!important}</style></div>';


// --- NEW CONSTANT: GLOBAL WHITESPACE STRIPPER SCRIPT ---
// This aggressively removes invisible text nodes from the DOM.
const globalWhitespaceStripper = `
  (function() {
    const body = document.body;
    if (!body) return;

    const walker = document.createTreeWalker(
      body, 
      NodeFilter.SHOW_TEXT, 
      null, 
      false
    );

    let node;
    const nodesToStrip = [];

    while (node = walker.nextNode()) {
      // Check if the node is composed only of whitespace
      if (node.nodeValue.trim() === '') {
        // Check if the preceding/following node is an element (to avoid removing spaces between words)
        const parent = node.parentNode;
        if (parent && parent.nodeType === 1 && (parent.previousSibling || parent.nextSibling)) {
            nodesToStrip.push(node);
        }
      }
    }

    nodesToStrip.forEach(node => {
      node.parentNode.removeChild(node);
    });
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

        {/* --- AD HTML EMBED: CRITICALLY CLEAN STRUCTURE --- */}
        <div 
            id="aads-sticky-container" 
            // Position fixed here addresses the blank space issue directly
            style={{ position: 'fixed', bottom: 0, left: 0, right: 0, width: '100%', zIndex: 99999 }} 
            dangerouslySetInnerHTML={{ __html: stickyAdHtml }} 
        />
      </body>

      
      {/* 1. The Global Whitespace Stripper (CRITICAL FIX) */}
      <Script
        id="global-cleaner"
        dangerouslySetInnerHTML={{ __html: globalWhitespaceStripper }}
        strategy="beforeInteractive" // Run this as early as possible
      />

      {/* 2. The Right-Click Disabling Script */}
      <Script 
        id="disable-right-click"
        dangerouslySetInnerHTML={{ __html: disableRightClickScript }}
        strategy="beforeInteractive"
      />
    </html>
  );
}