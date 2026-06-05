// src/components/ClickaduAds.tsx
'use client';

import { useEffect } from 'react';

export default function ClickaduAds() {
  useEffect(() => {
    // =========================================================================
    // 1. POPUP AD SNIPPET (Zone 2121384)
    // =========================================================================
    const popupScript = document.createElement('script');
    popupScript.src = '//driverhugoverblown.com/on.js';
    popupScript.async = true;
    popupScript.setAttribute('data-cfasync', 'false');
    popupScript.setAttribute('data-clocid', '2121384');
    document.body.appendChild(popupScript);

    // =========================================================================
    // 2. VERTICAL AD ENGINE (Zone 2121618)
    // =========================================================================
    const verticalAdScript = document.createElement('script');
    verticalAdScript.src = '//detoxifylagoonsnugness.com/in.js';
    verticalAdScript.async = true;
    verticalAdScript.setAttribute('data-cfasync', 'false');
    verticalAdScript.setAttribute('data-clipid', '2121618');
    document.body.appendChild(verticalAdScript);

    // =========================================================================
    // 3. VIGNETTE AD ENGINE (Zone 2121620)
    // =========================================================================
    const vignetteAdScript = document.createElement('script');
    vignetteAdScript.src = '//guidepaparazzisurface.com/in.js';
    vignetteAdScript.async = true;
    vignetteAdScript.setAttribute('data-cfasync', 'false');
    vignetteAdScript.setAttribute('data-clipid', '2121620');
    document.body.appendChild(vignetteAdScript);

    // =========================================================================
    // 4. INSTANT MESSAGE ADS (Zone 2121469)
    // =========================================================================
    const instantMessageScript = document.createElement('script');
    instantMessageScript.src = '//bartererfaxtingling.com/pu.js';
    instantMessageScript.async = true;
    instantMessageScript.setAttribute('data-cfasync', 'false');
    instantMessageScript.setAttribute('data-clpuid', '2121469');
    document.body.appendChild(instantMessageScript);

    // =========================================================================
    // CLEANUP LIFECYCLE
    // =========================================================================
    return () => {
      popupScript.remove();
      verticalAdScript.remove();
      vignetteAdScript.remove();
      instantMessageScript.remove();
    };
  }, []);

  return null;
}