// src/app/page.tsx

import Link from 'next/link';
import { Metadata } from 'next';
import { getTrendingMovies, getTrendingTVShows, Movie, TVShow } from '@/lib/tmdb';

// --- DYNAMIC DATA FETCHING & FORMATTING (NO CHANGE) ---
async function getDynamicTitles() {
  try {
    const [moviesResponse, tvShowsResponse] = await Promise.all([
      getTrendingMovies(),
      getTrendingTVShows(),
    ]);

    const combinedResults = [
      ...moviesResponse.results.map((item: Movie) => ({ title: item.title, popularity: item.popularity })),
      ...tvShowsResponse.results.map((item: TVShow) => ({ title: item.name, popularity: item.popularity })),
    ];

    const sortedTitles = combinedResults
      .sort((a, b) => b.popularity - a.popularity)
      .map(item => item.title)
      .slice(0, 5);

    if (sortedTitles.length === 0) {
      return {
        heroText: 'new releases and popular titles added daily',
        seoTitleSuffix: '',
      };
    }

    const titlesForHero = sortedTitles.slice(0);
    const last = titlesForHero.pop();
    const heroText = titlesForHero.join(', ') + (titlesForHero.length > 0 ? `, and ${last}` : last);

    const titlesForSeo = sortedTitles.slice(0, 2);
    const seoTitleSuffix = titlesForSeo.length > 0
      ? ` | Featuring: ${titlesForSeo.join(' & ')}`
      : '';

    return { heroText, seoTitleSuffix };
  } catch (error) {
    console.error("Error fetching trending titles from TMDB:", error);
    return {
      heroText: 'new releases and popular titles added daily',
      seoTitleSuffix: '',
    };
  }
}

const featuredTitles = await getDynamicTitles();
const dynamicTitleSuffix = featuredTitles.seoTitleSuffix;

// --- METADATA ---
export const metadata: Metadata = {
  title: `Watch Free Movies Online & TV Shows in HD | StreamWave${dynamicTitleSuffix}`,
  description: 'StreamWave is the completely free, ad-free platform for high-quality movies and TV shows. No registration needed. Find action, comedy, horror, and more, all in HD. The best place to stream movies and TV shows online.',
  keywords: ['free movies', 'watch movies online', 'free TV shows', 'streamwave', 'ad-free streaming', 'HD movies online', 'free entertainment', 'stream TV'],
  openGraph: {
    title: `Watch Free Movies Online & TV Shows in HD | StreamWave${dynamicTitleSuffix}`,
    description: 'StreamWave is the completely free, ad-free platform for high-quality movies and TV shows. No registration needed.',
    url: 'https://www.streamwave.xyz/',
    siteName: 'StreamWave',
    type: 'website',
  },
};

// --- COMPONENT ---
export default function StreamwaveSEOLandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-primaryBg text-textLight px-4 w-full pt-32"> 
      {/* ↑ pt-32 pushes everything down below the navbar */}

      {/* HEADER */}
      <header className="w-full text-center mb-10">
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          <span className="text-white">Stream</span>
          <span className="text-accentBlue font-semibold">Wave</span>
        </h2>
      </header>

      {/* HERO */}
      <section className="w-full text-center space-y-4 mb-16">
        <h1 className="font-extrabold text-white drop-shadow-lg">
          <span className="block text-3xl md:text-4xl leading-tight">
            Watch Free Movies Online &
          </span>
          <span className="block text-3xl md:text-4xl leading-tight">
            TV Shows in HD
          </span>
        </h1>

        <p className="text-base md:text-lg text-textMuted max-w-2xl mx-auto">
          Stream the latest hits and timeless classics. Featuring: <strong className="text-textLight">{featuredTitles.heroText}</strong>.
        </p>

        <Link
          href="/home"
          className="inline-block bg-accent text-white font-extrabold py-3 px-8 rounded-full text-lg transition-all duration-300 shadow-xl shadow-accent/50 hover:shadow-2xl hover:shadow-accent/70 transform hover:scale-105 mt-6"
        >
          Start Watching Now
        </Link>
      </section>

      {/* CONTENT */}
      <section className="w-full text-left space-y-12 max-w-6xl px-6 mb-24">
        <div>
          <h2 className="text-2xl font-bold mb-4 text-textLight">Discover the Future of Free Streaming</h2>
          <p className="text-lg text-textMuted leading-relaxed">
            Welcome to <strong className="text-accent">StreamWave</strong>, your premier destination for completely <strong className="text-textLight">free</strong> and effortlessly high-quality movies and TV shows. Tired of sign-up barriers and distracting ads? We built <strong className="text-accent">StreamWave</strong> to be different. Our platform features an intuitive interface and a vast, constantly updated library, offering you the best way to stream online today. Dive into entertainment instantly—it's how streaming should be.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 text-textLight">Unrivaled Collection in Crystal-Clear HD</h2>
          <p className="text-lg text-textMuted leading-relaxed">
            Our catalog is a curated collection spanning every major genre: <strong>thrillers</strong>, <strong>comedies</strong>, <strong>action</strong>, <strong>horror</strong>, and critically acclaimed <strong>dramas</strong>. We prioritize <strong className="text-textLight">High Definition (HD)</strong> quality across all titles, ensuring a superior viewing experience. You'll find everything from the latest theatrical releases to beloved cult classics. Simply put, if it's worth watching, <strong className="text-accent">StreamWave</strong> has it, delivering cinematic quality right to your device.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 text-textLight">Platform Features Designed for You:</h2>
          <ul className="list-disc list-inside space-y-3 text-lg text-textMuted inline-block text-left">
            <li><strong className="text-textLight">Premium Quality:</strong> Stream thousands of titles in native <strong>HD resolution</strong>.</li>
            <li><strong className="text-textLight">Instant Access:</strong> <strong>Zero registration</strong> required—watch what you want, when you want.</li>
            <li><strong className="text-textLight">Universal Compatibility:</strong> Works perfectly on all devices, from desktop to mobile.</li>
            <li><strong className="text-textLight">Intuitive Design:</strong> Effortless navigation to quickly find your next favorite movie or series.</li>
          </ul>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full py-6 text-center text-textMuted text-sm border-t border-secondaryBgDark">
        &copy; {new Date().getFullYear()} Stream Wave. All rights reserved.
      </footer>
    </div>
  );
}
