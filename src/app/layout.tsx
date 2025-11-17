import { GoogleAnalytics } from '@next/third-parties/google';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import LayoutClient from './layoutClient';
import { WebVitals } from '../components/WebVitals';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
  preload: true
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
  preload: true
});

export const metadata: Metadata = {
  title: {
    default: 'AI QUICK | AI Code & Language Translator',
    template: '%s | AI QUICK'
  },
  description:
    'Powerful AI-powered code and language translation tool. Translate code between programming languages, translate text between languages, enhance prompts, generate data, and chat with PDFs using OpenAI and Google AI.',
  keywords: [
    'AI translation',
    'code translator',
    'language translator',
    'OpenAI',
    'Google AI',
    'PDF chat',
    'prompt enhancement'
  ],
  authors: [{ name: 'AI QUICK' }],
  creator: 'AI QUICK',
  publisher: 'AI QUICK',
  metadataBase: new URL('https://aiquick.help'),
  openGraph: {
    title: 'AI QUICK | AI Code & Language Translator',
    description: 'Powerful AI-powered code and language translation tool with PDF chat capabilities',
    url: 'https://aiquick.help',
    siteName: 'AI QUICK',
    images: [
      {
        url: '/images/translator-og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI QUICK - AI Translation Tool'
      }
    ],
    locale: 'en_US',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI QUICK | AI Code & Language Translator',
    description: 'Powerful AI-powered code and language translation tool',
    images: ['/images/translator-og-image.png']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <WebVitals />
        <LayoutClient>{children}</LayoutClient>
      </body>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_ANALYTICS_ID || ''} />
    </html>
  );
}
