// src/app/sitemap-movies.ts (Revised with generateSitemaps)

import { MetadataRoute } from 'next';
import axios from 'axios';

const SITE_URL = 'https://streamwave.xyz';
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY; 
const BASE_URL = 'https://api.themoviedb.org/3';

// 🚀 CRITICAL FIX: Split the 100-page loop into 10 separate sitemaps (10 pages per sitemap)
const CHUNK_SIZE = 10;
const MAX_PAGES = 100; // Total pages we want to index
const NUM_CHUNKS = Math.ceil(MAX_PAGES / CHUNK_SIZE); // 100 / 10 = 10 sitemaps

// --- 1. Generate Sitemap IDs ---
export async function generateSitemaps() {
    // Returns [{ id: 1 }, { id: 2 }, ..., { id: 10 }]
    return Array.from({ length: NUM_CHUNKS }, (_, i) => ({ id: i + 1 }));
}

// --- 2. Fetch Logic (now only fetches the data for one chunk/id) ---
async function fetchChunk(chunkId: number): Promise<any[]> {
    if (!API_KEY) return [];
    
    // Calculate the range of TMDB pages this chunk is responsible for
    const startPage = (chunkId - 1) * CHUNK_SIZE + 1;
    const endPage = Math.min(chunkId * CHUNK_SIZE, MAX_PAGES); 
    
    let allMedia: any[] = [];

    // Loop through only the pages in this chunk (max 10 API calls)
    for (let page = startPage; page <= endPage; page++) {
        try {
            const url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&page=${page}&sort_by=popularity.desc`;
            const response = await axios.get(url);
            allMedia = allMedia.concat(response.data.results);
            if (page >= response.data.total_pages) break; // Break if TMDB runs out of pages
        } catch (error) {
            console.error(`Failed to fetch movie page ${page} in chunk ${chunkId}:`, error);
            break; 
        }
    }
    return allMedia;
}

// --- 3. Main Sitemap Function (gets run for each ID) ---
export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
    const today = new Date().toISOString().split('T')[0];
    const movies = await fetchChunk(id);

    return movies.map(movie => ({
        url: `${SITE_URL}/watch/movie/${movie.id}`,
        lastModified: movie.release_date ? new Date(movie.release_date).toISOString().split('T')[0] : today,
        changeFrequency: 'weekly' as 'weekly',
        priority: 0.7,
    }));
}