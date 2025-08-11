// src/lib/tmdb.ts
// Make sure API_KEY is correctly referencing NEXT_PUBLIC_TMDB_API_KEY
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

const YOUTUBE_EMBED_BASE_URL = 'https://www.youtube.com/embed/';
const YOUTUBE_WATCH_BASE_URL = 'https://www.youtube.com/watch?v=';

export const getImageUrl = (path: string | null, size: string = 'w500'): string => {
  if (!path) {
    return '/no-image-placeholder.svg';
  }
  return `${IMAGE_BASE_URL}${size}${path}`;
};

export interface Genre {
  id: number;
  name: string;
}

export interface ProductionCompany {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

export interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface Video {
  iso_639_1: string;
  iso_3166_1: string;
  name: string;
  key: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
  id: string;
}

export interface VideoResponse {
  id: number;
  results: Video[];
}

export const getPrimaryVideoKey = (videos: VideoResponse | null): string | null => {
    if (!videos || !videos.results) return null;
    
    const officialTrailer = videos.results.find(
      (video) => video.site === 'YouTube' && video.type === 'Trailer' && video.official
    );
    if (officialTrailer) return officialTrailer.key;
    
    const anyTrailer = videos.results.find(
      (video) => video.site === 'YouTube' && video.type === 'Trailer'
    );
    if (anyTrailer) return anyTrailer.key;
    
    const officialVideo = videos.results.find(
        (video) => video.site === 'YouTube' && video.official
    );
    if (officialVideo) return officialVideo.key;

    const anyVideo = videos.results.find(
      (video) => video.site === 'YouTube' && !!video.key
    );
    if (anyVideo) return anyVideo.key;
    
    return null;
};

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date: string;
  genre_ids?: number[];
}

export interface MovieDetails extends Movie {
  tagline: string | null;
  genres: Genre[];
  runtime: number | null;
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  imdb_id: string | null;
  credits?: {
    cast: CastMember[];
    crew?: CrewMember[];
  };
  videos?: VideoResponse;
}

export const getTrendingMovies = async (): Promise<Movie[]> => {
  try {
    const response = await fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}&include_adult=false`);
    if (!response.ok) {
      throw new Error(`Error fetching trending movies: ${response.statusText}`);
    }
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Failed to fetch trending movies:", error);
    return [];
  }
};

export const getMovieDetails = async (id: number): Promise<MovieDetails | null> => {
  try {
    const response = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&append_to_response=credits,videos`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Error fetching movie details for ID ${id}: ${response.statusText}`);
    }
    const data: MovieDetails = await response.json();
    return data;
  } catch (error) {
    console.error(`Failed to fetch movie details for ID ${id}:`, error);
    return null;
  }
};

export interface TVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  first_air_date: string;
  genre_ids?: number[];
}

export interface TVShowDetails extends TVShow {
  tagline: string | null;
  genres: Genre[];
  episode_run_times: number[];
  number_of_seasons: number;
  number_of_episodes: number;
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  imdb_id: string | null;
  credits?: {
    cast: CastMember[];
    crew?: CrewMember[];
  };
  videos?: VideoResponse;
  status: string;
  original_language: string;
}

export interface SeasonDetails {
  air_date: string | null;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  vote_average: number;
}

declare module './tmdb' {
  interface TVShowDetails {
    seasons: SeasonDetails[];
  }
}

export const getTVShowDetails = async (id: number): Promise<TVShowDetails | null> => {
  try {
    const response = await fetch(`${BASE_URL}/tv/${id}?api_key=${API_KEY}&append_to_response=credits,videos`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Error fetching TV show details for ID ${id}: ${response.statusText}`);
    }
    const data: TVShowDetails = await response.json();
    return data;
  } catch (error) {
    console.error(`Failed to fetch TV show details for ID ${id}:`, error);
    return null;
  }
};

export async function getNowPlayingMovies(): Promise<Movie[]> {
  try {
    const res = await fetch(`${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=en-US&page=1&include_adult=false&certification_country=US&certification.lte=R`);
    if (!res.ok) {
      throw new Error(`Failed to fetch now playing movies: ${res.statusText}`);
    }
    const data = await res.json();
    return data.results;
  } catch (error) {
    console.error("Failed to fetch now playing movies:", error);
    return [];
  }
}

export async function getOnTheAirTVShows(): Promise<TVShow[]> {
  try {
    const res = await fetch(`${BASE_URL}/tv/on_the_air?api_key=${API_KEY}&language=en-US&page=1&include_adult=false`);
    if (!res.ok) {
      throw new Error(`Failed to fetch on the air TV shows: ${res.statusText}`);
    }
    const data = await res.json();
    return data.results;
  } catch (error) {
    console.error("Failed to fetch on the air TV shows:", error);
    return [];
  }
}

export async function getMovieGenres(): Promise<Genre[]> {
  const url = `${BASE_URL}/genre/movie/list?api_key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch movie genres');
  }
  const data = await res.json();
  return data.genres;
}

export async function getTVShowGenres(): Promise<Genre[]> {
  const url = `${BASE_URL}/genre/tv/list?api_key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch TV show genres');
  }
  const data = await res.json();
  return data.genres;
}

export async function getFilteredMovies(
  page: number = 1,
  genres: string = '',
  year: number | null = null,
  sortBy: string = 'popularity.desc'
): Promise<{ results: Movie[]; total_pages: number }> {
  let url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&page=${page}&sort_by=${sortBy}&include_adult=false&certification_country=US&certification.lte=R`;
  if (genres) {
    url += `&with_genres=${genres}`;
  }
  if (year) {
    url += `&primary_release_year=${year}`;
  }
  url += `&vote_count.gte=500&vote_average.gte=6.0`; // <<< Updated: Added filters for well-known and high-quality movies
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch filtered movies: ${res.statusText}`);
  }
  const data = await res.json();
  return { results: data.results, total_pages: data.total_pages };
}

export async function getFilteredTVShows(
  page: number = 1,
  genres: string = '',
  year: number | null = null,
  sortBy: string = 'popularity.desc'
): Promise<{ results: TVShow[]; total_pages: number }> {
  let url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=en-US&page=${page}&sort_by=${sortBy}&include_adult=false`;
  if (genres) {
    url += `&with_genres=${genres}`;
  }
  if (year) {
    url += `&first_air_date_year=${year}`;
  }
  url += `&vote_count.gte=500&vote_average.gte=6.0`; // <<< Updated: Added filters for well-known and high-quality TV shows
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch filtered TV shows: ${res.statusText}`);
  }
  const data = await res.json();
  return { results: data.results, total_pages: data.total_pages };
}

export async function getPopularTVShows(page: number = 1): Promise<{ results: TVShow[]; total_pages: number }> {
  const url = `${BASE_URL}/tv/popular?api_key=${API_KEY}&page=${page}&include_adult=false`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch popular TV shows');
  }
  const data = await res.json();
  return { results: data.results, total_pages: data.total_pages };
}

export async function getPopularMovies(page: number = 1): Promise<{ results: Movie[]; total_pages: number }> {
  const url = `${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}&include_adult=false&certification_country=US&certification.lte=R`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch popular movies');
  }
  const data = await res.json();
  return { results: data.results, total_pages: data.total_pages };
}

export const getTrendingTVShows = async (): Promise<TVShow[]> => {
  try {
    const response = await fetch(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}&include_adult=false`);
    if (!response.ok) {
      throw new Error(`Error fetching trending TV shows: ${response.statusText}`);
    }
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Failed to fetch trending TV shows:", error);
    return [];
  }
};

export async function getMovieRecommendations(movieId: number): Promise<Movie[]> {
  try {
    const response = await fetch(`${BASE_URL}/movie/${movieId}/recommendations?api_key=${API_KEY}&language=en-US&page=1&include_adult=false`);
    if (response.status === 404) {
      console.log(`No recommendations found for movie ID ${movieId}. Returning popular movies as a fallback.`);
      const popularMovies = await getPopularMovies(1);
      return popularMovies.results;
    }

    if (!response.ok) {
      throw new Error(`Error fetching movie recommendations for ID ${movieId}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error(`Failed to fetch movie recommendations for ID ${movieId}:`, error);
    return [];
  }
}

export async function getTVShowRecommendations(tvId: number): Promise<TVShow[]> {
  try {
    const response = await fetch(`${BASE_URL}/tv/${tvId}/recommendations?api_key=${API_KEY}&language=en-US&page=1&include_adult=false`);
    
    if (response.status === 404) {
      console.log(`No recommendations found for TV show ID ${tvId}. Returning popular TV shows as a fallback.`);
      const popularTVShows = await getPopularTVShows(1);
      return popularTVShows.results;
    }

    if (!response.ok) {
      throw new Error(`Error fetching TV show recommendations for ID ${tvId}: ${response.statusText}`);
    }
    const data = await response.json();
    return data.results as TVShow[];
  } catch (error) {
    console.error(`Failed to fetch TV show recommendations for ID ${tvId}:`, error);
    return [];
  }
}

export interface MultiSearchResultItem {
  vote_average: number;
  id: number;
  media_type: 'movie' | 'tv' | 'person';
  poster_path?: string | null;
  backdrop_path?: string | null;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  profile_path?: string | null;
  // ADDED: These properties are returned by the search API
  popularity?: number;
  vote_count?: number;
  overview?: string;
}

export interface MultiSearchResults {
  page: number;
  results: MultiSearchResultItem[];
  total_pages: number;
  total_results: number;
}


export async function searchMulti(query: string, page: number = 1): Promise<MultiSearchResults> {
  if (!process.env.NEXT_PUBLIC_TMDB_API_KEY) {
    throw new Error('NEXT_PUBLIC_TMDB_API_KEY is not defined in environment variables.');
  }
  if (!query) {
    return { page: 1, results: [], total_pages: 0, total_results: 0 };
  }

  const url = `${BASE_URL}/search/multi?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}&include_adult=false`;
  const response = await fetch(url);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`TMDB Search API Error: Status ${response.status}, Body: ${errorText}`);
    throw new Error(`Failed to search: ${response.status} - ${errorText}`);
  }

  const data: MultiSearchResults = await response.json();
  return data;
}

export const getYouTubeEmbedUrl = (key: string): string => {
  return `${YOUTUBE_EMBED_BASE_URL}${key}`;
};

export const getYouTubeWatchUrl = (key: string): string => {
  return `${YOUTUBE_WATCH_BASE_URL}${key}`;
};

const HN_EMBED_BASE_URL = 'https://hnembed.cc/embed';
const MULTI_EMBED_BASE_URL = 'https://multiembed.mov/';

export const getHnEmbedMovieUrl = (tmdbId: number): string => {
  return `${HN_EMBED_BASE_URL}/movie/${tmdbId}`;
};

export const getHnEmbedTvUrl = (tmdbId: number, seasonNumber?: number, episodeNumber?: number): string => {
  if (seasonNumber && episodeNumber) {
    return `${HN_EMBED_BASE_URL}/tv/${tmdbId}/${seasonNumber}/${episodeNumber}`;
  }
  return `${HN_EMBED_BASE_URL}/tv/${tmdbId}`;
};

export const getMultiEmbedMovieUrl = (tmdbId: number): string => {
  return `${MULTI_EMBED_BASE_URL}?video_id=${tmdbId}&tmdb=1`;
};

export const getMultiEmbedTvUrl = (tmdbId: number, seasonNumber: number, episodeNumber: number): string => {
  return `${MULTI_EMBED_BASE_URL}?video_id=${tmdbId}&tmdb=1&s=${seasonNumber}&e=${episodeNumber}`;
};