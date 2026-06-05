// src/components/ClickaduAds.tsx
'use client';

import { useEffect, useRef } from 'react';

export default function ClickaduAds() {
  // Create a reference to the DOM node where the banner should mount
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Programmatically construct the Popup Ad Script
    const popupScript = document.createElement('script');
    popupScript.src = '//driverhugoverblown.com/on.js';
    popupScript.async = true;
    popupScript.setAttribute('data-cfasync', 'false');
    popupScript.setAttribute('data-clocid', '2121384');
    
    // Append popup directly to the body since it handles global window events
    document.body.appendChild(popupScript);

    // 2. Programmatically construct the Banner Ad Script
    if (adContainerRef.current) {
      const bannerScript = document.createElement('script');
      bannerScript.src = '//detoxifylagoonsnugness.com/bn.js';
      bannerScript.async = true;
      bannerScript.setAttribute('data-cfasync', 'false');
      bannerScript.setAttribute('data-clbaid', '');

      // Append the script directly inside our verified container right next to the spot div
      adContainerRef.current.appendChild(bannerScript);
    }

    // 3. Clean up elements on component unmount to prevent memory leaks or duplicate ads
    return () => {
      popupScript.remove();
      if (adContainerRef.current) {
        adContainerRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    // The outer div gives the ad network a secure layout context to render into
    <div 
      ref={adContainerRef} 
      className="clickadu-banner-container" 
      style={{ width: '100%', display: 'flex', justifyContent: 'center', margin: '20px 0' }}
    >
      {/* The exact target zone identifier required by your ad provider */}
      <div data-cl-spot="2121467" />
    </div>
  );
}