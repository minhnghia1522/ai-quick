'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '../../ui/button';
import { FilterIcon } from 'lucide-react';
import { TimeRangeFilter } from './TimeRangeFilter';
import { ModelFilter } from './ModelFilter';
import { ExportButton } from '../export/ExportButton';
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
  onExport: (format: 'json' | 'csv') => void;
  isExporting: boolean;
  isLoading: boolean;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  timeRange,
  onTimeRangeChange,
  availableModels,
  selectedModels,
  onModelToggle,
  onSelectAllModels,
  onClearFilters,
  hasActiveFilters,
  onExport,
  isExporting,
  isLoading
}) => {
  const t = useTranslations('UsageAnalytics');

  return (
    <div className='w-full lg:w-64 flex-shrink-0 space-y-4 sm:p-0 lg:p-4 bg-muted/30 rounded-lg'>
      <h3 className='text-sm font-semibold mb-4'>{t('filters.timeRangeLabel')}</h3>

      {/* Time Range Filter */}
      <TimeRangeFilter value={timeRange} onChange={onTimeRangeChange} />

      {/* Model Filter */}
      <ModelFilter
        availableModels={availableModels}
        selectedModels={selectedModels}
        onModelToggle={onModelToggle}
        onSelectAll={onSelectAllModels}
      />

      {/* Export Button */}
      <div className='pt-2'>
        <ExportButton onExport={onExport} disabled={isLoading || isExporting} />
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
  );
};
