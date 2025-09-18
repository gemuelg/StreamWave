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

export interface TMDBListResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
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

// NEW: Interfaces for movie certifications (age-appropriate ratings)
export interface ReleaseDate {
  certification: string; // This is the age rating, e.g., "PG-13", "R"
  iso_639_1: string | null;
  release_date: string;
  type: number;
}

export interface ReleaseDateResult {
  iso_3166_1: string; // Country code, e.g., "US"
  release_dates: ReleaseDate[];
}

export interface ReleaseDatesResponse {
  id: number;
  results: ReleaseDateResult[];
}

// NEW: Interfaces for TV show content ratings (age-appropriate ratings)
export interface ContentRating {
  iso_3166_1: string; // Country code, e.g., "US"
  rating: string; // This is the age rating, e.g., "TV-MA", "TV-G"
}

export interface ContentRatingsResponse {
  id: number;
  results: ContentRating[];
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

// UPDATED: Added popularity and vote_count
export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  popularity: number;
  release_date: string;
  genre_ids?: number[];
  media_type?: 'movie';
}

// UPDATED: Added `release_dates` to contain age ratings
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
  release_dates?: ReleaseDatesResponse; // NEW
}

// NEW: Added MovieResults interface
export interface MovieResults {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

// UPDATED: Return full TMDBListResponse
export async function getTrendingMovies(): Promise<TMDBListResponse<Movie>> {
  const url = `${BASE_URL}/trending/movie/week?api_key=${API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch trending movies');
  }
  const data = await response.json();
  return data;
}

// UPDATED: Added `release_dates` to `append_to_response`
export const getMovieDetails = async (id: number): Promise<MovieDetails | null> => {
  try {
    const response = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&append_to_response=credits,videos,release_dates`);
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

export interface GenresApiResponse {
  genres: Genre[];
}

// UPDATED: Added popularity and vote_count
export interface TVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  popularity: number;
  first_air_date: string;
  genre_ids?: number[];
  media_type?: 'tv';
}

// UPDATED: Added `content_ratings` to contain age ratings
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
  content_ratings?: ContentRatingsResponse; // NEW
}

// NEW: Added TVShowResults interface
export interface TVShowResults {
  page: number;
  results: TVShow[];
  total_pages: number;
  total_results: number;
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

// UPDATED: Added `content_ratings` to `append_to_response`
export const getTVShowDetails = async (id: number): Promise<TVShowDetails | null> => {
  try {
    const response = await fetch(`${BASE_URL}/tv/${id}?api_key=${API_KEY}&append_to_response=credits,videos,content_ratings`);
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

export async function getNowPlayingMovies(): Promise<TMDBListResponse<Movie>> {
  try {
    const res = await fetch(`${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=en-US&page=1&include_adult=false&certification_country=US&certification.lte=R`);
    if (!res.ok) {
      throw new Error(`Failed to fetch now playing movies: ${res.statusText}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch now playing movies:", error);
    return { page: 0, results: [], total_pages: 0, total_results: 0 };
  }
}

export async function getOnTheAirTVShows(): Promise<TMDBListResponse<TVShow>> {
  try {
    const res = await fetch(`${BASE_URL}/tv/on_the_air?api_key=${API_KEY}&language=en-US&page=1&include_adult=false`);
    if (!res.ok) {
      throw new Error(`Failed to fetch on the air TV shows: ${res.statusText}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch on the air TV shows:", error);
    return { page: 0, results: [], total_pages: 0, total_results: 0 };
  }
}

export async function getMovieGenres(): Promise<Genre[]> {
  try {
    const res = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}`);
    const data = await res.json();
    return data.genres;
  } catch (error) {
    console.error('Error fetching movie genres:', error);
    return [];
  }
};

export async function getTVShowGenres(): Promise<Genre[]> {
try {
    const res = await fetch(`${BASE_URL}/genre/tv/list?api_key=${API_KEY}`);
    const data = await res.json();
    return data.genres;
  } catch (error) {
    console.error('Error fetching TV show genres:', error);
    return [];
  }
};

const getTodayDate = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// UPDATED: Removed hardcoded filters
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
  // NEW: Filter out movies with a future release date
  url += `&primary_release_date.lte=${getTodayDate()}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch filtered movies: ${res.statusText}`);
  }
  const data = await res.json();
  return { results: data.results, total_pages: data.total_pages };
}
// UPDATED: Removed hardcoded filters
// Update this function in src/lib/tmdb.ts
export const getFilteredTVShows = async (
  page: number = 1,
  genres: string = '',
  year: number | null = null,
  sortBy: string = 'popularity.desc'
): Promise<TMDBListResponse<TVShow>> => {
  let url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=en-US&page=${page}&sort_by=${sortBy}&include_adult=false`;
  if (genres) {
    url += `&with_genres=${genres}`;
  }
  if (year) {
    url += `&first_air_date_year=${year}`;
  }
  // NEW: Filter out TV shows with a future first air date
  url += `&first_air_date.lte=${getTodayDate()}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch TV shows: ${response.statusText}`);
  }

  return response.json();
};

export const getTVGenres = async (): Promise<Genre[]> => {
  const url = `${BASE_URL}/genre/tv/list?api_key=${API_KEY}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch TV genres: ${response.statusText}`);
  }

  const data = await response.json();
  return data.genres;
};

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

// UPDATED: Return full TMDBListResponse
export async function getTrendingTVShows(): Promise<TMDBListResponse<TVShow>> {
  const url = `${BASE_URL}/trending/tv/week?api_key=${API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch trending TV shows');
  }
  const data = await response.json();
  return data;
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

// CORRECTED: Multi-search result item interface
export interface MultiSearchResultItem {
  id: number;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  popularity: number;
  media_type: 'movie' | 'tv' | 'person';
  // These properties exist on some results, but not all
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  overview?: string;
}


export interface MultiSearchResults {
  page: number;
  results: MultiSearchResultItem[];
  total_pages: number;
  total_results: number;
}

// New function to perform a multi-search
export async function searchMulti(query: string, page: number = 1): Promise<MultiSearchResults> {
  const url = `${BASE_URL}/search/multi?query=${encodeURIComponent(query)}&page=${page}&language=en-US`;
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN}`,
      },
    });

    if (!response.ok) {
      console.error(`TMDB API Error: ${response.status} ${response.statusText}`);
      throw new Error('Failed to fetch search results.');
    }

    const data: MultiSearchResults = await response.json();
    return data;
  } catch (error) {
    console.error("Error in searchMulti function:", error);
    throw error;
  }
}

export const getYouTubeEmbedUrl = (key: string): string => {
  return `${YOUTUBE_EMBED_BASE_URL}${key}`;
};

export const getYouTubeWatchUrl = (key: string): string => {
  return `${YOUTUBE_WATCH_BASE_URL}${key}`;
};

const HN_EMBED_BASE_URL = 'https://vidsrc.cc/v3/embed';
const MULTI_EMBED_BASE_URL = 'https://player.vidplus.to';
const VIDEASY_BASE_URL = 'https://player.videasy.net';
const THEME_COLOR = '8B5CF6';

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
  return `${MULTI_EMBED_BASE_URL}/embed/movie/${tmdbId}`;
};

export const getMultiEmbedTvUrl = (tmdbId: number, seasonNumber: number, episodeNumber: number): string => {
  return `${MULTI_EMBED_BASE_URL}/embed/tv/${tmdbId}/${seasonNumber}/${episodeNumber}`;
};
export const getVideasyMovieUrl = (tmdbId: number): string => {
  const params = new URLSearchParams({
    color: THEME_COLOR,
    overlay: 'true'
  });
  return `${VIDEASY_BASE_URL}/movie/${tmdbId}?${params.toString()}`;
};

export const getVideasyTvUrl = (tmdbId: number, seasonNumber: number, episodeNumber: number): string => {
  const params = new URLSearchParams({
    color: THEME_COLOR,
    overlay: 'true'
  });
  return `${VIDEASY_BASE_URL}/tv/${tmdbId}/${seasonNumber}/${episodeNumber}?${params.toString()}`;
};

// NEW: Discover functions to be used on movies/page.tsx and tv/page.tsx
export async function getDiscoverMovies({
  page = 1,
  genres = null,
  year = null,
  sortBy = 'popularity.desc',
}: {
  page?: number;
  genres?: string | null;
  year?: number | null;
  sortBy?: string;
}): Promise<TMDBListResponse<Movie>> {
  const params = new URLSearchParams({
    api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY!,
    language: 'en-US',
    page: page.toString(),
    sort_by: sortBy,
  });

  if (genres) {
    params.append('with_genres', genres);
  }
  if (year) {
    params.append('primary_release_year', year.toString());
  }

  const url = `${BASE_URL}/discover/movie?${params.toString()}`;
  const response = await fetch(url, { next: { revalidate: 3600 } });
  
  if (!response.ok) {
    throw new Error('Failed to fetch movies');
  }

  const data = await response.json();
  return data;
}

export async function getDiscoverTVShows({
  page = 1,
  genres = null,
  year = null,
  sortBy = 'popularity.desc',
}: {
  page?: number;
  genres?: string | null;
  year?: number | null;
  sortBy?: string;
}): Promise<TMDBListResponse<TVShow>> {
  const params = new URLSearchParams({
    api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY!,
    language: 'en-US',
    page: page.toString(),
    sort_by: sortBy,
  });

  if (genres) {
    params.append('with_genres', genres);
  }
  if (year) {
    params.append('first_air_date_year', year.toString());
  }

  const url = `${BASE_URL}/discover/tv?${params.toString()}`;
  const response = await fetch(url, { next: { revalidate: 3600 } });
  
  if (!response.ok) {
    throw new Error('Failed to fetch TV shows');
  }

  const data = await response.json();
  return data;
}

// NEW: Add discoverContent function for streaming platforms
export const WATCH_PROVIDER_IDS = {
  NETFLIX: 8,
  HULU: 15,
  DISNEY_PLUS: 337,
  AMAZON_PRIME_VIDEO: 9,
  MAX: 112,
};

export const discoverContent = async <T extends Movie | TVShow>(
  type: 'movie' | 'tv',
  page: number = 1,
  providers: number[] = [],
  sort_by: string = 'popularity.desc'
): Promise<TMDBListResponse<T> | null> => {
  try {
    const providerList = providers.join('|');
    const url = `${BASE_URL}/discover/${type}?api_key=${API_KEY}&page=${page}&with_watch_providers=${providerList}&watch_region=US&sort_by=${sort_by}`;
    
    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (!response.ok) {
      throw new Error(`Failed to fetch ${type} content`);
    }
    return response.json();
  } catch (error) {
    console.error(`Error fetching discovered ${type} content:`, error);
    return null;
  }
};