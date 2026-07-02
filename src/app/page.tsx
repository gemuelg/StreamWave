import Link from 'next/link';
import { Metadata } from 'next';
import { getTrendingMovies, getTrendingTVShows, Movie, TVShow } from '@/lib/tmdb';

// --- DYNAMIC DATA FETCHING & FORMATTING (UNTOUCHED CORE LOGIC) ---
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
    <div className="min-h-screen bg-[#040406] bg-radial-ambient text-slate-300 relative overflow-x-hidden flex flex-col items-center justify-start pt-36">
      
      {/* Dynamic Background Ambient Glow Effects */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-r from-purple-500/10 via-cyan-500/5 to-transparent rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-[40%] right-[-10%] w-[400px] h-[400px] bg-purple-500/[0.03] rounded-full blur-[100px] pointer-events-none z-0" />

      {/* INNER WRAPPER FRAME */}
      <div className="w-full max-w-5xl px-6 relative z-10 flex-1 flex flex-col items-center">
        
        {/* PRE-HERO CALLOUT PILL */}
        <div className="inline-flex items-center space-x-2 bg-white/[0.03] border border-white/10 rounded-full px-4 py-1.5 mb-6 shadow-sm backdrop-blur-md animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[10px] font-black tracking-widest uppercase text-slate-200">
            Cinema Quality • Zero Subscription Fees
          </span>
        </div>

        {/* HERO HEADER REGION */}
        <section className="w-full text-center space-y-6 mb-20 max-w-3xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.1] font-sans">
            Watch Free Movies Online &{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_2px_20px_rgba(6,182,212,0.15)]">
              TV Shows in HD
            </span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto font-normal">
            Stream structural theater hits and timeless sub-cultural classics instantaneously. Currently featuring high-demand nodes like:{' '}
            <span className="text-white font-semibold underline decoration-cyan-500/40 underline-offset-4">
              {featuredTitles.heroText}
            </span>.
          </p>

          <div className="pt-4">
            <Link
              href="/home"
              className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-xs sm:text-sm font-bold tracking-widest uppercase text-white rounded-full group bg-gradient-to-br from-purple-600 via-cyan-500 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-800 transition-all duration-300 shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_45px_rgba(6,182,212,0.5)] transform hover:scale-[1.03] active:scale-98"
            >
              <span className="relative px-8 py-3.5 transition-all ease-in duration-700 bg-[#040406]/90 rounded-full group-hover:bg-opacity-0">
                Start Watching Now
              </span>
            </Link>
          </div>
        </section>

        {/* COMPREHENSIVE PLATFORM FEATURES MATRIX */}
        <section className="w-full grid md:grid-cols-2 gap-6 mb-16 text-left">
          
          {/* Card Module 1 */}
          <div className="bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.06] backdrop-blur-md rounded-2xl p-8 hover:border-purple-500/20 transition-all duration-500 group">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-5 text-purple-400 group-hover:bg-purple-500/20 transition-colors">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-3 tracking-wide">
              Discover the Future of Free Streaming
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Welcome to <strong className="text-purple-400 font-semibold">StreamWave</strong>, your premier destination for completely <strong className="text-white">free</strong> and effortlessly high-quality cinema structures. Built to bypass exhausting authentication barriers and distracting programmatic pop-ups, StreamWave delivers automated library asset routing instantly to your glass.
            </p>
          </div>

          {/* Card Module 2 */}
          <div className="bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.06] backdrop-blur-md rounded-2xl p-8 hover:border-cyan-500/20 transition-all duration-500 group">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-5 text-cyan-400 group-hover:bg-cyan-500/20 transition-colors">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-3 tracking-wide">
              Unrivaled Catalog In Crystal HD
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Our index catalog manages thousands of active titles across thrillers, comedies, action, and horror. By prioritizing native high-bitrate deployment, every media package maintains cinematic precision directly on your screen of choice.
            </p>
          </div>

        </section>

        {/* DETAILED SPECIFICATION GRID SEGMENT */}
        <section className="w-full bg-gradient-to-r from-white/[0.01] via-white/[0.02] to-transparent border border-white/[0.05] rounded-3xl p-8 sm:p-10 mb-24 text-left backdrop-blur-sm">
          <h3 className="text-lg sm:text-xl font-extrabold text-white mb-8 tracking-wider uppercase font-mono border-l-2 border-cyan-400 pl-4">
            Core Network Capabilities:
          </h3>
          
          <div className="grid sm:grid-cols-2 gap-6 text-sm">
            <div className="flex items-start space-x-3">
              <div className="mt-0.5 text-cyan-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div>
                <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-1">Premium Bitrate Arrays</h4>
                <p className="text-xs text-slate-400">Stream high-fidelity media assets calibrated in crystal-clear full digital high definition resolution layers.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="mt-0.5 text-cyan-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div>
                <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-1">Decentralized Access Path</h4>
                <p className="text-xs text-slate-400">Zero subscription fees, hidden sign-ups, or mandatory profile logs. Pure entertainment bypass access.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="mt-0.5 text-purple-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div>
                <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-1">Cross-Responsive Canvas</h4>
                <p className="text-xs text-slate-400">Engineered to scale gracefully across any viewport node, from ultra-wide desktops down to mobile screens.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="mt-0.5 text-purple-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div>
                <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-1">Fluid Discovery Design</h4>
                <p className="text-xs text-slate-400">Navigate intuitively through curated metadata nodes designed to find your next track choice in seconds.</p>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* SYSTEM FOOTER GRID ELEMENT */}
      <footer className="w-full py-8 text-center text-xs text-slate-500 border-t border-white/[0.05] bg-[#020203]/40 backdrop-blur-md relative z-10 font-mono tracking-wider">
        &copy; {new Date().getFullYear()} StreamWave Ecosystem. All rights reserved. Content deployment metrics validated.
      </footer>
    </div>
  );
}