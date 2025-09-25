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
// **REMOVED POPUNDER SCRIPT CONSTANT**
// =======================================================================

// 2. STICKY BANNER CSS (Zone ID: 5731732) - Wrapper style from the original tag
const stickyBannerCSS = `.tMw15thR { border: 0px solid #000000;display: block;background-color: rgba(0, 0, 0, 0);margin: 0px 0px;padding: 0px 0px;max-width: 100%;}`;


export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
        <div id="portal-root" />
        <AuthListener />
        <Analytics />

        <style 
  type="text/css" 
  dangerouslySetInnerHTML={{ __html: stickyBannerCSS }} 
/>
<div className="tMw15thR" data-uid="tMw15thR"></div> 
{/* Use cm6Q0n8N if the ad network gave you a new class name */}

{/* The actual container where the ad content will be inserted by the script */}
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
      </body>
    </html>
  );
}