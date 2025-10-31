'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { UsageAnalytics } from '@/src/types/usage';
import { TimeRange } from '../types/analytics.types';
import { formatCost, calculatePercentage } from '../utils/analytics.utils';

interface ModelBreakdownProps {
  modelBreakdown: UsageAnalytics['modelBreakdown'];
  totalCost: number;
  timeRange: TimeRange;
  selectedModelsCount: number;
  availableModelsCount: number;
  getTimeRangeLabel: (timeRange: TimeRange) => string;
}

export const ModelBreakdown: React.FC<ModelBreakdownProps> = ({
  modelBreakdown,
  totalCost,
  timeRange,
  selectedModelsCount,
  availableModelsCount,
  getTimeRangeLabel
}) => {
  const t = useTranslations('UsageAnalytics');

  const hasNoData = Object.keys(modelBreakdown).length === 0;
  const isFiltered = selectedModelsCount > 0 && selectedModelsCount < availableModelsCount;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('breakdown.byModel.title')}</CardTitle>
        <CardDescription>{t('breakdown.byModel.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {hasNoData ? (
          <div className='text-sm text-muted-foreground'>
            {isFiltered
              ? t('breakdown.byModel.noDataFiltered', { timeRange: getTimeRangeLabel(timeRange).toLowerCase() })
              : t('breakdown.byModel.noData')}
          </div>
        ) : (
          <div className='space-y-3'>
            {Object.entries(modelBreakdown)
              .sort(([, a], [, b]) => b.cost - a.cost)
              .map(([model, data]) => (
                <div key={model} className='flex justify-between items-center p-3 bg-muted/50 rounded-lg'>
                  <div className='flex-1 min-w-0'>
                    <div className='font-medium truncate'>{model}</div>
                    <div className='text-sm text-muted-foreground'>
                      {t('breakdown.byModel.taskCount', { count: data.tasks })} •{' '}
                      {(data.inputTokens + data.outputTokens).toLocaleString()} {t('breakdown.tokens')}
                    </div>
                    <div className='text-xs text-muted-foreground mt-1'>
                      {t('breakdown.input')}: {data.inputTokens.toLocaleString()} • {t('breakdown.output')}:{' '}
                      {data.outputTokens.toLocaleString()}
                    </div>
                  </div>
                  <div className='text-right ml-4'>
                    <div className='font-medium'>{formatCost(data.cost)}</div>
                    <div className='text-xs text-muted-foreground'>{calculatePercentage(data.cost, totalCost)}</div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
