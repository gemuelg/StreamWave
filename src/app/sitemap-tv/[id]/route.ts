// src/app/sitemap-tv/[id]/route.ts (Final Fix for 404/Routing Issue)

import { NextResponse } from 'next/server';
import axios from 'axios';
import { MetadataRoute } from 'next'; // Used for type definitions

// --- Configuration ---
const SITE_URL = 'https://streamwave.xyz'; 
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY; // Use your environment variable
const BASE_URL = 'https://api.themoviedb.org/3';
const CHUNK_SIZE = 10;   
const MAX_PAGES = 100;  
const NUM_CHUNKS = Math.ceil(MAX_PAGES / CHUNK_SIZE);

// Note: If you already moved this function to a shared utility file (recommended), 
// you would import it instead of having it here.

// --- 1. Fetch Logic (Parallel Fetching to prevent timeouts) ---
async function fetchChunk(chunkId: number): Promise<any[]> {
    if (!API_KEY) return [];
    
    const mediaType = 'tv';
    const startPage = (chunkId - 1) * CHUNK_SIZE + 1;
    const endPage = Math.min(chunkId * CHUNK_SIZE, MAX_PAGES); 
    
    const fetchPromises = [];
    for (let page = startPage; page <= endPage; page++) {
        const url = `${BASE_URL}/discover/${mediaType}?api_key=${API_KEY}&page=${page}&sort_by=popularity.desc`;
        
        // Push the PROMISE for the API call (running in parallel)
        fetchPromises.push(axios.get(url).catch(e => {
            console.error(`[SITEMAP] Failed to fetch TV page ${page} in chunk ${chunkId}:`, e.message);
            return null; // Return null on error
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

// --- 2. Manual XML Generator ---
// Route Handlers require manual XML string construction
function generateTvXml(urls: MetadataRoute.Sitemap): string {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.map(url => `
    <url>
      <loc>${url.url}</loc>
      <lastmod>${url.lastModified}</lastmod>
      <changefreq>${url.changeFrequency}</changefreq>
      <priority>${url.priority}</priority>
    </url>
  `).join('')}
</urlset>`;
  return xml;
}

// --- 3. Route Handler Export (The function Next.js will execute) ---
export async function GET(request: Request, { params }: { params: { id: string } }) {
    const today = new Date().toISOString().split('T')[0];
    const chunkId = parseInt(params.id, 10);

    // Validate the ID from the URL path (e.g., '1')
    if (isNaN(chunkId) || chunkId < 1 || chunkId > NUM_CHUNKS) {
        // This handles requests like /sitemap-tv/11.xml or /sitemap-tv/invalid
        return new NextResponse("Not Found", { status: 404 });
    }

    const tvShows = await fetchChunk(chunkId);

    // Map the TV show data to the standard sitemap URL format
    const sitemapUrls: MetadataRoute.Sitemap = tvShows.map(tvShow => ({
        url: `${SITE_URL}/watch/tv/${tvShow.id}`,
        lastModified: tvShow.first_air_date ? new Date(tvShow.first_air_date).toISOString().split('T')[0] : today,
        changeFrequency: 'weekly' as 'weekly',
        priority: 0.7,
    }));
    
    const xmlContent = generateTvXml(sitemapUrls);

    // Return the response with the correct XML header for Googlebot
    return new NextResponse(xmlContent, {
        status: 200,
        headers: {
            'Content-Type': 'application/xml',
        },
    });
}

// Ensure the function runs on every request (dynamic)
export const dynamic = 'force-dynamic';