import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Smart AI Translator | Multi-Language Translation',
  description:
    'Powerful AI-powered translation tool supporting Japanese, English, and Vietnamese languages. Instant, accurate translations using ChatGPT technology.',
  keywords: [
    'AI translator',
    'language translation',
    'Japanese translation',
    'English translation',
    'Vietnamese translation',
    'ChatGPT translator'
  ],
  openGraph: {
    title: 'Smart AI Translator',
    description: 'Instant AI-powered translations across multiple languages',
    type: 'website',
    images: [
      {
        url: '/images/translator-og-image.png',
        width: 1200,
        height: 630,
        alt: 'Smart AI Translator'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Smart AI Translator',
    description: 'Instant AI-powered translations across multiple languages',
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
  }
};

export default function TranslateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
