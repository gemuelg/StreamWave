import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Stream Wave',
  description: 'Your personal streaming guide.',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon.png', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
};

export default function MoviesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // This div will be placed inside the main <body> from app/layout.tsx
    // It correctly wraps the child components without re-rendering the body tag.
    <div>{children}</div>
  );
}