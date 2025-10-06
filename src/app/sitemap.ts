// src/app/sitemap.ts (Updated with /home URL)

import { MetadataRoute } from 'next';

const SITE_URL = 'https://streamwave.xyz'; 
const today = new Date().toISOString().split('T')[0];

// **FIXED: Removed the '.xml' extension from the URLs**
const totalMovieSitemaps = 5; // Use the scaled value from the last fix
const movieSitemapUrls = Array.from({ length: totalMovieSitemaps }, (_, i) => ({
    url: `${SITE_URL}/sitemap-movies/${i + 1}`,
}));

const totalTvSitemaps = 5; // Use the scaled value from the last fix
const tvSitemapUrls = Array.from({ length: totalTvSitemaps }, (_, i) => ({
    url: `${SITE_URL}/sitemap-tv/${i + 1}`,
}));

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        { url: SITE_URL, lastModified: today, priority: 1.0, changeFrequency: 'daily' },
        // NEW: Add the /home URL to the sitemap
        { 
            url: `${SITE_URL}/home`, 
            lastModified: today, 
            priority: 0.9, 
            changeFrequency: 'daily' 
        },
        ...movieSitemapUrls,
        ...tvSitemapUrls,
    ];
}