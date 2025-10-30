'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './ui/dropdown-menu';
import { Skeleton } from './ui/skeleton';
import { CalendarIcon, FilterIcon, TrendingUpIcon, DollarSignIcon, ChevronDownIcon } from 'lucide-react';
import { usageCostService } from '@/src/service/usageCostService';
import { UsageAnalytics } from '@/src/types/usage';

interface UsageAnalyticsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type TimeRange = 'today' | '7days' | '30days' | '90days';

interface FilterState {
  timeRange: TimeRange;
  selectedModels: string[];
}

interface ModelFilterState {
  availableModels: string[];
  selectedModels: string[];
}

const UsageAnalyticsDialog: React.FC<UsageAnalyticsDialogProps> = ({ open, onOpenChange }) => {
  const t = useTranslations('UsageAnalytics');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    timeRange: '30days',
    selectedModels: []
  });
  const [modelFilter, setModelFilter] = useState<ModelFilterState>({
    availableModels: [],
    selectedModels: []
  });
  const [analytics, setAnalytics] = useState<UsageAnalytics>({
    totalCost: 0,
    totalTasks: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    modelBreakdown: {},
    taskTypeBreakdown: {}
  });

  const timeRangeOptions = [
    { value: 'today', label: t('timeRange.today') },
    { value: '7days', label: t('timeRange.last7days') },
    { value: '30days', label: t('timeRange.last30days') },
    { value: '90days', label: t('timeRange.last90days') }
  ] as const;

  const getTimeRangeLabel = (timeRange: TimeRange): string => {
    return timeRangeOptions.find((option) => option.value === timeRange)?.label || 'Unknown';
  };

  const loadAnalytics = async (timeRange: TimeRange, selectedModels: string[] = []) => {
    try {
      setIsLoading(true);
      setError(null);

      // Create filter object based on current selections
      const filter: { timeRange: TimeRange; models?: string[] } = { timeRange };
      if (selectedModels.length > 0) {
        filter.models = selectedModels;
      }

      const analyticsData = await usageCostService.getAnalytics(filter);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError(err instanceof Error ? err.message : t('errors.loadFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailableModels = async () => {
    try {
      const models = await usageCostService.getUsedModels();
      setModelFilter((prev) => ({
        ...prev,
        availableModels: models
      }));
    } catch (err) {
      console.error('Error loading available models:', err);
    }
  };

  const handleTimeRangeChange = (value: TimeRange) => {
    setFilters((prev) => ({ ...prev, timeRange: value }));
    loadAnalytics(value, modelFilter.selectedModels);
  };

  const handleModelSelectionChange = (modelName: string, checked: boolean) => {
    const newSelectedModels = checked
      ? [...modelFilter.selectedModels, modelName]
      : modelFilter.selectedModels.filter((m) => m !== modelName);

    setModelFilter((prev) => ({
      ...prev,
      selectedModels: newSelectedModels
    }));

    setFilters((prev) => ({ ...prev, selectedModels: newSelectedModels }));
    loadAnalytics(filters.timeRange, newSelectedModels);
  };

  const handleSelectAllModels = () => {
    const allSelected = modelFilter.selectedModels.length === modelFilter.availableModels.length;
    const newSelectedModels = allSelected ? [] : [...modelFilter.availableModels];

    setModelFilter((prev) => ({
      ...prev,
      selectedModels: newSelectedModels
    }));

    setFilters((prev) => ({ ...prev, selectedModels: newSelectedModels }));
    loadAnalytics(filters.timeRange, newSelectedModels);
  };

  const getModelFilterDisplayText = () => {
    if (modelFilter.selectedModels.length === 0) {
      return t('filters.allModels');
    } else if (modelFilter.selectedModels.length === 1) {
      return modelFilter.selectedModels[0];
    } else if (modelFilter.selectedModels.length === modelFilter.availableModels.length) {
      return t('filters.allModels');
    } else {
      return t('filters.modelsCount', { count: modelFilter.selectedModels.length });
    }
  };

  // Load initial data when dialog opens
  useEffect(() => {
    if (open) {
      loadAvailableModels();
      loadAnalytics(filters.timeRange, modelFilter.selectedModels);
    }
  }, [open, filters.timeRange, modelFilter.selectedModels]);

  const handleExportData = async (format: 'json' | 'csv' = 'json') => {
    try {
      setIsLoading(true);

      // Get all usage records for export
      const allRecords = await usageCostService.exportUsageData();

      if (format === 'csv') {
        // Create CSV format
        const csvHeaders = [
          'ID',
          'Timestamp',
          'Model Name',
          'Task Type',
          'Input Tokens',
          'Output Tokens',
          'Input Cost',
          'Output Cost',
          'Total Cost'
        ];

        const csvRows = allRecords.map((record) => [
          record.id,
          new Date(record.timestamp).toISOString(),
          record.modelName,
          record.taskType,
          record.inputTokens.toString(),
          record.outputTokens.toString(),
          record.inputCost.toString(),
          record.outputCost.toString(),
          record.totalCost.toString()
        ]);

        const csvContent = [csvHeaders, ...csvRows].map((row) => row.map((field) => `"${field}"`).join(',')).join('\n');

        const dataBlob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `usage-records-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        // Create JSON format with complete analytics
        const exportData = {
          exportDate: new Date().toISOString(),
          summary: {
            totalRecords: allRecords.length,
            totalCost: analytics.totalCost,
            totalTasks: analytics.totalTasks,
            totalInputTokens: analytics.totalInputTokens,
            totalOutputTokens: analytics.totalOutputTokens,
            dateRange: {
              from:
                allRecords.length > 0
                  ? new Date(Math.min(...allRecords.map((r) => new Date(r.timestamp).getTime()))).toISOString()
                  : null,
              to:
                allRecords.length > 0
                  ? new Date(Math.max(...allRecords.map((r) => new Date(r.timestamp).getTime()))).toISOString()
                  : null
            }
          },
          currentFilter: {
            timeRange: filters.timeRange,
            selectedModels: modelFilter.selectedModels,
            appliedToData: filters.timeRange !== '90days' || modelFilter.selectedModels.length > 0
          },
          analytics: {
            modelBreakdown: analytics.modelBreakdown,
            taskTypeBreakdown: analytics.taskTypeBreakdown
          },
          records: allRecords.map((record) => ({
            ...record,
            timestamp: new Date(record.timestamp).toISOString() // Ensure consistent date format
          }))
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `usage-analytics-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Error exporting data:', err);
      setError(t('errors.exportFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const renderLoadingState = () => (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className='h-4 w-20' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-8 w-16' />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className='space-y-4'>
        <Skeleton className='h-6 w-32' />
        <Skeleton className='h-32 w-full' />
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div className='flex flex-col items-center justify-center py-8 space-y-4'>
      <div className='text-destructive text-sm font-medium'>{t('errors.title')}</div>
      <div className='text-muted-foreground text-sm text-center'>
        {error || t('errors.unexpected')}
      </div>
      <Button variant='outline' onClick={() => loadAnalytics(filters.timeRange)}>
        {t('buttons.tryAgain')}
      </Button>
    </div>
  );

  const hasActiveFilters = () => {
    return (
      modelFilter.selectedModels.length > 0 && modelFilter.selectedModels.length < modelFilter.availableModels.length
    );
  };

  const clearAllFilters = () => {
    setModelFilter((prev) => ({
      ...prev,
      selectedModels: []
    }));
    setFilters((prev) => ({ ...prev, selectedModels: [] }));
    loadAnalytics(filters.timeRange, []);
  };

  const renderFilterControls = () => (
    <div className='space-y-4'>
      <div className='flex flex-col sm:flex-row gap-4 p-4 bg-muted/50 rounded-lg'>
        <div className='flex items-center gap-2'>
          <CalendarIcon className='h-4 w-4 text-muted-foreground' />
          <span className='text-sm font-medium'>{t('filters.timeRangeLabel')}:</span>
          <Select value={filters.timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className='w-[160px] sm:w-[180px]'>
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

        <div className='flex items-center gap-2'>
          <FilterIcon className='h-4 w-4 text-muted-foreground' />
          <span className='text-sm font-medium'>{t('filters.modelsLabel')}:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                className='w-[200px] sm:w-[220px] justify-between'
                disabled={modelFilter.availableModels.length === 0}
              >
                <span className='truncate'>{getModelFilterDisplayText()}</span>
                <ChevronDownIcon className='h-4 w-4 opacity-50' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-[200px] sm:w-[220px]' align='start'>
              <DropdownMenuLabel>{t('filters.selectModels')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {modelFilter.availableModels.length > 1 && (
                <>
                  <DropdownMenuCheckboxItem
                    checked={modelFilter.selectedModels.length === modelFilter.availableModels.length}
                    onCheckedChange={handleSelectAllModels}
                    className='font-medium'
                  >
                    {t('filters.allModelsOption')}
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {modelFilter.availableModels.length === 0 ? (
                <div className='px-2 py-1.5 text-sm text-muted-foreground'>{t('filters.noModels')}</div>
              ) : (
                modelFilter.availableModels.map((model) => (
                  <DropdownMenuCheckboxItem
                    key={model}
                    checked={modelFilter.selectedModels.includes(model)}
                    onCheckedChange={(checked) => handleModelSelectionChange(model, checked)}
                  >
                    <span className='truncate'>{model}</span>
                  </DropdownMenuCheckboxItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {hasActiveFilters() && (
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='sm'
              onClick={clearAllFilters}
              className='text-muted-foreground hover:text-foreground'
            >
              {t('filters.clearFilters')}
            </Button>
          </div>
        )}
      </div>

      {hasActiveFilters() && (
        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          <FilterIcon className='h-3 w-3' />
          <span>
            {t('filters.showingData', {
              selected: modelFilter.selectedModels.length,
              total: modelFilter.availableModels.length
            })}
          </span>
        </div>
      )}
    </div>
  );

  const renderAnalyticsContent = () => (
    <div className='space-y-6 pb-4'>
      {/* Summary Cards */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2 px-4 py-3'>
            <CardTitle className='text-xs lg:text-sm font-medium'>{t('cards.totalCost')}</CardTitle>
            <DollarSignIcon className='h-3.5 w-3.5 lg:h-4 lg:w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent className='px-4 pb-3'>
            <div className='text-xl lg:text-2xl font-bold'>${analytics.totalCost.toFixed(4)}</div>
            <p className='text-xs text-muted-foreground line-clamp-1'>
              {getTimeRangeLabel(filters.timeRange)}
              {modelFilter.selectedModels.length > 0 &&
                modelFilter.selectedModels.length < modelFilter.availableModels.length &&
                ` • ${modelFilter.selectedModels.length} ${t('cards.model', { count: modelFilter.selectedModels.length })}`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2 px-4 py-3'>
            <CardTitle className='text-xs lg:text-sm font-medium'>{t('cards.totalTasks')}</CardTitle>
            <TrendingUpIcon className='h-3.5 w-3.5 lg:h-4 lg:w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent className='px-4 pb-3'>
            <div className='text-xl lg:text-2xl font-bold'>{analytics.totalTasks}</div>
            <p className='text-xs text-muted-foreground'>{t('cards.aiInteractions')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2 px-4 py-3'>
            <CardTitle className='text-xs lg:text-sm font-medium'>{t('cards.totalTokens')}</CardTitle>
            <TrendingUpIcon className='h-3.5 w-3.5 lg:h-4 lg:w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent className='px-4 pb-3'>
            <div className='text-xl lg:text-2xl font-bold'>
              {(analytics.totalInputTokens + analytics.totalOutputTokens).toLocaleString()}
            </div>
            <p className='text-xs text-muted-foreground line-clamp-1'>
              {t('cards.tokenBreakdown', {
                input: analytics.totalInputTokens.toLocaleString(),
                output: analytics.totalOutputTokens.toLocaleString()
              })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2 px-4 py-3'>
            <CardTitle className='text-xs lg:text-sm font-medium'>{t('cards.avgCostPerTask')}</CardTitle>
            <DollarSignIcon className='h-3.5 w-3.5 lg:h-4 lg:w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent className='px-4 pb-3'>
            <div className='text-xl lg:text-2xl font-bold'>
              ${analytics.totalTasks > 0 ? (analytics.totalCost / analytics.totalTasks).toFixed(4) : '0.0000'}
            </div>
            <p className='text-xs text-muted-foreground'>{t('cards.efficiency')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown Section */}
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold'>{t('breakdown.title')}</h3>

        {/* Model Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>{t('breakdown.byModel.title')}</CardTitle>
            <CardDescription>{t('breakdown.byModel.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(analytics.modelBreakdown).length === 0 ? (
              <div className='text-sm text-muted-foreground'>
                {modelFilter.selectedModels.length > 0 &&
                  modelFilter.selectedModels.length < modelFilter.availableModels.length
                  ? t('breakdown.byModel.noDataFiltered', { timeRange: getTimeRangeLabel(filters.timeRange).toLowerCase() })
                  : t('breakdown.byModel.noData')}
              </div>
            ) : (
              <div className='space-y-3'>
                {Object.entries(analytics.modelBreakdown)
                  .sort(([, a], [, b]) => b.cost - a.cost) // Sort by cost descending
                  .map(([model, data]) => (
                    <div key={model} className='flex justify-between items-center p-3 bg-muted/50 rounded-lg'>
                      <div className='flex-1 min-w-0'>
                        <div className='font-medium truncate'>{model}</div>
                        <div className='text-sm text-muted-foreground'>
                          {t('breakdown.byModel.taskCount', { count: data.tasks })} •{' '}
                          {(data.inputTokens + data.outputTokens).toLocaleString()} {t('breakdown.tokens')}
                        </div>
                        <div className='text-xs text-muted-foreground mt-1'>
                          {t('breakdown.input')}: {data.inputTokens.toLocaleString()} • {t('breakdown.output')}: {data.outputTokens.toLocaleString()}
                        </div>
                      </div>
                      <div className='text-right ml-4'>
                        <div className='font-medium'>${data.cost.toFixed(4)}</div>
                        <div className='text-xs text-muted-foreground'>
                          {analytics.totalCost > 0 ? `${((data.cost / analytics.totalCost) * 100).toFixed(1)}%` : '0%'}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Task Type Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>{t('breakdown.byTaskType.title')}</CardTitle>
            <CardDescription>{t('breakdown.byTaskType.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(analytics.taskTypeBreakdown).length === 0 ? (
              <div className='text-sm text-muted-foreground text-center py-8'>
                {t('breakdown.byTaskType.noData')}
                {modelFilter.selectedModels.length > 0 &&
                  modelFilter.selectedModels.length < modelFilter.availableModels.length && (
                    <div className='mt-2'>{t('breakdown.byTaskType.adjustFilters')}</div>
                  )}
              </div>
            ) : (
              <div className='space-y-3'>
                {Object.entries(analytics.taskTypeBreakdown)
                  .sort(([, a], [, b]) => b.cost - a.cost) // Sort by cost descending
                  .map(([taskType, data]) => (
                    <div key={taskType} className='flex justify-between items-center p-3 bg-muted/50 rounded-lg'>
                      <div className='flex-1 min-w-0'>
                        <div className='font-medium capitalize'>{taskType.replace('-', ' ')}</div>
                        <div className='text-sm text-muted-foreground'>
                          {t('breakdown.byTaskType.taskCompleted', { count: data.tasks })}
                        </div>
                        <div className='text-xs text-muted-foreground mt-1'>
                          {t('breakdown.byTaskType.avgCost')}: ${data.tasks > 0 ? (data.cost / data.tasks).toFixed(4) : '0.0000'} {t('breakdown.byTaskType.perTask')}
                        </div>
                      </div>
                      <div className='text-right ml-4'>
                        <div className='font-medium'>${data.cost.toFixed(4)}</div>
                        <div className='text-xs text-muted-foreground'>
                          {analytics.totalCost > 0 ? `${((data.cost / analytics.totalCost) * 100).toFixed(1)}%` : '0%'}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='w-full max-w-[95vw] lg:max-w-[1200px] h-[85vh] flex flex-col p-0'>
        <DialogHeader className='px-6 pt-6 pb-4'>
          <DialogTitle>{t('dialog.title')}</DialogTitle>
          <DialogDescription>{t('dialog.description')}</DialogDescription>
        </DialogHeader>

        <div className='flex-1 flex flex-col overflow-hidden px-6'>
          {/* Filter Controls */}
          {renderFilterControls()}

          {/* Content Area - Scrollable */}
          <div className='flex-1 overflow-y-auto pr-2 -mr-2 mt-4'>
            {error ? renderErrorState() : isLoading ? renderLoadingState() : renderAnalyticsContent()}
          </div>

          {/* Footer Actions */}
          <div className='flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 py-4 border-t mt-4'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' disabled={isLoading} className='w-full sm:w-auto'>
                  {t('buttons.exportData')}
                  <ChevronDownIcon className='ml-2 h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='start'>
                <DropdownMenuLabel>{t('export.formatLabel')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => handleExportData('json')}>{t('export.jsonFormat')}</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleExportData('csv')}>{t('export.csvFormat')}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={() => onOpenChange(false)} className='w-full sm:w-auto'>
              {t('buttons.close')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UsageAnalyticsDialog;
