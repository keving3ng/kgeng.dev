import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Kevin Geng - Full-stack Software Engineer',
  description:
    'Full-stack Software Engineer at Faire with 3+ years of experience building SaaS products. Expertise in React, Java, TypeScript, and AWS. Previously at Amazon and QuarkSys.',
  keywords: [
    'Kevin Geng',
    'Full-stack Software Engineer',
    'Faire',
    'Amazon',
    'QuarkSys',
    'RBC',
    'React',
    'Java',
    'TypeScript',
    'JavaScript',
    'AWS',
    'SaaS',
    'Toronto',
    'Carleton University',
    'Web Development',
  ],
  authors: [{ name: 'Kevin Geng' }],
  creator: 'Kevin Geng',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://kgeng.dev',
    title: 'Kevin Geng - Full-stack Software Engineer',
    description:
      'Full-stack Software Engineer at Faire with 3+ years of experience building SaaS products. Expertise in React, Java, TypeScript, and AWS.',
    siteName: 'Kevin Geng Portfolio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kevin Geng - Full-stack Software Engineer',
    description:
      'Full-stack Software Engineer at Faire with 3+ years of experience building SaaS products. Expertise in React, Java, TypeScript, and AWS.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}