'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartDataPoint, ChartMetric, TimeRange } from '../types/analytics.types';
import { formatChartPeriod, formatChartPeriodShort, formatChartValue } from '../utils/analytics.utils';

interface UsageChartProps {
  data: ChartDataPoint[];
  metric: ChartMetric;
  timeRange: TimeRange;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  formatValue: (value: number) => string;
  formatPeriodFull: (period: string) => string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, formatValue, formatPeriodFull }) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div
      className='bg-white border border-gray-200 rounded-lg shadow-lg p-3'
      style={{
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}
    >
      <p className='font-semibold text-gray-900 mb-1 text-sm'>{formatPeriodFull(label || '')}</p>
      <p className='text-blue-600 font-medium text-sm'>{formatValue(payload[0].value)}</p>
    </div>
  );
};

export const UsageChart: React.FC<UsageChartProps> = ({ data, metric, timeRange }) => {
  const t = useTranslations('UsageAnalytics');

  if (data.length === 0) {
    return (
      <div className='flex items-center justify-center h-64 text-muted-foreground text-sm'>{t('charts.noData')}</div>
    );
  }

  const formatValue = (value: number) => {
    return formatChartValue(value, metric);
  };

  const formatPeriodShort = (period: string) => {
    return formatChartPeriodShort(period, timeRange);
  };

  const formatPeriodFull = (period: string) => {
    return formatChartPeriod(period, timeRange);
  };

  const calculateYAxisDomain = () => {
    const maxValue = Math.max(...data.map((d) => d[metric] as number));
    return [0, Math.ceil(maxValue * 1.1)];
  };

  const calculateYAxisTicks = () => {
    const maxValue = Math.max(...data.map((d) => d[metric] as number));
    const adjustedMax = maxValue * 1.1;

    let step: number;
    switch (metric) {
      case 'tokens':
        step = 500;
        break;
      case 'cost':
        step = 0.001;
        break;
      case 'tasks':
        step = 5;
        break;
      default:
        step = Math.ceil(adjustedMax / 5);
    }

    const ticks = [];
    let currentTick = 0;
    while (currentTick <= adjustedMax) {
      ticks.push(metric === 'cost' ? Math.round(currentTick * 1000) / 1000 : currentTick);
      currentTick += step;
    }

    return ticks;
  };

  return (
    <ResponsiveContainer width='100%' height={300}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0 }}>
        <CartesianGrid strokeDasharray='3 3' opacity={0.3} />
        <XAxis
          dataKey='period'
          tickFormatter={formatPeriodShort}
          angle={-45}
          textAnchor='end'
          height={60}
          tick={{ fontSize: 11 }}
        />
        <YAxis tick={{ fontSize: 11 }} domain={calculateYAxisDomain()} ticks={calculateYAxisTicks()} width={45} />
        <Tooltip
          content={<CustomTooltip formatValue={formatValue} formatPeriodFull={formatPeriodFull} />}
          cursor={{ fill: 'rgba(59, 106, 246, 0.1)' }}
          position={{ y: 0 }}
        />
        <Bar dataKey={metric} fill='#3b6af6' radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};
