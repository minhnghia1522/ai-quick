export interface UsageRecord {
  id: string;
  timestamp: Date;
  modelName: string;
  inputTokens: number;
  outputTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
  taskType: 'chat' | 'translate' | 'enhance-prompt' | 'generate-data';
}

export interface UsageAnalytics {
  totalCost: number;
  totalTasks: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  modelBreakdown: Record<string, {
    cost: number;
    tasks: number;
    inputTokens: number;
    outputTokens: number;
  }>;
  taskTypeBreakdown: Record<string, {
    cost: number;
    tasks: number;
  }>;
}

export interface UsageFilter {
  timeRange: 'today' | '7days' | '30days' | '90days';
  models: string[];
  taskTypes: ('chat' | 'translate' | 'enhance-prompt' | 'generate-data')[];
}