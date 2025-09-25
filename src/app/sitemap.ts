// src/app/sitemap.ts (Sitemap Index File)

import { MetadataRoute } from 'next';

const SITE_URL = 'https://streamwave.xyz'; 
const today = new Date().toISOString().split('T')[0];

// You now need to point to the dynamic paths Next.js creates:
// /sitemap-movies/1.xml, /sitemap-movies/2.xml, etc.
const totalMovieSitemaps = 10; // Must match the NUM_CHUNKS from sitemap-movies.ts
const movieSitemapUrls = Array.from({ length: totalMovieSitemaps }, (_, i) => ({
    url: `${SITE_URL}/sitemap-movies/${i + 1}.xml`,
}));

// Do the same for TV shows (assuming you implement sitemap-tv.ts with the same logic)
const totalTvSitemaps = 10;
const tvSitemapUrls = Array.from({ length: totalTvSitemaps }, (_, i) => ({
    url: `${SITE_URL}/sitemap-tv/${i + 1}.xml`,
}));

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        { url: SITE_URL, lastModified: today, priority: 1.0, changeFrequency: 'daily' },
        ...movieSitemapUrls,
        ...tvSitemapUrls,
    ];
}