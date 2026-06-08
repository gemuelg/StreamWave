// components/MonetagTrigger.tsx
'use client';

import { useEffect } from 'react';

export default function MonetagTrigger() {
  useEffect(() => {
    const handleFirstClick = () => {
      // Programmatically opens your Monetag Direct Link in a new tab
      window.open('https://omg10.com/4/11120547', '_blank', 'noopener,noreferrer');
      
      // Cleans up the event listener so it only fires once per session/load
      document.removeEventListener('click', handleFirstClick);
    };

    // Listen for a click anywhere on the website
    document.addEventListener('click', handleFirstClick);

    return () => {
      document.removeEventListener('click', handleFirstClick);
    };
  }, []);

  return null; // This component is completely invisible
}