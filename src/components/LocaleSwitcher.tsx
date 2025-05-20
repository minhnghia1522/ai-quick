'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation'; // Sử dụng useRouter từ next/navigation
import { useEffect, useState } from 'react';
import { Locale } from '../i18n/request';
import { ChevronDownIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { STORAGE_KEY_LOCALE, SUPPORTED_LOCALES } from '../i18n/config';
import { CheckCircleFillIcon } from './icons';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

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
        <Button data-testid='model-selector' variant='outline' className='md:px-2 md:h-[34px]'>
          {t(selectedLocale)}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='min-w-[150px]'>
        {SUPPORTED_LOCALES.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onSelect={() => handleLocaleChange(locale as Locale)}
            className='gap-2'
            data-active={locale === selectedLocale}
            asChild
          >
            <button type='button' className='gap-4 group/item flex flex-row justify-between items-center w-full'>
              <div className='flex flex-col gap-1 items-start'>
                <div>{t(locale)}</div>
              </div>

              <div className='text-foreground dark:text-foreground opacity-0 group-data-[active=true]/item:opacity-100'>
                <CheckCircleFillIcon />
              </div>
            </button>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
