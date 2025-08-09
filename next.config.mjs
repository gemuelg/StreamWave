/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        port: '',
        pathname: '/t/p/**',
      },
    ],
  },
  
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline';
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
              img-src 'self' https://image.tmdb.org blob: data:;
              font-src 'self' https://fonts.gstatic.com data:;
              connect-src 'self' https://api.themoviedb.org;
              frame-src 'self' https://hnembed.cc https://multiembed.mov; // UPDATED
              media-src 'self' https://hnembed.cc https://multiembed.mov; // UPDATED
            `.replace(/\n/g, ''),
          },
        ],
      },
    ];
  },
};
 
export default nextConfig;