// src/app/sitemap-movies.ts (Dynamic Sitemap for Movies)

import { MetadataRoute } from 'next';
import axios from 'axios';

const SITE_URL = 'https://streamwave.xyz'; 
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY; // Keep your key definition consistent
const BASE_URL = 'https://api.themoviedb.org/3';
const MAX_PAGES_TO_FETCH = 100; // Same limit as before

// Interface and fetchMedia function (only for 'movie') 
// *** COPY YOUR FETCHMEDIA LOGIC HERE, BUT REMOVE THE 'TV' PARAMETER/LOGIC ***
async function fetchMedia(): Promise<any[]> {
    // ... (Your loop for /discover/movie with pagination)
    if (!API_KEY) { /* ... */ return []; }
    let allMedia: any[] = [];
    for (let page = 1; page <= MAX_PAGES_TO_FETCH; page++) {
        try {
            const url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&page=${page}&sort_by=popularity.desc`;
            const response = await axios.get(url);
            allMedia = allMedia.concat(response.data.results);
            if (page >= response.data.total_pages || page === MAX_PAGES_TO_FETCH) break;
        } catch (error) {
            console.error(`Failed to fetch movie page ${page} for sitemap:`, error);
            break; 
        }
    }
    return allMedia;
}
// --------------------------------------------------------------------------

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const today = new Date().toISOString().split('T')[0];
    const movies = await fetchMedia(); // Only fetching movies now

    return movies.map(movie => ({
        url: `${SITE_URL}/watch/movie/${movie.id}`,
        lastModified: movie.release_date ? new Date(movie.release_date).toISOString().split('T')[0] : today,
        changeFrequency: 'weekly' as 'weekly',
        priority: 0.7,
    }));
}