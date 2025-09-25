// src/app/sitemap-tv.ts (Dynamic Sitemap for TV Show URLs)

import { MetadataRoute } from 'next';
import axios from 'axios';

// --- Configuration ---
const SITE_URL = 'https://streamwave.xyz'; 
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY; // Use your environment variable
const BASE_URL = 'https://api.themoviedb.org/3';

// 🚀 CRITICAL FIX: Define chunking parameters
const CHUNK_SIZE = 10;   // Number of TMDB API pages to fetch per sitemap file (e.g., 10 pages)
const MAX_PAGES = 100;  // Total number of TMDB pages to index (e.g., 100 pages total)
const NUM_CHUNKS = Math.ceil(MAX_PAGES / CHUNK_SIZE); // Total sitemap files needed (100/10 = 10 files)

interface TMDBMedia {
    id: number;
    first_air_date?: string;
}

// --------------------------------------------------------------------------
// --- 1. generateSitemaps: Tells Next.js to create multiple sitemap files ---
// --------------------------------------------------------------------------
export async function generateSitemaps() {
    // This creates the IDs for the dynamic sitemap routes: /sitemap-tv/[id].xml
    return Array.from({ length: NUM_CHUNKS }, (_, i) => ({ id: i + 1 }));
}

// --------------------------------------------------------------------------
// --- 2. fetchChunk: Fetches a small, reliable batch of data (max 10 API calls) ---
// --------------------------------------------------------------------------
async function fetchChunk(chunkId: number): Promise<any[]> {
    if (!API_KEY) return [];
    
    const mediaType = 'tv'; // Set media type for this specific file
    const startPage = (chunkId - 1) * CHUNK_SIZE + 1;
    const endPage = Math.min(chunkId * CHUNK_SIZE, MAX_PAGES); 
    
    // 1. Array to hold all the simultaneous API request promises
    const fetchPromises = [];
    for (let page = startPage; page <= endPage; page++) {
        const url = `${BASE_URL}/discover/${mediaType}?api_key=${API_KEY}&page=${page}&sort_by=popularity.desc`;
        
        // Push the PROMISE for the API call. Use .catch() to prevent Promise.all from failing.
        fetchPromises.push(axios.get(url).catch(e => {
            console.error(`[SITEMAP] Failed to fetch TV page ${page} in chunk ${chunkId}:`, e.message);
            return null; // Return null on error
        }));
    }
    
    // 2. CRITICAL: Await all 10 requests SIMULTANEOUSLY
    const responses = await Promise.all(fetchPromises);
    
    // 3. Filter and combine results
    let allMedia: any[] = [];
    responses.forEach(response => {
        if (response && response.data && response.data.results) {
            allMedia = allMedia.concat(response.data.results);
        }
    });

    return allMedia;
}

// --------------------------------------------------------------------------
// --- 3. default export: Runs for each generated sitemap ID ---
// --------------------------------------------------------------------------
export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
    const today = new Date().toISOString().split('T')[0];
    const tvShows = await fetchChunk(id);

    return tvShows.map(tvShow => ({
        url: `${SITE_URL}/watch/tv/${tvShow.id}`,
        // Use first_air_date for TV shows
        lastModified: tvShow.first_air_date ? new Date(tvShow.first_air_date).toISOString().split('T')[0] : today,
        changeFrequency: 'weekly' as 'weekly',
        priority: 0.7,
    }));
}