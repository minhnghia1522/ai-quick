'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { UsageAnalytics } from '@/src/types/usage';
import { formatCost, calculatePercentage, calculateAvgCostPerTask } from '../utils/analytics.utils';

interface TaskTypeBreakdownProps {
  taskTypeBreakdown: UsageAnalytics['taskTypeBreakdown'];
  totalCost: number;
  selectedModelsCount: number;
  availableModelsCount: number;
}

export const TaskTypeBreakdown: React.FC<TaskTypeBreakdownProps> = ({
  taskTypeBreakdown,
  totalCost,
  selectedModelsCount,
  availableModelsCount
}) => {
  const t = useTranslations('UsageAnalytics');

  const hasNoData = Object.keys(taskTypeBreakdown).length === 0;
  const isFiltered = selectedModelsCount > 0 && selectedModelsCount < availableModelsCount;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('breakdown.byTaskType.title')}</CardTitle>
        <CardDescription>{t('breakdown.byTaskType.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {hasNoData ? (
          <div className='text-sm text-muted-foreground text-center py-8'>
            {t('breakdown.byTaskType.noData')}
            {isFiltered && <div className='mt-2'>{t('breakdown.byTaskType.adjustFilters')}</div>}
          </div>
        ) : (
          <div className='space-y-3'>
            {Object.entries(taskTypeBreakdown)
              .sort(([, a], [, b]) => b.cost - a.cost)
              .map(([taskType, data]) => (
                <div key={taskType} className='flex justify-between items-center p-3 bg-muted/50 rounded-lg'>
                  <div className='flex-1 min-w-0'>
                    <div className='font-medium capitalize'>{taskType.replace('-', ' ')}</div>
                    <div className='text-sm text-muted-foreground'>
                      {t('breakdown.byTaskType.taskCompleted', { count: data.tasks })}
                    </div>
                    <div className='text-xs text-muted-foreground mt-1'>
                      {t('breakdown.byTaskType.avgCost')}: {calculateAvgCostPerTask(data.cost, data.tasks)}{' '}
                      {t('breakdown.byTaskType.perTask')}
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
