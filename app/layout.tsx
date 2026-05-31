import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kumaraswamy G — AI/ML Engineer & Backend Developer',
  description: 'Portfolio of Kumaraswamy G — M.Tech CSE student at VIT Chennai. Backend systems, Generative AI, and data-driven products.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,300;1,400&family=DM+Mono:wght@300;400;500&family=Outfit:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
