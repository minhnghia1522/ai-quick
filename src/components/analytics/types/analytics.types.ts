export type TimeRange = 'today' | '7days' | '30days' | '90days';
export type ChartMetric = 'tokens' | 'cost' | 'tasks';

export interface FilterState {
  timeRange: TimeRange;
  selectedModels: string[];
}

export interface ModelFilterState {
  availableModels: string[];
  selectedModels: string[];
}

export interface ChartDataPoint {
  period: string;
  tokens: number;
  cost: number;
  tasks: number;
  timestamp: Date;
}

export interface TimeRangeOption {
  value: TimeRange;
  label: string;
}
