// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, // THIS KILLS THE VERCEL INVOCATION SPIKE
    loader: 'custom',
    loaderFile: './src/lib/tmdb-image-loader.js',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        port: '',
        pathname: '/t/p/**',
      },
    ],
  },
  swcMinify: true,
};

export default nextConfig;