import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Code Translator | Cross-Language Code Translation',
  description:
    'Powerful AI-driven code translation tool. Convert code between multiple programming languages and natural language with ease and accuracy.',
  keywords: [
    'AI code translator',
    'programming language translation',
    'code conversion',
    'AI programming assistant',
    'multilingual code translation',
    'natural language to code',
    'code to natural language'
  ],
  openGraph: {
    title: 'AI Code Translator',
    description: 'Seamless code translation across programming languages',
    type: 'website',
    images: [
      {
        url: '/images/code-translator-og-image.png', // Replace with your actual OG image path
        width: 1200,
        height: 630,
        alt: 'AI Code Translator'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Code Translator',
    description: 'Seamless code translation across programming languages',
    images: ['/images/code-translator-og-image.png'] // Replace with your actual Twitter card image
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

export default function CodeTranslateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
