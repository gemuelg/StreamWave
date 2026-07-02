// src/app/sitemap-tv/[id]/route.ts

import { NextResponse } from 'next/server';
import axios from 'axios';
import { MetadataRoute } from 'next'; 

// --- Configuration (Scaled for 1M+ URL Goal) ---
// ENHANCEMENT: Inherit your dynamic workspace environment configuration
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://streamwave.xyz';
const API_KEY = process.env.TMDB_API_KEY; 
const BASE_URL = 'https://api.themoviedb.org/3';

// **SCALED CONSTANTS**
const TMDB_RESULTS_PER_PAGE = 20;
const PAGES_PER_CHUNK = 2000; 
const MAX_PAGES = 50000; // Total TV pages to index
const NUM_CHUNKS = Math.ceil(MAX_PAGES / PAGES_PER_CHUNK); // 50,000 / 2,000 = 25 chunks

// --- 1. TV Fetch Logic ---
async function fetchChunk(chunkId: number): Promise<any[]> {
    if (!API_KEY) return [];
    
    // CRITICAL FIX: Shift target from 'movie' to 'tv'
    const mediaType = 'tv';
    const startPage = (chunkId - 1) * PAGES_PER_CHUNK + 1;
    const endPage = Math.min(chunkId * PAGES_PER_CHUNK, MAX_PAGES); 
    
    const fetchPromises = [];
    for (let page = startPage; page <= endPage; page++) {
        const url = `${BASE_URL}/discover/${mediaType}?api_key=${API_KEY}&page=${page}&sort_by=popularity.desc`;
        
        // Push the PROMISE for the API call (running in parallel)
        fetchPromises.push(axios.get(url).catch(e => {
            console.error(`[SITEMAP] Failed to fetch TV page ${page} in chunk ${chunkId}:`, e.message);
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

// --- 2. Manual XML Generator (Maintained for Whitespace Protection) ---
function generateTvXml(urls: MetadataRoute.Sitemap): string {
  const urlEntries = urls.map(url => 
    `<url><loc>${url.url}</loc><lastmod>${url.lastModified}</lastmod><changefreq>${url.changeFrequency}</changefreq><priority>${url.priority}</priority></url>`
  ).join('');

  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlEntries}</urlset>`;
}

// Define the incoming parameters interface as an asynchronous Promise
interface RouteProps {
  params: Promise<{ id: string }>;
}

// --- 3. Route Handler Export ---
export async function GET(request: Request, { params }: RouteProps) {
    const today = new Date().toISOString().split('T')[0];
    
    // 1. Await parameters asynchronously to satisfy modern Next.js engine specifications
    const resolvedParams = await params;
    const chunkId = parseInt(resolvedParams.id, 10);
    
    // 2. Validate the chunk ID boundary conditions
    if (isNaN(chunkId) || chunkId < 1 || chunkId > NUM_CHUNKS) {
        return new NextResponse("Not Found", { status: 404 });
    }

    const tvShows = await fetchChunk(chunkId);

    // 3. Map TV series details array into standard XML sitemap format
    const sitemapUrls: MetadataRoute.Sitemap = tvShows.map(tv => ({
        // CRITICAL FIX: Route points to /watch/tv/ and maps first_air_date instead of release_date
        url: `${SITE_URL}/watch/tv/${tv.id}`,
        lastModified: tv.first_air_date ? new Date(tv.first_air_date).toISOString().split('T')[0] : today,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));
    
    const xmlContent = generateTvXml(sitemapUrls);

    // 4. Dispatch the clean XML payload stream back to the browser or web crawler
    return new NextResponse(xmlContent, {
        status: 200,
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=86400, must-revalidate',
        },
    });
}

// Ensure the function bypasses static compilation caches
export const dynamic = 'force-dynamic';