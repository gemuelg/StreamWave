// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primaryBg: '#0F172A',
        secondaryBg: '#1A202C',
        secondaryBgDark: '#111827', // New darker version for hover state
        textLight: '#E2E8F0',
        textMuted: '#94A3B8',
        accent: '#3B82F6', // Using your accentBlue as the main accent color
        accentDark: '#2563EB', // New darker version for hover state
        accentBlue: '#3B82F6',
        accentPurple: '#8B5CF6',
        accentRed: '#EF4444',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}