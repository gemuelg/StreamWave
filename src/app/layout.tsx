import type { Metadata } from "next";
import "./globals.css";



export const metadata: Metadata = {
  title: "Stream Wave", // Change this
  description: "Your ultimate free movie and TV show streaming destination.", // Change this
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
