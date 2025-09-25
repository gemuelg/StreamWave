// app/layout.tsx

import './globals.css';
import { ReactNode } from 'react';
import Navbar from '@/components/Navbar';
import AuthListener from '@/components/AuthListener';
import { Analytics } from '@vercel/analytics/next';

export const metadata = {
  title: 'StreamWave',
  description: 'Your next-generation streaming platform',
  
  
  other: {
    '6a97888e-site-verification': '7154d61544ed1ed744499f4e817d53dd',
  },
};

// =======================================================================
// AD INJECTION CONSTANTS
// Sticky Banner CSS (Zone ID: 5732108) - MODIFIED FOR CENTER-BOTTOM PLACEMENT
// =======================================================================

// 1. Base wrapper style from the original ad tag
const adWrapperCSS = `.tMw15thR { border: 0px solid #000000;display: block;background-color: rgba(0, 0, 0, 0);margin: 0px 0px;padding: 0px 0px;max-width: 100%;}`;

// 2. NEW CSS to force the sticky ad container to the center-bottom
const stickyPlacementCSS = `
  .eas6a97888e17 {
      /* Ensure the ad loads as a fixed element */
      position: fixed !important;
      
      /* Position at the very bottom */
      bottom: 0px !important;

      top: auto !important; 
      
      /* Move the box 50% from the left edge */
      left: 50% !important;
      
      /* Use translate to shift the box back by half its own width, achieving center alignment */
      transform: translateX(-50%) !important;
      
      /* Ensure it stays above content */
      z-index: 9999999 !important;
      
      /* Add a small buffer from the very bottom edge */
      margin-bottom: 5px; 
  }
`;

// Combined CSS for injection
const stickyBannerCSS = `${adWrapperCSS} ${stickyPlacementCSS}`;


export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
        <div id="portal-root" />
        <AuthListener />
        <Analytics />

        {/* ======================================================= */}
        {/* 💥 EXOCLICK AD ZONE INTEGRATION START 💥 */}
        {/* ======================================================= */}

        {/* 1. POPUNDER ZONE (ID: 5731792) - Reloading from external file to prevent errors */}
        <script 
          type="application/javascript" 
          src="/scripts/popunder.js" 
          async 
        />

        {/* 2. STICKY BANNER ZONE (ID: 5732108) - Center Bottom Placement */}
        
        {/* Injecting the necessary CSS for the sticky banner wrapper */}
        <style 
          type="text/css" 
          dangerouslySetInnerHTML={{ __html: stickyBannerCSS }} 
        />
        <div className="tMw15thR" data-uid="tMw15thR"></div>
        
        {/* The banner container element (Note: data-zoneid 5732108 used) */}
        <ins 
          className="eas6a97888e17" 
          data-zoneid="5732108" 
          data-keywords="streaming, movies, tv shows, cinema, entertainment, film, game, medicine, games, technology, mobile, ecommerce"
        ></ins>

        {/* The shared remote script for banner-type ads (Sticky) */}
        <script async type="application/javascript" src="https://a.magsrv.com/ad-provider.js"></script>

        {/* The final push command to activate the sticky banner */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(AdProvider = window.AdProvider || []).push({"serve": {}});`,
          }}
        />

        {/* ======================================================= */}
        {/* 💥 EXOCLICK AD ZONE INTEGRATION END 💥 */}
        {/* ======================================================= */}
        
      </body>
    </html>
  );
}