// src/lib/tmdb-image-loader.js

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

// TMDB's supported image sizes.
// The `w` prefix stands for width.
const TMDB_SIZES = {
  backdrop: ['w300', 'w780', 'w1280', 'original'],
  poster: ['w92', 'w154', 'w185', 'w342', 'w500', 'w780', 'original'],
};

// This function determines the best size to request from TMDB.
const getTMDBSize = (imageType, width) => {
  const sizes = TMDB_SIZES[imageType];
  for (const size of sizes) {
    if (size === 'original') return 'original';
    const numSize = parseInt(size.substring(1), 10);
    if (width <= numSize) return size;
  }
  return 'original';
};

// The custom loader function for the Next.js `Image` component.
export default function tmdbImageLoader({ src, width, quality }) {
  // Determine if the image is a poster or backdrop based on the path.
  const imageType = src.includes('w') || src.includes('original') ? 'backdrop' : 'poster';
  
  // Get the most appropriate TMDB size for the requested width.
  const size = getTMDBSize(imageType, width);

  // Construct and return the full image URL.
  return `${TMDB_IMAGE_BASE_URL}${size}${src}`;
}