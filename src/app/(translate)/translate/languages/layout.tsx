import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Metadata.languageTranslator');

  return {
    title: t('title'),
    description: t('description'),
    keywords: t.raw('keywords') as string[],
    openGraph: {
      title: t('og.title'),
      description: t('og.description'),
      type: 'website',
      images: [
        {
          url: '/images/translator-og-image.png',
          width: 1200,
          height: 630,
          alt: t('og.title')
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: t('og.title'),
      description: t('og.description'),
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
}

export default function TranslateLayout({ children }: { readonly children: React.ReactNode }) {
  return <>{children}</>;
}
