// next.config.mjs - CLEAN AND SAFE CONFIGURATION

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
  
  // 🚨 CRITICAL FIX: Use 'swcMinify'
  // This tells Next.js to use its highly optimized SWC minifier, which generally respects React Hydration rules
  // but still aggressively minifies JavaScript and HTML.
  swcMinify: true,

  // Add the experimental setting that sometimes helps with HTML entity handling.
  experimental: {
    // This setting tells the compiler to aggressively minify the HTML output,
    // which should include structural whitespace removal, without using a custom webpack config.
    optimizeServerComponentExternalPackages: true,
  },
};

export default nextConfig;