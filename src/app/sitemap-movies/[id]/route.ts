// src/app/sitemap-movies/[id]/route.ts

import { NextResponse } from 'next/server';
import axios from 'axios';
import { MetadataRoute } from 'next'; 

// --- Configuration (Scaled for 1M+ URL Goal) ---
const SITE_URL = 'https://streamwave.xyz';
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY; 
const BASE_URL = 'https://api.themoviedb.org/3';

// **SCALED CONSTANTS**
// TMDB usually returns 20 results per page.
const TMDB_RESULTS_PER_PAGE = 20;

// Aim for 40,000 URLs per segment (well under the 50k limit).
// 40,000 URLs / 20 results per page = 2,000 pages per chunk.
const PAGES_PER_CHUNK = 2000; 

// If we aim for 1,000,000 movies, we need 50,000 API pages total (1,000,000 / 20).
const MAX_PAGES = 50000; // Total pages to index (50k * 20 results = 1M movies)

const NUM_CHUNKS = Math.ceil(MAX_PAGES / PAGES_PER_CHUNK); // 50,000 / 2,000 = 25 chunks

// --- 1. Fetch Logic (Updated to use scaled constants) ---
async function fetchChunk(chunkId: number): Promise<any[]> {
    if (!API_KEY) return [];
    
    const mediaType = 'movie';
    // Use the scaled PAGES_PER_CHUNK
    const startPage = (chunkId - 1) * PAGES_PER_CHUNK + 1;
    const endPage = Math.min(chunkId * PAGES_PER_CHUNK, MAX_PAGES); 
    
    const fetchPromises = [];
    for (let page = startPage; page <= endPage; page++) {
        const url = `${BASE_URL}/discover/${mediaType}?api_key=${API_KEY}&page=${page}&sort_by=popularity.desc`;
        
        // Push the PROMISE for the API call (running in parallel)
        fetchPromises.push(axios.get(url).catch(e => {
            console.error(`[SITEMAP] Failed to fetch movie page ${page} in chunk ${chunkId}:`, e.message);
            return null; 
        }));
    }
    
    const responses = await Promise.all(fetchPromises);
    
    let allMedia: any[] = [];
    responses.forEach(response => {
        if (response && response.data && response.data.results) {
            allMedia = allMedia.concat(response.data.results);
        }
    });

    return allMedia;
}

// --- 2. Manual XML Generator (FIXED for Whitespace/Corruption) ---
function generateMovieXml(urls: MetadataRoute.Sitemap): string {
  // CRITICAL FIX: Generate the XML tags on a single line to prevent whitespace
  // from breaking the parser.
  const urlEntries = urls.map(url => 
    `<url><loc>${url.url}</loc><lastmod>${url.lastModified}</lastmod><changefreq>${url.changeFrequency}</changefreq><priority>${url.priority}</priority></url>`
  ).join('');

  // Combine everything into a single, compact string
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlEntries}</urlset>`;
  
  return xml;
}

// --- 3. Route Handler Export (The function Next.js will execute) ---
export async function GET(request: Request, { params }: { params: { id: string } }) {
    const today = new Date().toISOString().split('T')[0];
    const chunkId = parseInt(params.id, 10);
    // Use the calculated NUM_CHUNKS
    
    // Validate the ID from the URL path (e.g., '1')
    if (isNaN(chunkId) || chunkId < 1 || chunkId > NUM_CHUNKS) {
        return new NextResponse("Not Found", { status: 404 });
    }

    const movies = await fetchChunk(chunkId);

    // Map the movie data to the standard sitemap URL format
    const sitemapUrls: MetadataRoute.Sitemap = movies.map(movie => ({
        url: `${SITE_URL}/watch/movie/${movie.id}`,
        lastModified: movie.release_date ? new Date(movie.release_date).toISOString().split('T')[0] : today,
        changeFrequency: 'weekly' as 'weekly',
        priority: 0.7,
    }));
    
    const xmlContent = generateMovieXml(sitemapUrls);

    // Return the response with the correct XML header and cache control
    return new NextResponse(xmlContent, {
        status: 200,
        headers: {
            'Content-Type': 'application/xml',
            // Add cache control to reduce build/request frequency
            'Cache-Control': 'public, max-age=86400, must-revalidate',
        },
    });
}

// Ensure the function runs on every request (dynamic)
export const dynamic = 'force-dynamic';