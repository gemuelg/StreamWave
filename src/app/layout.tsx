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
  other: {
    'admaven-placement': 'Bqja8rjkH',
  },
};

const stickyAdHtml = `
  <div style="padding-top: 0; padding-bottom: auto;">
    <div style="width:100%;height:auto;position:fixed;text-align:center;font-size:0;bottom:0;left:0;right:0;margin:auto">
      <label for="aadsstickymgh1exam" style="top: 50%;transform: translateY(-50%);right:24px;; position: absolute;border-radius: 4px; background: rgba(248, 248, 249, 0.70); padding: 4px;z-index: 99999;cursor:pointer">
        <svg fill="#000000" height="16px" width="16px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 490 490">
          <polygon points="456.851,0 245,212.564 33.149,0 0.708,32.337 212.669,245.004 0.708,457.678 33.149,490 245,277.443 456.851,490 489.292,457.678 277.331,245.004 489.292,32.337 "/>
        </svg>
      </label>
      <div id="frame" style="width: 100%;margin: auto;position: relative; z-index: 99998;">
        <div style="width: 70%;margin:auto;text-align:left;position: absolute;left: 0;right: 0; top:-24px">
          <a style="display:inline-block;font-size: 13px;color: #263238;padding: 4px 10px;background: #F8F8F9;text-decoration: none; border-radius: 4px 4px 0 0;"
             id="frame-link"
             target="_blank"
             href="https://aads.com/campaigns/new?source_id=2412833&source_type=ad_unit&partner=2412833">
            Advertise here
          </a>
        </div>
        <iframe data-aa=2412833 src=//acceptable.a-ads.com/2412833/?size=Adaptive&background_color=26599a&title_hover_color=4b225e&link_color=359cd7 style='border:0; padding:0; width:70%; height:auto; overflow:hidden; margin: auto'></iframe>
      </div>
    </div>
    <style>
      #aadsstickymgh1exam:checked + div {
        display: none;
      }
    </style>
  </div>
`;

const disableRightClickScript = `
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
  });
`;
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Script 
        id="disable-right-click"
        dangerouslySetInnerHTML={{ __html: disableRightClickScript }}
        strategy="beforeInteractive" // Load this early to disable the menu immediately
      />
        <Navbar />
        <main>{children}</main>
        <div id="portal-root" />
        <AuthListener />
        <Analytics />
        <div 
            id="aadsstickymgh1exam-container"
            style={{ position: 'absolute', zIndex: 99999 }} // Outer container styles
            dangerouslySetInnerHTML={{ __html: stickyAdHtml }} 
        />
      </body>
    </html>
  );
}