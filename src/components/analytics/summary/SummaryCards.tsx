'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { DollarSignIcon, TrendingUpIcon } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { UsageAnalytics } from '@/src/types/usage';
import { TimeRange } from '../types/analytics.types';
import { formatCost, calculateAvgCostPerTask } from '../utils/analytics.utils';

interface SummaryCardsProps {
  analytics: UsageAnalytics;
  timeRange: TimeRange;
  getTimeRangeLabel: (timeRange: TimeRange) => string;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ analytics, timeRange, getTimeRangeLabel }) => {
  const t = useTranslations('UsageAnalytics');

  const totalTokens = analytics.totalInputTokens + analytics.totalOutputTokens;
  const avgCostPerTask = calculateAvgCostPerTask(analytics.totalCost, analytics.totalTasks);

  return (
    <div className='grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-2.5'>
      <MetricCard
        title={t('cards.totalCost')}
        value={formatCost(analytics.totalCost)}
        description={getTimeRangeLabel(timeRange)}
        icon={DollarSignIcon}
      />

      <MetricCard
        title={t('cards.totalTasks')}
        value={analytics.totalTasks}
        description={t('cards.aiInteractions')}
        icon={TrendingUpIcon}
      />

      <MetricCard
        title={t('cards.totalTokens')}
        value={totalTokens.toLocaleString()}
        description={t('cards.tokenBreakdown', {
          input: analytics.totalInputTokens.toLocaleString(),
          output: analytics.totalOutputTokens.toLocaleString()
        })}
        icon={TrendingUpIcon}
      />

      <MetricCard
        title={t('cards.avgCostPerTask')}
        value={avgCostPerTask}
        description={t('cards.efficiency')}
        icon={DollarSignIcon}
      />
    </div>
  );
};
