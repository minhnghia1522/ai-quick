'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '../../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '../../ui/dropdown-menu';
import { ChevronDownIcon } from 'lucide-react';

interface ExportButtonProps {
  onExport: (format: 'json' | 'csv') => void;
  disabled?: boolean;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ onExport, disabled = false }) => {
  const t = useTranslations('UsageAnalytics');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' disabled={disabled} className='w-auto whitespace-nowrap'>
          {t('buttons.exportData')}
          <ChevronDownIcon className='ml-2 h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuLabel>{t('export.formatLabel')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => onExport('json')}>{t('export.jsonFormat')}</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onExport('csv')}>{t('export.csvFormat')}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
