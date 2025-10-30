'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { CalendarIcon } from 'lucide-react';
import { TimeRange, TimeRangeOption } from '../types/analytics.types';

interface TimeRangeFilterProps {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
}

export const TimeRangeFilter: React.FC<TimeRangeFilterProps> = ({ value, onChange }) => {
  const t = useTranslations('UsageAnalytics');

  const timeRangeOptions: TimeRangeOption[] = [
    { value: 'today', label: t('timeRange.today') },
    { value: '7days', label: t('timeRange.last7days') },
    { value: '30days', label: t('timeRange.last30days') },
    { value: '90days', label: t('timeRange.last90days') }
  ];

  return (
    <div className='space-y-2'>
      <div className='flex items-center gap-2'>
        <CalendarIcon className='h-4 w-4 text-muted-foreground' />
        <span className='text-xs text-muted-foreground'>{t('filters.timeRangeLabel')}</span>
      </div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className='w-full'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {timeRangeOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
