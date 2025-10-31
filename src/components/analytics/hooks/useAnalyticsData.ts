'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { usageCostService } from '@/src/service/usageCostService';
import { UsageAnalytics } from '@/src/types/usage';
import { TimeRange, FilterState, ModelFilterState, ChartDataPoint } from '../types/analytics.types';

export const useAnalyticsData = (open: boolean) => {
  const t = useTranslations('UsageAnalytics');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    timeRange: '7days',
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
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  const loadAnalytics = useCallback(
    async (timeRange: TimeRange, selectedModels: string[] = []) => {
      try {
        setIsLoading(true);
        setError(null);

        // Create filter object based on current selections
        const filter: { timeRange: TimeRange; models?: string[] } = { timeRange };
        if (selectedModels.length > 0) {
          filter.models = selectedModels;
        }

        // Load analytics data
        const analyticsData = await usageCostService.getAnalytics(filter);
        setAnalytics(analyticsData);

        // Load time series data for charts
        const granularity = timeRange === 'today' ? 'hourly' : 'daily';
        const timeSeriesData = await usageCostService.getTimeSeriesData(filter, granularity);
        setChartData(timeSeriesData);
      } catch (err) {
        console.error('Error loading analytics:', err);
        setError(err instanceof Error ? err.message : t('errors.loadFailed'));
      } finally {
        setIsLoading(false);
      }
    },
    [t]
  );

  const loadAvailableModels = useCallback(async () => {
    try {
      const models = await usageCostService.getUsedModels();
      setModelFilter((prev) => ({
        ...prev,
        availableModels: models
      }));
    } catch (err) {
      console.error('Error loading available models:', err);
    }
  }, []);

  const handleTimeRangeChange = useCallback(
    (value: TimeRange) => {
      setFilters((prev) => ({ ...prev, timeRange: value }));
      loadAnalytics(value, modelFilter.selectedModels);
    },
    [loadAnalytics, modelFilter.selectedModels]
  );

  const handleModelSelectionChange = useCallback(
    (modelName: string, checked: boolean) => {
      const newSelectedModels = checked
        ? [...modelFilter.selectedModels, modelName]
        : modelFilter.selectedModels.filter((m) => m !== modelName);

      setModelFilter((prev) => ({
        ...prev,
        selectedModels: newSelectedModels
      }));

      setFilters((prev) => ({ ...prev, selectedModels: newSelectedModels }));
      loadAnalytics(filters.timeRange, newSelectedModels);
    },
    [filters.timeRange, loadAnalytics, modelFilter.selectedModels]
  );

  const handleSelectAllModels = useCallback(() => {
    const allSelected = modelFilter.selectedModels.length === modelFilter.availableModels.length;
    const newSelectedModels = allSelected ? [] : [...modelFilter.availableModels];

    setModelFilter((prev) => ({
      ...prev,
      selectedModels: newSelectedModels
    }));

    setFilters((prev) => ({ ...prev, selectedModels: newSelectedModels }));
    loadAnalytics(filters.timeRange, newSelectedModels);
  }, [filters.timeRange, loadAnalytics, modelFilter.availableModels, modelFilter.selectedModels]);

  const clearAllFilters = useCallback(() => {
    setModelFilter((prev) => ({
      ...prev,
      selectedModels: []
    }));
    setFilters((prev) => ({ ...prev, selectedModels: [] }));
    loadAnalytics(filters.timeRange, []);
  }, [filters.timeRange, loadAnalytics]);

  const hasActiveFilters = useCallback(() => {
    return (
      modelFilter.selectedModels.length > 0 &&
      modelFilter.selectedModels.length < modelFilter.availableModels.length
    );
  }, [modelFilter.availableModels.length, modelFilter.selectedModels.length]);

  // Load initial data when dialog opens
  useEffect(() => {
    if (open) {
      loadAvailableModels();
      loadAnalytics(filters.timeRange, []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return {
    isLoading,
    error,
    filters,
    modelFilter,
    analytics,
    chartData,
    handleTimeRangeChange,
    handleModelSelectionChange,
    handleSelectAllModels,
    clearAllFilters,
    hasActiveFilters: hasActiveFilters(),
    loadAnalytics
  };
};
