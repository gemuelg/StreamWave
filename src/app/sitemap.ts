// src/app/sitemap.ts (Sitemap Index File)

import { MetadataRoute } from 'next';
// No more axios or fetching logic here! It must be lean and fast.

const SITE_URL = 'https://streamwave.xyz'; 
const today = new Date().toISOString().split('T')[0];

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        // 1. Static Pages
        { 
            url: SITE_URL, 
            lastModified: today, 
            priority: 1.0, 
            changeFrequency: 'daily' 
        },

        // 2. Points to the two new sub-sitemaps
        { url: `${SITE_URL}/sitemap-movies.xml` },
        { url: `${SITE_URL}/sitemap-tv.xml` },
    ];
}