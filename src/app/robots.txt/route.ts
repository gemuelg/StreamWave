// src/app/robots.txt/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  // Define your raw text rules exactly how search engine bots need to read them
  const robotsTxtContent = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /_next/

Sitemap: https://streamwave.xyz/sitemap.xml`;

  // Return the raw text payload with an explicit plain-text header definition
  return new NextResponse(robotsTxtContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, must-revalidate',
    },
  });
}

// Force the engine to build this route dynamically on demand
export const dynamic = 'force-dynamic';