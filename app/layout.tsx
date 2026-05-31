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
      <body>{children}</body>
    </html>
  );
}
