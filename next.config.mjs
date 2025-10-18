// next.config.mjs - ABSOLUTELY MINIMAL AND SAFE CONFIGURATION

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your existing image configuration
  images: {
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
  
  // CRITICAL: Keep the native, stable SWC minifier
  swcMinify: true,

  // IMPORTANT: REMOVE ALL PROBLEMATIC EXPERIMENTAL KEYS
  // No 'experimental' object is included here.

  // Remove the custom webpack function
  webpack: (config, { isServer, dev }) => {
    return config;
  },
};

export default nextConfig;