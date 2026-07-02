// src/app/sitemap.xml/route.ts

import { NextResponse } from 'next/server';

// --- Configuration ---
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://streamwave.xyz';

// Align these targets perfectly with your scaled chunk configurations
const MOVIE_CHUNKS = 25; 
const TV_CHUNKS = 25;

export async function GET() {
  const today = new Date().toISOString().split('T')[0];
  let sitemapEntries = '';

  // 1. Append the 25 distinct movie sitemap chunk paths
  for (let i = 1; i <= MOVIE_CHUNKS; i++) {
    sitemapEntries += `<sitemap><loc>${SITE_URL}/sitemap-movies/${i}</loc><lastmod>${today}</lastmod></sitemap>`;
  }

  // 2. Append the 25 distinct television sitemap chunk paths
  for (let i = 1; i <= TV_CHUNKS; i++) {
    sitemapEntries += `<sitemap><loc>${SITE_URL}/sitemap-tv/${i}</loc><lastmod>${today}</lastmod></sitemap>`;
  }

  // 3. Wrap all references inside a formal, compliant XML sitemap index tag structure
  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapEntries}</sitemapindex>`;

  // 4. Return the comprehensive payload with proper indexing headers
  return new NextResponse(xmlContent, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, must-revalidate',
    },
  });
}

// Ensure the engine rebuilds the tracking map dynamically on demand
export const dynamic = 'force-dynamic';