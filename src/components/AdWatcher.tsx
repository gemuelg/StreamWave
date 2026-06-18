// src/components/AdWatcher.tsx
'use client';

import { useEffect } from 'react';

export default function AdWatcher() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        if (registrations.length === 0) {
          console.warn('⚠️ [StreamWave Debugger] No active service workers found. Browsers will block popups.');
        } else {
          registrations.forEach((registration) => {
            console.log(`✅ [StreamWave Debugger] Active worker found monitoring path: ${registration.scope}`);
          });
        }
      });
    }
  }, []);

  // This component handles background logic only and doesn't render visible HTML
  return null;
}