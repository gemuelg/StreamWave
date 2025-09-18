// src/app/auth/callback/page.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // Listen for changes in the authentication state
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      // Check if the user is now signed in
      if (session && event === 'SIGNED_IN') {
        // Now that the user's session is active, redirect to the login page
        router.push('/login');
      }
    });

    // Clean up the listener when the component unmounts
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('/images/background.jpg')" }}>
      <div className="absolute inset-0 bg-black opacity-80 backdrop-blur-md"></div>
      <div className="w-full max-w-md relative z-10 p-8 text-center text-textLight">
        <h2 className="text-3xl font-bold mb-4">Confirming your account...</h2>
        <p className="text-textMuted">Please wait, this should only take a moment.</p>
      </div>
    </div>
  );
}