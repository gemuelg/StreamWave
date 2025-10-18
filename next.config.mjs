// next.config.mjs

// 🚨 CRITICAL FIX: Use 'import' instead of 'require' for ES Module compatibility
import HtmlMinifierPlugin from 'html-minifier-webpack-plugin';

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

  // CRITICAL FIX: Add a custom Webpack configuration function
  webpack: (config, { isServer, dev }) => {
    // We only apply this aggressive minification in production builds (not server/dev)
    if (!isServer && !dev) {
      config.optimization.minimize = true;

      if (!config.optimization.minimizer) {
        config.optimization.minimizer = [];
      }

      config.optimization.minimizer.push(
        // Use the imported plugin
        new HtmlMinifierPlugin({
          // These options aggressively remove whitespace and comments
          removeComments: true,
          collapseWhitespace: true, 
          removeAttributeQuotes: true,
          removeRedundantAttributes: true,
          minifyCSS: true,
          minifyJS: true,
        })
      );
    }
    return config;
  },
};

// Use the ES Module 'export default' syntax
export default nextConfig;