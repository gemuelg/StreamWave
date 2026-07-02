"use client";
import { useEffect } from 'react';

export default function AntiDevTools() {
  useEffect(() => {
    
    if (process.env.NODE_ENV === 'development') return;

    // What to do when they get caught sniffing
    const punishUser = () => {
      // Option A: Endless Reload
      window.location.reload();
      
      // Option B: Clear the page entirely so they see nothing
      // document.body.innerHTML = "<h1>Access Denied</h1>";
    };

    // 🔥 METHOD 1: The Size-Difference Detection
    // When DevTools opens side-by-side or bottom-docked, the inner window size shrinks dramatically.
    const threshold = 160; // pixel size threshold
    const sizeChecker = setInterval(() => {
      const widthExceeded = window.outerWidth - window.innerWidth > threshold;
      const heightExceeded = window.outerHeight - window.innerHeight > threshold;
      
      if (widthExceeded || heightExceeded) {
        punishUser();
      }
    }, 500);

    // 🔥 METHOD 2: The Infinite Debugger Loop (The "Freezer")
    // If DevTools opens, the browser is forced to hit this 'debugger' statement.
    // By looping it every 100ms, it completely crashes/freezes their DevTools panel.
    const freezer = setInterval(() => {
      (function () {
        (function a() {
          try {
            (function b(i) {
              if (("" + i / i).length !== 1 || i % 20 === 0) {
                (function () {}).constructor("debugger")();
              } else {
                debugger;
              }
              b(++i);
            })(0);
          } catch (e) {
            setTimeout(a, 100);
          }
        })();
      })();
    }, 100);

    // Cleanup intervals if the component unmounts
    return () => {
      clearInterval(sizeChecker);
      clearInterval(freezer);
    };
  }, []);

  return null;
}