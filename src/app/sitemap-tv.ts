import { MetadataRoute } from 'next';
import axios from 'axios';

const SITE_URL = 'https://streamwave.xyz'; 
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY; // Keep your key definition consistent
const BASE_URL = 'https://api.themoviedb.org/3';
const MAX_PAGES_TO_FETCH = 100; // Same limit as before

async function fetchMedia(): Promise<any[]> {
    // ... (Your loop for /discover/tv with pagination)
    if (!API_KEY) { /* ... */ return []; }
    let allMedia: any[] = [];
    for (let page = 1; page <= MAX_PAGES_TO_FETCH; page++) {
        try {
            const url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&page=${page}&sort_by=popularity.desc`;
            const response = await axios.get(url);
            allMedia = allMedia.concat(response.data.results);
            if (page >= response.data.total_pages || page === MAX_PAGES_TO_FETCH) break;
        } catch (error) {
            console.error(`Failed to fetch tv page ${page} for sitemap:`, error);
            break; 
        }
    }
    return allMedia;
}
// --------------------------------------------------------------------------

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const today = new Date().toISOString().split('T')[0];
    const tvShows = await fetchMedia(); // Only fetching TV shows now

    return tvShows.map(tvShow => ({
        url: `${SITE_URL}/watch/tv/${tvShow.id}`,
        lastModified: tvShow.first_air_date ? new Date(tvShow.first_air_date).toISOString().split('T')[0] : today,
        changeFrequency: 'weekly' as 'weekly',
        priority: 0.7,
    }));
}