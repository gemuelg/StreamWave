// src/app/api/tmdb/[...slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  
  // 1. Grab all the query parameters the client page sent (e.g., page, append_to_response)
  const searchParams = request.nextUrl.searchParams;
  
  // 2. Secretly inject your private server-side API key out of sight from the browser
  searchParams.set('api_key', process.env.TMDB_API_KEY || '');
  
  // 3. Reconstruct the exact path the client wanted to hit
  const path = slug.join('/');
  const targetUrl = `https://api.themoviedb.org/3/${path}?${searchParams.toString()}`;

  try {
    const response = await fetch(targetUrl, {
      headers: {
        // Secretly inject the secure bearer token if the endpoint requires it
        ...(process.env.TMDB_ACCESS_TOKEN && {
          Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
        }),
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `TMDB responded with status ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Universal Proxy Error:", error);
    return NextResponse.json({ error: 'Internal secure proxy error' }, { status: 500 });
  }
}