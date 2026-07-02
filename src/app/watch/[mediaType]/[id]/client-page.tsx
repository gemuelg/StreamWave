"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { 
  getMovieDetails, 
  getTVShowDetails, 
  getMovieRecommendations, 
  getTVShowRecommendations,
  getImageUrl, 
  MovieDetails, 
  TVShowDetails,
  Movie,
  TVShow,
  getHnEmbedMovieUrl,
  getHnEmbedTvUrl,
  getMultiEmbedMovieUrl,
  getMultiEmbedTvUrl,
  getVideasyMovieUrl,
  getVideasyTvUrl,
  getMovieGenres,
  getTVGenres,
  Genre,
} from '@/lib/tmdb';
import Navbar from '@/components/Navbar';
import MovieCard from '@/components/MovieCard';
import { PlayCircleIcon, Bars3Icon, ChevronDownIcon, StarIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import CommentSection from '@/components/CommentSection';
import { useUser } from '@/hooks/useUser';
import { getMediaStats, incrementViews, rateMedia } from '@/lib/actions/media_stats';
import toast from 'react-hot-toast';

interface WatchPageProps {
  params: {
    id: string;
    mediaType: string;
  };
  searchParams?: {
    season?: string;
    episode?: string;
  };
}

const formatOverviewText = (text: string | null | undefined, wordsPerLine = 8) => {
  if (!text) return '';
  const words = text.split(' ');
  const lines = [];
  for (let i = 0; i < words.length; i += wordsPerLine) {
    lines.push(words.slice(i, i + wordsPerLine).join(' '));
  }
  return lines.join('<br />');
};

const OVERVIEW_WORD_LIMIT = 40;

export default function ClientWatchPage({ params }: WatchPageProps) {
  const { id, mediaType } = params;
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [content, setContent] = useState<MovieDetails | TVShowDetails | null>(null);
  const [recommendations, setRecommendations] = useState<Movie[] | TVShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullOverview, setShowFullOverview] = useState(false);
  
  const [selectedSeason, setSelectedSeason] = useState<number | undefined>(undefined);
  const [selectedEpisode, setSelectedEpisode] = useState<number | undefined>(undefined);
  const [showSeasonList, setShowSeasonList] = useState(false);
  
  const [selectedServer, setSelectedServer] = useState<'multiembed' | 'hnembed' | 'videasy'>('multiembed');

  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const videoPlayerRef = useRef<HTMLDivElement>(null);

  const [genres, setGenres] = useState<Genre[]>([]);
  const [stats, setStats] = useState({ averageRating: '0.0', viewsCount: 0 });

  const user = useUser();

  // 🛡️ ANTI-DEVTOOLS SHIELD ENGINE
  useEffect(() => {
    // Safety check: Do not execute or freeze your browser on localhost while building!
    if (process.env.NODE_ENV === 'development') return;

    const punishUser = () => {
      // Slaps the user with an endless page refresh loop if they look behind the curtain
      window.location.reload();
    };

    // Method 1: Detect window shrinking from an attached DevTools panel window layout change
    const threshold = 160; 
    const sizeChecker = setInterval(() => {
      const widthExceeded = window.outerWidth - window.innerWidth > threshold;
      const heightExceeded = window.outerHeight - window.innerHeight > threshold;
      
      if (widthExceeded || heightExceeded) {
        punishUser();
      }
    }, 500);

    // Method 2: Recursive Debugger Loop (Crashes and freezes un-docked DevTools windows)
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

    return () => {
      clearInterval(sizeChecker);
      clearInterval(freezer);
    };
  }, []);

  useEffect(() => {
    const hasReloadedKey = `reloaded_${pathname}`;
    const hasReloaded = sessionStorage.getItem(hasReloadedKey);

    if (!hasReloaded) {
      sessionStorage.setItem(hasReloadedKey, 'true');
      console.log('Client-side navigation detected. Forcing a page reload.');
      window.location.reload();
    }
  }, [pathname]);

  useEffect(() => {
    async function fetchGenres() {
      try {
        const movieGenres = await getMovieGenres();
        const tvGenres = await getTVGenres();
        setGenres([...movieGenres, ...tvGenres]);
      } catch (err) {
        console.error("Failed to fetch genres:", err);
      }
    }
    fetchGenres();
  }, []);

  const genresMap = useMemo(() => {
    return new Map(genres.map(genre => [genre.id, genre.name]));
  }, [genres]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        setContent(null);
        setRecommendations([]);
        setVideoUrl(null);
        
        let fetchedContent;
        let fetchedRecommendations;

        if (mediaType === 'movie') {
          fetchedContent = await getMovieDetails(parseInt(id));
          if (fetchedContent) {
            fetchedRecommendations = await getMovieRecommendations(parseInt(id));
            setSelectedEpisode(1);
          }
        } else if (mediaType === 'tv') {
          fetchedContent = await getTVShowDetails(parseInt(id));
          if (fetchedContent) {
            fetchedRecommendations = await getTVShowRecommendations(parseInt(id));
          }
        }
        
        if (fetchedContent) {
          setContent(fetchedContent);
          setRecommendations(fetchedRecommendations || []);
          if (mediaType === 'tv') {
            const tvContent = fetchedContent as TVShowDetails;
            const urlSeason = parseInt(searchParams.get('season') || '1');
            const urlEpisode = parseInt(searchParams.get('episode') || '1');
            
            if (tvContent.seasons && tvContent.seasons.length > 0) {
              const seasonExists = tvContent.seasons.find(s => s.season_number === urlSeason);
              const initialSeasonNumber = seasonExists ? urlSeason : (tvContent.seasons[0]?.season_number || 1);
              const initialSeason = tvContent.seasons.find(s => s.season_number === initialSeasonNumber);
              const episodeCount = initialSeason?.episode_count || 0;
              const validEpisode = urlEpisode > 0 && urlEpisode <= episodeCount ? urlEpisode : 1;
              
              setSelectedSeason(initialSeasonNumber);
              setSelectedEpisode(validEpisode);
              
              if (!searchParams.get('season') || !searchParams.get('episode')) {
                router.replace(`/watch/tv/${id}?season=${initialSeasonNumber}&episode=${validEpisode}`);
              }
            } else {
              setSelectedSeason(undefined);
              setSelectedEpisode(undefined);
            }
          }

          await incrementViews(parseInt(id), mediaType as 'movie' | 'tv');
          const { data, error: statsError } = await getMediaStats(parseInt(id), mediaType as 'movie' | 'tv');
          if (data) {
            setStats(data);
          }
        } else {
          setError('Content not found.');
        }
      } catch (e: any) {
        console.error("Error fetching content details:", e);
        setError("Failed to load content details.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id, mediaType, searchParams, router]);

  useEffect(() => {
    if (content) {
      let url: string | null = null;

      if (mediaType === 'movie') {
        if (selectedServer === 'multiembed') {
          url = getMultiEmbedMovieUrl(parseInt(id));
        } else if (selectedServer === 'hnembed') {
          url = getHnEmbedMovieUrl(parseInt(id));
        } else if (selectedServer === 'videasy') {
          url = getVideasyMovieUrl(parseInt(id));
        }
      } else if (mediaType === 'tv' && selectedSeason && selectedEpisode) {
        if (selectedServer === 'multiembed') {
          url = getMultiEmbedTvUrl(parseInt(id), selectedSeason, selectedEpisode);
        } else if (selectedServer === 'hnembed') {
          url = getHnEmbedTvUrl(parseInt(id), selectedSeason, selectedEpisode);
        } else if (selectedServer === 'videasy') {
          url = getVideasyTvUrl(parseInt(id), selectedSeason, selectedEpisode);
        }
      }
      setVideoUrl(url);
    } else {
      setVideoUrl(null);
    }
  }, [content, mediaType, id, selectedSeason, selectedEpisode, selectedServer]);
  
  const handleEpisodeChange = (episodeNumber: number) => {
    if (selectedSeason) {
      setSelectedEpisode(episodeNumber);
      router.push(`/watch/tv/${id}?season=${selectedSeason}&episode=${episodeNumber}`);
    }
  };

  const handleSeasonSelect = (seasonNumber: number) => {
    setSelectedSeason(seasonNumber);
    setSelectedEpisode(1);
    setShowSeasonList(false);
    router.push(`/watch/tv/${id}?season=${seasonNumber}&episode=1`);
  };
  
  const handleRating = async (rating: number) => {
    if (!user) {
      toast.error("You must be logged in to rate.");
      return;
    }

    const res = await rateMedia(parseInt(id), mediaType as 'movie' | 'tv', rating * 2);
    if (res.success) {
      toast.success("Rating submitted successfully!");
      const { data, error: statsError } = await getMediaStats(parseInt(id), mediaType as 'movie' | 'tv');
      if (data) {
        setStats(data);
      }
    } else {
      toast.error(res.error || "Failed to submit rating.");
    }
  };

  const isTVShow = mediaType === 'tv';
  const tvShowDetails = isTVShow ? (content as TVShowDetails) : null;
  const movieDetails = !isTVShow ? (content as MovieDetails) : null;
  const title = isTVShow ? tvShowDetails?.name : movieDetails?.title;
  const backdropPath = isTVShow ? tvShowDetails?.backdrop_path : movieDetails?.backdrop_path;
  const overview = isTVShow ? tvShowDetails?.overview : movieDetails?.overview;
  const releaseYear = isTVShow ? new Date(tvShowDetails?.first_air_date || '').getFullYear() : new Date(movieDetails?.release_date || '').getFullYear();
  const voteAverage = isTVShow ? tvShowDetails?.vote_average : movieDetails?.vote_average;
  const posterPath = isTVShow ? tvShowDetails?.poster_path : movieDetails?.poster_path;
  const episodeCount = tvShowDetails?.number_of_episodes;
  const runtime = isTVShow ? tvShowDetails?.episode_run_times?.[0] : movieDetails?.runtime;

  const currentSeason = selectedSeason && tvShowDetails?.seasons.find(s => s.season_number === selectedSeason);

  const words = overview?.split(' ') || [];
  const truncatedOverview = words.length > OVERVIEW_WORD_LIMIT
    ? words.slice(0, OVERVIEW_WORD_LIMIT).join(' ') + '...'
    : overview;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#040406] flex items-center justify-center text-white">
        <div className="w-full max-w-sm p-8 text-center bg-white/[0.01] border border-white/5 backdrop-blur-xl rounded-2xl shadow-2xl">
          <div className="w-8 h-8 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-zinc-400">Loading details...</p>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-[#040406] flex items-center justify-center text-white px-4">
        <div className="w-full max-w-md p-8 text-center bg-white/[0.01] border border-white/5 backdrop-blur-xl rounded-2xl shadow-xl">
          <ExclamationTriangleIcon className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Content Unavailable</h1>
          <p className="text-sm text-zinc-400 mb-8 leading-relaxed">{error || "The content you are looking for is currently unavailable."}</p>
          <Link href="/" className="inline-block bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3 rounded-xl text-sm transition-colors">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-white bg-[#040406] overflow-hidden flex flex-col pt-16">
      <Navbar />

      {backdropPath && (
        <>
          <div
            className="absolute inset-0 z-0 bg-cover bg-center opacity-[0.05] pointer-events-none transition-opacity duration-1000"
            style={{ backgroundImage: `url(${getImageUrl(backdropPath, 'original')})` }}
          />
          <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-b from-[#040406]/50 via-[#040406] to-[#040406]" />
        </>
      )}

      <div className="max-w-[1440px] mx-auto w-full px-4 md:px-8 lg:px-12 py-8 md:py-12 relative z-30 flex flex-col lg:flex-row gap-8 items-start">
        
        <aside className="w-full lg:w-80 order-2 lg:order-1 bg-white/[0.01] border border-white/5 backdrop-blur-xl rounded-2xl p-5 flex flex-col shadow-2xl">
          {isTVShow ? (
            <>
              <div className="relative mb-5">
                <button
                  onClick={() => setShowSeasonList(!showSeasonList)}
                  className="w-full bg-white/[0.02] border border-white/5 text-white rounded-xl py-3 pl-4 pr-10 flex items-center justify-between hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Bars3Icon className="w-4 h-4 text-zinc-400" />
                    <span className="font-bold text-sm tracking-tight text-ellipsis whitespace-nowrap overflow-hidden">
                      Season {selectedSeason}
                    </span>
                  </div>
                  <ChevronDownIcon className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${showSeasonList ? 'rotate-180' : ''}`} />
                </button>
                
                {showSeasonList && (
                  <div className="absolute top-full left-0 z-50 mt-2 w-full bg-[#0a0a0f] border border-white/10 rounded-xl shadow-2xl max-h-[40vh] overflow-y-auto backdrop-blur-2xl divide-y divide-white/5">
                    {tvShowDetails?.seasons.map(season => (
                      <button
                        key={season.id}
                        onClick={() => handleSeasonSelect(season.season_number)}
                        className={`block w-full text-left px-4 py-3 text-sm transition-colors ${
                          selectedSeason === season.season_number
                            ? 'bg-white/5 text-blue-400 font-semibold'
                            : 'text-zinc-400 hover:bg-white/[0.02] hover:text-white'
                        }`}
                      >
                        Season {season.season_number}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {selectedSeason && currentSeason ? (
                <>
                  <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-4">
                    <h3 className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">
                      Episodes
                    </h3>
                    <span className="text-xs text-zinc-400">
                      {currentSeason.episode_count} Episodes
                    </span>
                  </div>
                  <div className="w-full">
                    <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-4 gap-2">
                      {Array.from({ length: currentSeason.episode_count || 0 }, (_, i) => i + 1).map(episodeNum => (
                        <button
                          key={episodeNum}
                          onClick={() => handleEpisodeChange(episodeNum)}
                          className={`aspect-square rounded-lg flex items-center justify-center transition-all duration-300 text-sm font-semibold ${
                            selectedEpisode === episodeNum
                              ? 'bg-blue-600 text-white font-bold shadow-lg'
                              : 'bg-white/[0.02] border border-white/5 hover:border-white/20 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {episodeNum}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center p-6 text-zinc-500 text-sm">
                  No episodes available.
                </div>
              )}
            </>
          ) : (
            <>
              <h3 className="text-xs font-semibold tracking-wider text-zinc-400 uppercase border-b border-white/5 pb-2 mb-4">
                Media Info
              </h3>
              <div className="w-full">
                <div className="grid grid-cols-4 gap-2">
                  <button className="aspect-square rounded-lg flex items-center justify-center bg-blue-600 text-white font-bold text-sm shadow-md">
                    Full
                  </button>
                </div>
              </div>
            </>
          )}
        </aside>

        <div className="flex-grow w-full order-1 lg:order-2 flex flex-col space-y-4">
          {videoUrl ? (
            <div ref={videoPlayerRef} className="relative w-full aspect-video bg-black border border-white/5 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500">
              <iframe
                key={videoUrl}
                src={videoUrl}
                allowFullScreen
                frameBorder="0"
                className="w-full h-full relative z-10"
              />
            </div>
          ) : (
            <div ref={videoPlayerRef} className="w-full aspect-video flex flex-col items-center justify-center bg-white/[0.01] border border-dashed border-white/10 rounded-2xl text-zinc-400 text-sm p-8 text-center">
              <PlayCircleIcon className="w-12 h-12 text-zinc-600 mb-3 animate-pulse" />
              Failed to load video stream. Please choose a different option or server.
            </div>
          )}
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white/[0.01] border border-white/5 p-4 rounded-xl backdrop-blur-md">
            <div className="flex flex-wrap gap-2">
              {(['multiembed', 'hnembed', 'videasy'] as const).map((server, idx) => (
                <button
                  key={server}
                  onClick={() => setSelectedServer(server)}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-medium uppercase tracking-wider rounded-lg border transition-all duration-300 ${
                    selectedServer === server 
                      ? 'bg-white/10 border-white/20 text-white font-semibold' 
                      : 'bg-transparent border-white/5 text-zinc-400 hover:text-white hover:border-white/10'
                  }`}
                >
                  <PlayCircleIcon className={`w-3.5 h-3.5 ${selectedServer === server ? 'text-blue-400' : 'text-zinc-500'}`} /> 
                  Server {idx + 1}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-3 bg-white/[0.02] border border-white/5 px-4 py-2 rounded-lg">
              <span className="text-zinc-400 text-xs font-medium">Rate content:</span>
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handleRating(i + 1)}
                    className="text-zinc-600 hover:text-blue-400 transition-colors duration-200 group transform active:scale-90"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                      <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.908 -1l3.082 -6.25l3.082 6.25l6.908 1l-5 4.867l1.179 6.873z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <aside className="w-full lg:w-80 order-3 lg:order-3 bg-white/[0.01] border border-white/5 backdrop-blur-xl rounded-2xl p-5 shadow-2xl flex flex-col space-y-5">
          <div className="flex items-start gap-4">
            {posterPath && (
              <div className="relative w-[75px] h-[110px] rounded-lg overflow-hidden border border-white/10 shadow-lg flex-shrink-0 bg-zinc-900">
                <Image
                  src={getImageUrl(posterPath, 'w500')}
                  alt={title || "Poster profile"}
                  width={75}
                  height={110}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>
            )}
            <div className="space-y-1 overflow-hidden">
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider block">
                {mediaType === 'movie' ? 'Movie Details' : 'TV Show Details'}
              </span>
              <h2 className="text-lg font-bold tracking-tight text-white leading-tight break-words">
                {title}
              </h2>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white/[0.02] border border-white/5 p-2 rounded-lg text-center">
              <span className="text-zinc-500 block text-[10px] uppercase mb-0.5">Format</span>
              <span className="text-zinc-200 font-semibold uppercase">{isTVShow ? `${episodeCount} EP` : 'Feature'}</span>
            </div>
            <div className="bg-white/[0.02] border border-white/5 p-2 rounded-lg text-center">
              <span className="text-zinc-500 block text-[10px] uppercase mb-0.5">Duration</span>
              <span className="text-zinc-200 font-semibold">{runtime || '--'}m</span>
            </div>
            <div className="bg-white/[0.02] border border-white/5 p-2 rounded-lg text-center">
              <span className="text-zinc-500 block text-[10px] uppercase mb-0.5">Release Year</span>
              <span className="text-zinc-200 font-semibold">{releaseYear || 'N/A'}</span>
            </div>
            {voteAverage && voteAverage > 0 ? (
              <div className="bg-white/[0.02] border border-white/5 p-2 rounded-lg text-center flex flex-col items-center justify-center">
                <span className="text-zinc-500 block text-[10px] uppercase mb-0.5">Rating</span>
                <span className="text-yellow-400 font-bold flex items-center gap-1">
                  ★ {voteAverage.toFixed(1)}
                </span>
              </div>
            ) : null}
          </div>

          <div className="border-t border-white/5 pt-4">
            <span className="text-xs font-semibold tracking-wider text-zinc-400 uppercase block mb-2">
              Overview
            </span>
            <div className="text-xs text-zinc-400 font-normal leading-relaxed tracking-wide">
              <span dangerouslySetInnerHTML={{ __html: formatOverviewText(showFullOverview ? overview : truncatedOverview) }} />
              {overview && overview.split(' ').length > OVERVIEW_WORD_LIMIT && (
                <button
                  onClick={() => setShowFullOverview(!showFullOverview)}
                  className="text-blue-400 font-semibold text-xs block mt-2 hover:text-white transition-colors"
                >
                  {showFullOverview ? 'Read Less' : 'Read More'}
                </button>
              )}
            </div>
          </div>
        </aside>
      </div>

      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 pb-16 relative z-30 space-y-16">
        <div className="border-t border-white/5 pt-8">
          <CommentSection mediaId={parseInt(id)} mediaType={mediaType as 'movie' | 'tv'} />
        </div>

        {recommendations.length > 0 && (
          <div className="border-t border-white/5 pt-12 mt-12">
            <div className="mb-8 border-b border-white/5 pb-4">
              <span className="text-sm font-semibold tracking-wider text-blue-400 uppercase mb-1 block">
                Recommendations
              </span>
              <h2 className="text-xl md:text-2xl font-bold text-white">
                More Like This
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {recommendations.slice(0, 18).map((item) => (
                <div 
                  key={item.id} 
                  className="transform transition-transform duration-300 hover:scale-[1.02]"
                >
                  <MovieCard
                    content={item}
                    contentType={(item as any).media_type || mediaType}
                    genresMap={genresMap}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="relative z-30 w-full py-6 text-center text-xs text-zinc-500 border-t border-white/5 bg-[#040406] mt-auto">
        &copy; {new Date().getFullYear()} Stream Wave. All rights reserved. Sourced via TMDB.
      </footer>
    </div>
  );
}