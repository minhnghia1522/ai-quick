'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/src/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/src/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { useTranslations } from 'next-intl';
import { subscribeCostChanged, formatUSD } from '@/src/utils/usageCost';
import { ITranslationHistory } from '@/src/components/TranslationHistory';

// Internal Type Definitions
type TimeRange = 'today' | 'last_7_days' | 'last_30_days' | 'last_90_days';
type MetricType = 'tokens' | 'inference';
interface UsageBreakdown {
  [date: string]: {
    [provider: string]: { [modelId: string]: { [feature: string]: number } };
  };
}
interface ChartPoint {
  date: string;
  inference: number;
}
interface ModelRow {
  model: string;
  provider: string;
  activity: number;
  tokens: string;
  inference: number;
}

interface UsageAnalyticsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Helper Functions
const getStorageBreakdownSafely = (): UsageBreakdown => {
  try {
    const storedData = localStorage.getItem('usage_cost_breakdown_v1');
    return storedData ? JSON.parse(storedData) : {};
  } catch (error) {
    console.error('Failed to parse usage breakdown from localStorage:', error);
    return {};
  }
};

const getTranslationHistorySafely = (): Pick<ITranslationHistory, 'timestamp'>[] => {
  try {
    const storedData = localStorage.getItem('translationHistory');
    return storedData ? JSON.parse(storedData) : [];
  } catch (error) {
    console.error('Failed to parse translation history from localStorage:', error);
    return [];
  }
};

const getRangeBounds = (
  timeRange: TimeRange
): { from: number; to: number } => {
  const now = new Date();
  const to = new Date(now).setHours(23, 59, 59, 999);

  const from = new Date(now);
  from.setHours(0, 0, 0, 0);

  switch (timeRange) {
    case 'today':
      // from is already today's start
      break;
    case 'last_7_days':
      from.setDate(from.getDate() - 6);
      break;
    case 'last_30_days':
      from.setDate(from.getDate() - 29);
      break;
    case 'last_90_days':
      from.setDate(from.getDate() - 89);
      break;
  }
  return { from: from.getTime(), to };
};

const formatDateLabel = (date: Date): string => {
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export function UsageAnalyticsDialog({
  open,
  onOpenChange
}: UsageAnalyticsDialogProps) {
  const t = useTranslations('usage_analytics');

  const [timeRange, setTimeRange] = useState<TimeRange>('last_7_days');
  const [metricType, setMetricType] = useState<MetricType>('inference');
  const [breakdownData, setBreakdownData] = useState<UsageBreakdown>({});

  useEffect(() => {
    const reloadData = () => {
      setBreakdownData(getStorageBreakdownSafely());
    };

    reloadData();
    const unsubscribe = subscribeCostChanged(reloadData);
    return () => unsubscribe();
  }, []);

  const rangeBounds = useMemo(() => getRangeBounds(timeRange), [timeRange]);

  const chartData = useMemo<ChartPoint[]>(() => {
    const data: { [dateStr: string]: number } = {};
    Object.entries(breakdownData).forEach(([dateStr, providers]) => {
      const date = new Date(dateStr);
      if (date.getTime() >= rangeBounds.from && date.getTime() <= rangeBounds.to) {
        let dailyTotal = 0;
        Object.values(providers).forEach(models => {
          Object.values(models).forEach(features => {
            dailyTotal += Object.values(features).reduce((a, b) => a + b, 0);
          });
        });
        const formattedDate = formatDateLabel(date);
        data[formattedDate] = (data[formattedDate] || 0) + dailyTotal;
      }
    });

    return Object.entries(data)
      .map(([date, inference]) => ({
        date,
        inference,
        originalDate: new Date(date)
      }))
      .sort((a, b) => a.originalDate.getTime() - b.originalDate.getTime())
      .map(({ date, inference }) => ({ date, inference }));
  }, [breakdownData, rangeBounds]);

  const modelsTableData = useMemo<ModelRow[]>(() => {
    const modelMap: {
      [key: string]: { inference: number; activityDays: Set<string> };
    } = {};

    Object.entries(breakdownData).forEach(([dateStr, providers]) => {
      const date = new Date(dateStr);
      if (date.getTime() >= rangeBounds.from && date.getTime() <= rangeBounds.to) {
        Object.entries(providers).forEach(([provider, models]) => {
          Object.entries(models).forEach(([modelId, features]) => {
            const modelCost = Object.values(features).reduce((a, b) => a + b, 0);
            if (modelCost > 0) {
              const key = `${provider}::${modelId}`;
              if (!modelMap[key]) {
                modelMap[key] = { inference: 0, activityDays: new Set() };
              }
              modelMap[key].inference += modelCost;
              modelMap[key].activityDays.add(dateStr);
            }
          });
        });
      }
    });

    return Object.entries(modelMap)
      .map(([key, data]) => {
        const [provider, model] = key.split('::');
        return {
          provider,
          model,
          inference: data.inference,
          activity: data.activityDays.size,
          tokens: '—'
        };
      })
      .sort((a, b) => b.inference - a.inference);
  }, [breakdownData, rangeBounds]);

  const summaryTotals = useMemo(() => {
    let inferenceTotal = 0;
    Object.entries(breakdownData).forEach(([dateStr, providers]) => {
      const date = new Date(dateStr);
      if (date.getTime() >= rangeBounds.from && date.getTime() <= rangeBounds.to) {
        Object.values(providers).forEach(models => {
          Object.values(models).forEach(features => {
            inferenceTotal += Object.values(features).reduce((a, b) => a + b, 0);
          });
        });
      }
    });

    const history = getTranslationHistorySafely();
    const tasks = history.filter(
      item =>
        item.timestamp >= rangeBounds.from && item.timestamp <= rangeBounds.to
    ).length;

    return {
      tasks,
      tokensLabel: '—',
      inference: inferenceTotal
    };
  }, [breakdownData, rangeBounds]);

  const handleTimeRangeChange = useCallback((value: string) => {
    setTimeRange(value as TimeRange);
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl bg-white text-gray-900 border-gray-200">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="md:col-span-1">
            <h3 className="text-sm font-semibold mb-2">{t('filters.title')}</h3>
            <Select
              defaultValue={timeRange}
              onValueChange={handleTimeRangeChange}
            >
              <SelectTrigger className="w-full bg-white text-gray-900 border-gray-300">
                <SelectValue
                  placeholder={t('filters.time_range_placeholder')}
                />
              </SelectTrigger>
              <SelectContent className="bg-white text-gray-900 border-gray-200">
                <SelectItem value="today">{t('filters.today')}</SelectItem>
                <SelectItem value="last_7_days">
                  {t('filters.last_7_days')}
                </SelectItem>
                <SelectItem value="last_30_days">
                  {t('filters.last_30_days')}
                </SelectItem>
                <SelectItem value="last_90_days">
                  {t('filters.last_90_days')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-center">
              <Card className="bg-white border-gray-200 p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  {t('summary.tasks')}
                </p>
                <p className="text-xl font-semibold text-gray-900">
                  {summaryTotals.tasks}
                </p>
              </Card>
              <Card className="bg-white border-gray-200 p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  {t('summary.tokens')}
                </p>
                <p className="text-xl font-semibold text-gray-900">
                  {summaryTotals.tokensLabel}
                </p>
              </Card>
              <Card className="bg-white border-gray-200 p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Cost
                </p>
                <p className="text-xl font-semibold text-gray-900">
                  {formatUSD(summaryTotals.inference)}
                </p>
              </Card>
            </div>

            {/* Chart Card */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-gray-100 text-gray-400 hover:bg-gray-100 opacity-60 pointer-events-none"
                    aria-disabled="true"
                  >
                    {t('chart.tokens')}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-500 text-white"
                    onClick={() => setMetricType('inference')}
                  >
                    Cost
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                      <YAxis
                        stroke="#6b7280"
                        fontSize={12}
                        tickFormatter={value =>
                          metricType === 'inference' ? formatUSD(value) : String(value)
                        }
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb'
                        }}
                        labelStyle={{ color: '#111827' }}
                        formatter={(value: number) => [formatUSD(value), 'Cost']}
                      />
                      <Bar
                        dataKey="inference"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Models Table Card */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {t('models.title')}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase">
                    <tr>
                      <th scope="col" className="py-2 px-4">
                        {t('models.model')}
                      </th>
                      <th scope="col" className="py-2 px-4">
                        {t('models.provider')}
                      </th>
                      <th scope="col" className="py-2 px-4">
                        {t('models.activity')}
                      </th>
                      <th scope="col" className="py-2 px-4">
                        {t('models.tokens')}
                      </th>
                      <th scope="col" className="py-2 px-4">
                        Cost
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {modelsTableData.map((item, index) => (
                      <tr key={index} className="border-t border-gray-200">
                        <td className="py-2 px-4 font-medium text-gray-900">
                          {item.model}
                        </td>
                        <td className="py-2 px-4 text-gray-900">{item.provider}</td>
                        <td className="py-2 px-4 text-gray-900">{item.activity}</td>
                        <td className="py-2 px-4 text-gray-900">{item.tokens}</td>
                        <td className="py-2 px-4 text-gray-900">
                          {formatUSD(item.inference)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}