'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '../../ui/button';
import { FilterIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { TimeRangeFilter } from './TimeRangeFilter';
import { ModelFilter } from './ModelFilter';
import { TimeRange } from '../types/analytics.types';

interface FilterSidebarProps {
  timeRange: TimeRange;
  onTimeRangeChange: (value: TimeRange) => void;
  availableModels: string[];
  selectedModels: string[];
  onModelToggle: (modelName: string, checked: boolean) => void;
  onSelectAllModels: () => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  timeRange,
  onTimeRangeChange,
  availableModels,
  selectedModels,
  onModelToggle,
  onSelectAllModels,
  onClearFilters,
  hasActiveFilters
}) => {
  const t = useTranslations('UsageAnalytics');
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className='bg-muted/30 rounded-lg'>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className='lg:hidden w-full p-4 flex items-center justify-between text-sm font-semibold hover:bg-muted/50 rounded-lg transition-colors'
      >
        <div className='flex items-center gap-2'>
          <FilterIcon className='h-4 w-4' />
          <span>{t('filters.timeRangeLabel')}</span>
          {hasActiveFilters && (
            <span className='ml-2 px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full'>
              {selectedModels.length}/{availableModels.length}
            </span>
          )}
        </div>
        {isExpanded ? <ChevronUp className='h-4 w-4' /> : <ChevronDown className='h-4 w-4' />}
      </button>

      {/* Filter Content */}
      <div className={`${isExpanded ? 'block' : 'hidden'} lg:block p-4 pt-0 lg:pt-4`}>
        {/* Desktop: single column, Mobile (expanded): single column */}
        <div className='space-y-4'>
          {/* Time Range Filter */}
          <div className='space-y-2'>
            <h3 className='text-sm font-semibold hidden lg:block'>{t('filters.timeRangeLabel')}</h3>
            <TimeRangeFilter value={timeRange} onChange={onTimeRangeChange} />
          </div>

          {/* Model Filter */}
          <div className='space-y-2'>
            <ModelFilter
              availableModels={availableModels}
              selectedModels={selectedModels}
              onModelToggle={onModelToggle}
              onSelectAll={onSelectAllModels}
            />
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              variant='ghost'
              size='sm'
              onClick={onClearFilters}
              className='w-full text-xs text-muted-foreground hover:text-foreground'
            >
              {t('filters.clearFilters')}
            </Button>
          )}

          {/* Active Filter Info */}
          {hasActiveFilters && (
            <div className='flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t'>
              <FilterIcon className='h-3 w-3' />
              <span>
                {t('filters.showingData', {
                  selected: selectedModels.length,
                  total: availableModels.length
                })}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
