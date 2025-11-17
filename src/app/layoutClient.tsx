/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { AbstractIntlMessages } from 'next-intl';
import { ThemeProvider } from 'next-themes';
import dynamic from 'next/dynamic';
import { PropsWithChildren, Suspense, useEffect, useState } from 'react';
import { getUserLocale, loadLocaleMessages, setClientLocale } from '../service/clientLocale';
import { useCostAnalyticsInit } from '../hooks/useCostAnalyticsInit';

// Dynamic imports for better code splitting
const NextIntlClientProvider = dynamic(() => import('next-intl').then((mod) => mod.NextIntlClientProvider), {
  ssr: false
});

const Toaster = dynamic(() => import('sonner').then((mod) => mod.Toaster), {
  ssr: false
});

const AppHeader = dynamic(() => import('../components/AppHeader').then((mod) => mod.AppHeader), {
  ssr: false,
  loading: () => <div className="h-14 border-b" />
});

const AppSidebar = dynamic(() => import('../components/AppSidebar'), {
  ssr: false,
  loading: () => <div className="w-64 border-r" />
});

const SidebarProvider = dynamic(() => import('../components/ui/sidebar').then((mod) => mod.SidebarProvider), {
  ssr: false
});

const SidebarInset = dynamic(() => import('../components/ui/sidebar').then((mod) => mod.SidebarInset), {
  ssr: false
});

export default function LayoutClient({ children }: PropsWithChildren) {
  const [messages, setMessages] = useState<AbstractIntlMessages>({});
  const [locale, setLocale] = useState('en'); // Default locale initially
  const [loading, setLoading] = useState(true);

  // Initialize cost analytics system
  useCostAnalyticsInit();

  // Initialize the client locale system
  useEffect(() => {
    const initClientLocale = async () => {
      try {
        // Always use client locale
        const clientLocale = getUserLocale();
        const clientMessages = await loadLocaleMessages(clientLocale);

        setLocale(clientLocale);
        setMessages(clientMessages);
        setClientLocale(clientLocale);

        // Update html lang attribute
        document.documentElement.lang = clientLocale;
      } catch (error) {
        console.error('Failed to initialize locale:', error);
      } finally {
        setLoading(false);
      }
    };

    initClientLocale();
  }, []);

  // Function to change locale client-side
  const changeLocale = async (newLocale: string) => {
    try {
      setLoading(true);
      const newMessages = await loadLocaleMessages(newLocale);
      setLocale(newLocale);
      setMessages(newMessages);
      setClientLocale(newLocale);

      // Update html lang attribute
      document.documentElement.lang = newLocale;
    } catch (error) {
      console.error('Failed to change locale:', error);
    } finally {
      setLoading(false);
    }
  };

  // Make the changeLocale function available globally for language switchers
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).changeLocale = changeLocale;
    }

    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).changeLocale;
      }
    };
  }, []);

  // Show a minimal loading state while fetching initial messages
  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <div className='loading loading-spinner loading-lg'></div>
      </div>
    );
  }

  return (
    <Suspense>
      <NextIntlClientProvider messages={messages} locale={locale}>
        <ThemeProvider attribute='data-theme' defaultTheme='system'>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <AppHeader />
              {children}
            </SidebarInset>
          </SidebarProvider>
          <Toaster position='top-center' />
        </ThemeProvider>
      </NextIntlClientProvider>
    </Suspense>
  );
}
