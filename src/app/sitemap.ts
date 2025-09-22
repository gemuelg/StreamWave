import { MetadataRoute } from 'next';
import axios from 'axios';

// Define the shape of the data we're fetching from the TMDB API
interface TMDBMedia {
    id: number;
    release_date?: string;
    first_air_date?: string;
}

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

// Function to fetch recent movies
async function getRecentMovies(): Promise<TMDBMedia[]> {
    try {
        const response = await axios.get(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`);
        return response.data.results;
    } catch (error) {
        console.error("Failed to fetch movies for sitemap:", error);
        return [];
    }
}

// Function to fetch recent TV shows
async function getRecentTvShows(): Promise<TMDBMedia[]> {
    try {
        const response = await axios.get(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}`);
        return response.data.results;
    } catch (error) {
        console.error("Failed to fetch TV shows for sitemap:", error);
        return [];
    }
}

// The main sitemap function that Next.js will use
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const today = new Date().toISOString().split('T')[0];

    // Fetch the dynamic content
    const movies = await getRecentMovies();
    const tvShows = await getRecentTvShows();

    // Map the movies to sitemap URL objects
    const movieUrls = movies.map(movie => ({
        url: `https://streamwave.xyz/watch/movie/${movie.id}`,
        lastModified: movie.release_date || today,
        changeFrequency: 'weekly' as 'weekly',
        priority: 0.7,
    }));

    // Map the TV shows to sitemap URL objects
    const tvShowUrls = tvShows.map(tvShow => ({
        url: `https://streamwave.xyz/watch/tv/${tvShow.id}`,
        lastModified: tvShow.first_air_date || today,
        changeFrequency: 'weekly' as 'weekly',
        priority: 0.7,
    }));

    // Define the static routes
    const staticRoutes = [
        {
            url: 'https://streamwave.xyz/',
            lastModified: today,
            changeFrequency: 'daily' as 'daily',
            priority: 1.0,
        },
        {
            url: 'https://streamwave.xyz/onboarding/step1',
            lastModified: today,
            changeFrequency: 'monthly' as 'monthly',
            priority: 0.5,
        },
        // You can add other static routes here
    ];

    // Combine all URLs into a single array
    return [...staticRoutes, ...movieUrls, ...tvShowUrls];
}