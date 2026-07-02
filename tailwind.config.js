/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        // Keeping your custom tablet breakpoint intact
        'tablet': '790px',
      },
      colors: {
        // --- NETFLIX CINEMATIC DARK SCHEME ---
        primaryBg: '#040406',         // Standard Netflix app browsing canvas black
        secondaryBg: '#181818',       // Premium slate charcoal for overlay panels & cards
        secondaryBgDark: '#000000',   // Pure pitch black for heavy footers & backdrops
        
        // --- CRISP HIGH-CONTRAST TYPOGRAPHY ---
        textLight: '#FFFFFF',         // Pure clinical white for crystal clear readability
        textMuted: '#A3A3A3',         // Medium neutral grey for metadata grids & descriptions
        
        // --- BRAND RE-MAPPING (Cyber-Neon replaced with Crimson Premium) ---
        accent: '#E50914',            // Iconic Netflix Crimson Red for primary states
        accentDark: '#B80710',        // Darkened luxury maroon for hover states
        accentRed: '#E50914',         // Uniform brand red for trending/hot badge elements
        
        // --- NEUTRAL SHIFT ARRAYS (Replaces Cyans/Purples with Premium Grays/Whites) ---
        accentBlue: '#FFFFFF',        // Maps secondary highlights to crisp high-contrast white
        accentPurple: '#333333',      // Maps secondary accents to subtle structural container gray
        
        darkOverlay: 'rgba(20, 20, 20, 0.9)', // High-density overlay matching the dark canvas
        
        // Explicit utility aliases for new code development
        netflixRed: '#E50914',
        netflixCharcoal: '#181818',
        netflixBlack: '#141414',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        
        // Netflix signature billboard gradient overlay (dark edge fade system)
        'hero-gradient': 'linear-gradient(to top, #141414 0%, rgba(20, 20, 20, 0.1) 60%, rgba(20, 20, 20, 0.7) 100%)',
        'netflix-vignette': 'linear-gradient(to right, #141414 0%, rgba(20, 20, 20, 0.4) 40%, transparent 100%)',
      },
      boxShadow: {
        // Removed distracting bright neon system glows in favor of soft cinematic dimensional framing
        'card-hover': '0 12px 28px -4px rgba(0, 0, 0, 0.62), 0 4px 12px -2px rgba(0, 0, 0, 0.45)',
        'netflix-popup': '0 0 24px 4px rgba(0, 0, 0, 0.8)',
      },
      transitionProperty: {
        // High-performance transforms tuned for smooth card previews
        'card': 'transform, box-shadow, filter, background-color',
      },
    },
  },
  plugins: [],
}