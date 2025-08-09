'use client'; // This marks the component as a Client Component

import Link from 'next/link';
import React from 'react';

interface WatchNowButtonProps {
  id: number;
  mediaType: 'movie' | 'tv';
  // For TV shows, you would pass the specific season and episode
  // If not provided, the button might link to the TV show's main detail page
  season?: number;
  episode?: number;
}

const WatchNowButton: React.FC<WatchNowButtonProps> = ({ id, mediaType, season, episode }) => {
  let watchHref = '';
  let buttonText = 'Watch Now';

  if (mediaType === 'movie') {
    watchHref = `/watch/movie/${id}`;
    buttonText = 'Watch Now';
  } else if (mediaType === 'tv') {
    // For TV shows, we need season and episode.
    // If they are provided, construct the watch URL with season/episode.
    if (season && episode) {
      watchHref = `/watch/tv/${id}?season=${season}&episode=${episode}`;
      buttonText = `Watch S${season}E${episode}`;
    } else {
      // If season/episode are not provided for a TV show,
      // you might want to link back to the TV show's main detail page
      // so the user can select an episode.
      // Alternatively, you could disable the button or show an error.
      watchHref = `/tv/${id}`; // Link to TV show details for episode selection
      buttonText = 'Select Episode'; // Indicate user needs to select an episode
    }
  } else {
    // Fallback for unsupported media types (though types should prevent this)
    watchHref = '#';
    buttonText = 'Cannot Watch';
  }

  // Disable button if watchHref is '#' (indicating a non-watchable state or error)
  const isDisabled = watchHref === '#';

  return (
    <Link
      href={watchHref}
      // Disable the link if isDisabled is true
      aria-disabled={isDisabled}
      tabIndex={isDisabled ? -1 : undefined}
      className={`inline-flex items-center px-6 py-3 rounded-lg text-lg font-semibold shadow-md
        ${isDisabled
          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
          : 'bg-accentBlue hover:bg-accentPurple text-textLight transition-colors'
        }`}
    >
      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg>
      {buttonText}
    </Link>
  );
};

export default WatchNowButton;