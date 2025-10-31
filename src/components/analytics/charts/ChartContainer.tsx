'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { UsageChart } from './UsageChart';
import { ChartDataPoint, ChartMetric, TimeRange } from '../types/analytics.types';

interface ChartContainerProps {
  data: ChartDataPoint[];
  timeRange: TimeRange;
  activeTab: ChartMetric;
  onTabChange: (tab: ChartMetric) => void;
  getTimeRangeLabel: (timeRange: TimeRange) => string;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  data,
  timeRange,
  activeTab,
  onTabChange,
  getTimeRangeLabel
}) => {
  const t = useTranslations('UsageAnalytics');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('charts.title')}</CardTitle>
        <CardDescription>
          {timeRange === 'today'
            ? 'Hourly breakdown for today'
            : `Daily breakdown for ${getTimeRangeLabel(timeRange).toLowerCase()}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as ChartMetric)}>
          <TabsList className='grid w-full max-w-md grid-cols-3 mb-4'>
            <TabsTrigger value='cost'>{t('charts.tabs.cost')}</TabsTrigger>
            <TabsTrigger value='tokens'>{t('charts.tabs.tokens')}</TabsTrigger>
            <TabsTrigger value='tasks'>{t('charts.tabs.tasks')}</TabsTrigger>
          </TabsList>
          <TabsContent value='cost'>
            <UsageChart data={data} metric='cost' timeRange={timeRange} />
          </TabsContent>
          <TabsContent value='tokens'>
            <UsageChart data={data} metric='tokens' timeRange={timeRange} />
          </TabsContent>
          <TabsContent value='tasks'>
            <UsageChart data={data} metric='tasks' timeRange={timeRange} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
