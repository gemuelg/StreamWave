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
async function fetchChunk(chunkId: number): Promise<TMDBMedia[]> {
    if (!API_KEY) {
        console.error("API_KEY not found in sitemap-tv.ts");
        return [];
    }
    
    // Calculate the range of TMDB pages this chunk is responsible for
    const startPage = (chunkId - 1) * CHUNK_SIZE + 1;
    const endPage = Math.min(chunkId * CHUNK_SIZE, MAX_PAGES); 
    
    let allMedia: TMDBMedia[] = [];

    // Loop through only the pages in this chunk (e.g., page 1 to 10 for chunk 1)
    for (let page = startPage; page <= endPage; page++) {
        try {
            const url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&page=${page}&sort_by=popularity.desc`;
            const response = await axios.get(url);
            
            allMedia = allMedia.concat(response.data.results);
            
            // Break if the TMDB API runs out of pages before we hit MAX_PAGES
            if (page >= response.data.total_pages) break;
        } catch (error) {
            console.error(`Failed to fetch TV show page ${page} in chunk ${chunkId}:`, error);
            break; // Stop fetching this chunk if one page fails
        }
    }
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