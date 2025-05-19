'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation'; // Sử dụng useRouter từ next/navigation
import { useEffect, useState } from 'react';
import { Locale, STORAGE_KEY_LOCALE } from '../i18n/request';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@radix-ui/react-dropdown-menu';
import { ChevronDownIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/button';

const locales = ['en', 'vi', 'ja'];

export default function LocaleSwitcher({ className }: { className?: string }) {
  const t = useTranslations('LocaleSwitcher');
  const locale = useLocale(); // Locale hiện tại từ next-intl
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedLocale, setSelectedLocale] = useState(locale);

  useEffect(() => {
    const locale = localStorage.getItem(STORAGE_KEY_LOCALE) as Locale;
    if (locale) {
      setSelectedLocale(locale);
    }
  }, [locale, router, selectedLocale]);

  const handleLocaleChange = (locale: Locale) => {
    localStorage.setItem(STORAGE_KEY_LOCALE, locale);
    setSelectedLocale(locale);
    location.reload();
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        asChild
        className={cn('w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground', className)}
      >
        <Button variant='outline' className='md:px-2 md:h-[34px]'>
          {t(selectedLocale)}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='min-w-[150px]'>
        {locales.map((locale) => (
          <DropdownMenuItem key={locale} onSelect={() => handleLocaleChange(locale as Locale)} className='gap-2'>
            {t(locale)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
