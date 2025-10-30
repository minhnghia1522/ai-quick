import { TimeRange } from '../types/analytics.types';

/**
 * Format chart period based on time range
 * For hourly data: extract hour only
 * For daily data: format as EEE, MMM dd (e.g. Mon, Jan 01)
 */
export const formatChartPeriod = (period: string, timeRange: TimeRange): string => {
  if (timeRange === 'today') {
    // For hourly data, extract hour only
    const hour = period.split(' ')[1];
    return hour || period;
  }
  // For daily data, format as EEE, MMM dd
  const parts = period.split('-');
  if (parts.length === 3) {
    const date = new Date(period);
    const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate().toString().padStart(2, '0');
    return `${weekday}, ${month} ${day}`;
  }
  return period;
};

/**
 * Format chart period for X-axis (short format)
 * For hourly data: extract hour only
 * For daily data: format as MMM dd (e.g. Jan 15)
 */
export const formatChartPeriodShort = (period: string, timeRange: TimeRange): string => {
  if (timeRange === 'today') {
    // For hourly data, extract hour only
    const hour = period.split(' ')[1];
    return hour || period;
  }
  // For daily data, format as MMM dd
  const parts = period.split('-');
  if (parts.length === 3) {
    const date = new Date(period);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate().toString().padStart(2, '0');
    return `${month} ${day}`;
  }
  return period;
};

/**
 * Format value based on chart metric type
 */
export const formatChartValue = (value: number, metricType: 'cost' | 'tokens' | 'tasks'): string => {
  if (metricType === 'cost') {
    return `$${value.toFixed(4)}`;
  }
  return value.toLocaleString();
};

/**
 * Calculate percentage of total
 */
export const calculatePercentage = (value: number, total: number): string => {
  if (total === 0) return '0%';
  return `${((value / total) * 100).toFixed(1)}%`;
};

/**
 * Format cost with 4 decimal places
 */
export const formatCost = (cost: number): string => {
  return `$${cost.toFixed(4)}`;
};

/**
 * Calculate average cost per task
 */
export const calculateAvgCostPerTask = (totalCost: number, totalTasks: number): string => {
  if (totalTasks === 0) return '$0.0000';
  return formatCost(totalCost / totalTasks);
};
