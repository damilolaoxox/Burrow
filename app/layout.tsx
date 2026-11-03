import type { Metadata } from 'next';
import './globals.css';
import { BURROW_CONFIG } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Burrow - Dig Through the Mines | 2,500 Workers Free Mint',
  description:
    'Underground Hill Climb driving game with 2,500 pixel miner NFTs and a free mint on Robinhood Chain. Join the waitlist to secure your allowlist spot.',
  keywords: [
    'Burrow',
    'Robinhood Chain',
    'Free Mint',
    'Pixel Art',
    'NFT',
    'Driving Game',
    'Allowlist',
    'EVM',
  ],
  authors: [{ name: 'Burrow Mines' }],
  openGraph: {
    title: 'Burrow - 2,500 Workers. Free Mint on Robinhood Chain.',
    description:
      'Dig through the mines. Underground Hill Climb driving game with 2,500 pixel miner NFTs. Join the waitlist for guaranteed allowlist spots.',
    type: 'website',
    url: 'https://burrow.xyz',
    siteName: 'Burrow',
    images: [
      {
        url: 'https://burrow.xyz/og-banner.png',
        width: 1200,
        height: 630,
        alt: 'Burrow - 2,500 Workers Free Mint on Robinhood Chain',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Burrow - 2,500 Workers. Free Mint on Robinhood Chain.',
    description: 'Dig through the mines. Free mint allowlist now open.',
    creator: '@burrowRH',
    images: ['https://burrow.xyz/og-banner.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⛏️</text></svg>" />
      </head>
      <body className="min-h-screen flex flex-col bg-burrow-darkest text-burrow-cream antialiased selection:bg-amber-400 selection:text-black">
        {children}
      </body>
    </html>
  );
}
