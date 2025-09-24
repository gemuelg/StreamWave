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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
        <div id="portal-root" />
        <AuthListener />
        <Analytics />

        <script async type="application/javascript" src="https://a.magsrv.com/ad-provider.js"></script>
          
          
          <ins 
            className="eas6a97888e17" 
            data-zoneid="5731732" 
            data-keywords="streaming, movies, tv shows, cinema, entertainment, film, game, medicine, games, technology, mobile, ecommerce"
          ></ins>
          
          
          <script
            dangerouslySetInnerHTML={{
              __html: `(AdProvider = window.AdProvider || []).push({"serve": {}});`,
            }}
          />
      </body>
    </html>
  );
}