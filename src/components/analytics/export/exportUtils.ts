import { UsageRecord, UsageAnalytics } from '@/src/types/usage';
import { FilterState, ModelFilterState } from '../types/analytics.types';

/**
 * Export usage data as JSON file
 */
export const exportAsJson = (
  records: UsageRecord[],
  analytics: UsageAnalytics,
  filters: FilterState,
  modelFilter: ModelFilterState
): void => {
  const exportData = {
    exportDate: new Date().toISOString(),
    summary: {
      totalRecords: records.length,
      totalCost: analytics.totalCost,
      totalTasks: analytics.totalTasks,
      totalInputTokens: analytics.totalInputTokens,
      totalOutputTokens: analytics.totalOutputTokens,
      dateRange: {
        from:
          records.length > 0
            ? new Date(Math.min(...records.map((r) => new Date(r.timestamp).getTime()))).toISOString()
            : null,
        to:
          records.length > 0
            ? new Date(Math.max(...records.map((r) => new Date(r.timestamp).getTime()))).toISOString()
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
    records: records.map((record) => ({
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
};

/**
 * Export usage data as CSV file
 */
export const exportAsCsv = (records: UsageRecord[]): void => {
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

  const csvRows = records.map((record) => [
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
};
