import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Stream Wave',
  description: 'Your personal streaming guide.',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' }, // for SVG
      { url: '/icon.png', type: 'image/png' },   // for PNG
    ],
    shortcut: '/favicon.ico', // for older browsers
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}