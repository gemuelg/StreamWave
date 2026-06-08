// app/layout.tsx

// @ts-ignore: CSS module declarations may not be available in this environment
import './globals.css';
import { ReactNode } from 'react';
import Navbar from '@/components/Navbar';
import AuthListener from '@/components/AuthListener';
import Script from 'next/script'; 

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

  // 🚀 ACTIVE AD NETWORK VERIFICATION CODES
  other: {
    'monetag': 'ad854dacaea5d7f56b7849ec18d067fe',
    'google-adsense-account': 'ca-pub-4043491676034249',
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

// Right-Click Disabling Script
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
          
          {/* 1. The Right-Click Disabling Script (Still uses Next.js Script component) */}
          <Script 
            id="disable-right-click"
            dangerouslySetInnerHTML={{ __html: disableRightClickScript }}
            strategy="beforeInteractive"
          />

          {/* ============================================================= */}
          {/* 🚀 CLICKADU OPERATIONAL LAYER INTEGRATION 🚀                 */}
          {/* ============================================================= */}
          

          {/* ------------------------------------------------------------- */}

          {/* 🚀 MONETAG AD TAG 🚀 
          <script 
            src="https://quge5.com/88/tag.min.js" 
            data-zone="185662" 
            async 
            data-cfasync="false"
          ></script>*/}

          {/* 🚀 ADHOC HTML SCRIPT TAG FOR ADSENSE 🚀
          <script 
            async 
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4043491676034249"
            crossOrigin="anonymous"
          ></script>
          */}
      </body>
    </html>
  );
}