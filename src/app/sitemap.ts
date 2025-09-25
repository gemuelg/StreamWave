// src/app/sitemap.ts

import { MetadataRoute } from 'next';
import axios from 'axios';

// --- Configuration ---
// 🚨 IMPORTANT: Use your final, canonical domain or a Vercel variable fallback
const SITE_URL = 'https://streamwave.xyz'; 

// Use the private environment variable for server-side fetches
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY; 
const BASE_URL = 'https://api.themoviedb.org/3';
// 🚨 Adjust this to list all pages you need indexed. 100 pages = ~2000 URLs. 
// Go higher if your site is large.
const MAX_PAGES_TO_FETCH = 100; 

interface TMDBMedia {
    id: number;
    media_type: 'movie' | 'tv';
    release_date?: string;
    first_air_date?: string;
}

// Function to fetch a large list of content using pagination
async function fetchMedia(type: 'movie' | 'tv'): Promise<TMDBMedia[]> {
    if (!API_KEY) {
        console.error("TMDB_API_KEY not found. Skipping sitemap generation.");
        return [];
    }
    let allMedia: TMDBMedia[] = [];

    for (let page = 1; page <= MAX_PAGES_TO_FETCH; page++) {
        try {
            // Using /discover instead of /trending for a massive list
            const url = `${BASE_URL}/discover/${type}?api_key=${API_KEY}&page=${page}&sort_by=popularity.desc`;
            const response = await axios.get(url);
            
            const results = response.data.results.map((item: any) => ({
                ...item,
                media_type: type, // Add media_type for later path construction
            }));
            
            allMedia = allMedia.concat(results);

            // Break if the API reports no more pages or we hit our limit
            if (page >= response.data.total_pages || page === MAX_PAGES_TO_FETCH) break;

        } catch (error) {
            console.error(`Failed to fetch ${type} page ${page} for sitemap:`, error);
            break; 
        }
    }
    return allMedia;
}


export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const today = new Date().toISOString().split('T')[0];

    const [movies, tvShows] = await Promise.all([
        fetchMedia('movie'),
        fetchMedia('tv')
    ]);

    const dynamicUrls = [...movies, ...tvShows].map(item => {
        const typePath = item.media_type === 'movie' ? 'movie' : 'tv';
        const date = item.media_type === 'movie' ? item.release_date : item.first_air_date;

        return {
            // Your URL structure: /watch/movie/ID or /watch/tv/ID
            url: `${SITE_URL}/watch/${typePath}/${item.id}`, 
            lastModified: date ? new Date(date).toISOString().split('T')[0] : today,
            changeFrequency: 'weekly' as 'weekly',
            priority: 0.7,
        };
    });

    // Define the essential, public, indexable static routes
    const staticRoutes = [
        {
            url: `${SITE_URL}/`,
            lastModified: today,
            changeFrequency: 'daily' as 'daily',
            priority: 1.0,
        },
        // Add other key hub pages you want indexed (e.g., /movies, /tv, /genres)
    ];

    // Combine and return
    return [...staticRoutes, ...dynamicUrls];
}