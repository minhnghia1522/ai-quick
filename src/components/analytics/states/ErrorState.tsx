'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '../../ui/button';

interface ErrorStateProps {
  error: string | null;
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  const t = useTranslations('UsageAnalytics');

  return (
    <div className='flex flex-col items-center justify-center py-8 space-y-4'>
      <div className='text-destructive text-sm font-medium'>{t('errors.title')}</div>
      <div className='text-muted-foreground text-sm text-center'>{error || t('errors.unexpected')}</div>
      <Button variant='outline' onClick={onRetry}>
        {t('buttons.tryAgain')}
      </Button>
    </div>
  );
};
