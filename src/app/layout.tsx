import './globals.css';
import { ReactNode } from 'react';
import Navbar from '@/components/Navbar';
import AuthListener from '@/components/AuthListener';

export const metadata = {
  title: 'StreamWave',
  description: 'Your next-generation streaming platform',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
        <div id="portal-root" />
        <AuthListener />
      </body>
    </html>
  );
}