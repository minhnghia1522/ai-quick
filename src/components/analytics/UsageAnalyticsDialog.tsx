'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import AppDialog from '../AppDialog';
import { FilterSidebar } from './filters/FilterSidebar';
import { SummaryCards } from './summary/SummaryCards';
import { ChartContainer } from './charts/ChartContainer';
import { ModelBreakdown } from './breakdown/ModelBreakdown';
import { TaskTypeBreakdown } from './breakdown/TaskTypeBreakdown';
import { LoadingState } from './states/LoadingState';
import { ErrorState } from './states/ErrorState';
import { exportAsJson, exportAsCsv } from './export/exportUtils';
import { useAnalyticsData } from './hooks/useAnalyticsData';
import { usageCostService } from '@/src/service/usageCostService';
import { ChartMetric, TimeRange, TimeRangeOption } from './types/analytics.types';

interface UsageAnalyticsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UsageAnalyticsDialog: React.FC<UsageAnalyticsDialogProps> = ({ open, onOpenChange }) => {
  const t = useTranslations('UsageAnalytics');
  const {
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
    hasActiveFilters,
    loadAnalytics
  } = useAnalyticsData(open);

  const [activeChartTab, setActiveChartTab] = useState<ChartMetric>('cost');
  const [isExporting, setIsExporting] = useState(false);

  const timeRangeOptions: TimeRangeOption[] = [
    { value: 'today', label: t('timeRange.today') },
    { value: '7days', label: t('timeRange.last7days') },
    { value: '30days', label: t('timeRange.last30days') },
    { value: '90days', label: t('timeRange.last90days') }
  ];

  const getTimeRangeLabel = (timeRange: TimeRange): string => {
    return timeRangeOptions.find((option) => option.value === timeRange)?.label || 'Unknown';
  };

  const handleExportData = async (format: 'json' | 'csv' = 'json') => {
    try {
      setIsExporting(true);

      // Get all usage records for export
      const allRecords = await usageCostService.exportUsageData();

      if (format === 'csv') {
        exportAsCsv(allRecords);
      } else {
        exportAsJson(allRecords, analytics, filters, modelFilter);
      }
    } catch (err) {
      console.error('Error exporting data:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const renderContent = () => {
    if (error) {
      return <ErrorState error={error} onRetry={() => loadAnalytics(filters.timeRange)} />;
    }

    if (isLoading) {
      return <LoadingState />;
    }

    return (
      <div className='space-y-6'>
        {/* Summary Cards */}
        <SummaryCards analytics={analytics} timeRange={filters.timeRange} getTimeRangeLabel={getTimeRangeLabel} />

        {/* Usage Trends Chart */}
        <ChartContainer
          data={chartData}
          timeRange={filters.timeRange}
          activeTab={activeChartTab}
          onTabChange={setActiveChartTab}
          getTimeRangeLabel={getTimeRangeLabel}
        />

        {/* Detailed Breakdown Section */}
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold'>{t('breakdown.title')}</h3>

          {/* Model Breakdown */}
          <ModelBreakdown
            modelBreakdown={analytics.modelBreakdown}
            totalCost={analytics.totalCost}
            timeRange={filters.timeRange}
            selectedModelsCount={modelFilter.selectedModels.length}
            availableModelsCount={modelFilter.availableModels.length}
            getTimeRangeLabel={getTimeRangeLabel}
          />

          {/* Task Type Breakdown */}
          <TaskTypeBreakdown
            taskTypeBreakdown={analytics.taskTypeBreakdown}
            totalCost={analytics.totalCost}
            selectedModelsCount={modelFilter.selectedModels.length}
            availableModelsCount={modelFilter.availableModels.length}
          />
        </div>
      </div>
    );
  };

  const bodyContent = (
    <>
      {/* Left Sidebar - Filters */}
      <div className='w-full lg:w-64 flex-shrink-0 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full dark:[&::-webkit-scrollbar-thumb]:bg-gray-600'>
        <FilterSidebar
          timeRange={filters.timeRange}
          onTimeRangeChange={handleTimeRangeChange}
          availableModels={modelFilter.availableModels}
          selectedModels={modelFilter.selectedModels}
          onModelToggle={handleModelSelectionChange}
          onSelectAllModels={handleSelectAllModels}
          onClearFilters={clearAllFilters}
          hasActiveFilters={hasActiveFilters}
          onExport={handleExportData}
          isExporting={isExporting}
          isLoading={isLoading}
        />
      </div>

      {/* Main Content Area */}
      <div className='flex-1 min-h-0 overflow-y-auto overflow-x-hidden pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full dark:[&::-webkit-scrollbar-thumb]:bg-gray-600'>
        {renderContent()}
      </div>
    </>
  );

  return (
    <AppDialog
      open={open}
      title={t('dialog.title')}
      description={t('dialog.description')}
      bodyContent={bodyContent}
      btnCloseName={t('buttons.close')}
      onOpenChange={onOpenChange}
      closeCallback={() => onOpenChange(false)}
      contentClassName='w-full max-w-[95vw] lg:max-w-[1400px] h-[90vh] !flex !flex-col p-0 !gap-0'
      headerClassName='px-6 pt-6 pb-4 flex-shrink-0'
      bodyClassName='flex-1 min-h-0 flex flex-col lg:flex-row gap-4 px-6 pb-4'
      footerClassName='px-6 pb-3 flex-shrink-0'
      hideSubmitButton={true}
    />
  );
};

export default UsageAnalyticsDialog;
