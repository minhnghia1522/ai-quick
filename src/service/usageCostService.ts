import { ModelAI, openAIModels, geminiModels } from '@/src/types/model';
import { UsageRecord, UsageAnalytics, UsageFilter } from '@/src/types/usage';
import { usageCostStore } from '@/src/lib/database/usageCostDB';

export class UsageCostService {
    private static instance: UsageCostService;

    private constructor() { }

    public static getInstance(): UsageCostService {
        if (!UsageCostService.instance) {
            UsageCostService.instance = new UsageCostService();
        }
        return UsageCostService.instance;
    }

    /**
     * Calculate cost based on token usage and model pricing
     */
    public calculateCost(
        inputTokens: number,
        outputTokens: number,
        model: ModelAI
    ): { inputCost: number; outputCost: number; totalCost: number } {
        // Prices are per million tokens, so divide by 1,000,000
        const inputCost = (inputTokens / 1000000) * model.priceInput;
        const outputCost = (outputTokens / 1000000) * model.priceOutput;
        const totalCost = inputCost + outputCost;

        return {
            inputCost: Number(inputCost.toFixed(6)),
            outputCost: Number(outputCost.toFixed(6)),
            totalCost: Number(totalCost.toFixed(6))
        };
    }

    /**
     * Find model by name from available models
     */
    private findModelByName(modelName: string): ModelAI | null {
        const allModels = [...openAIModels, ...geminiModels];
        const foundModel = allModels.find(model => model.model === modelName);

        if (foundModel) {
            return foundModel;
        }

        // Handle embedding models that might not be in the standard model list
        if (modelName.includes('embedding')) {
            // Create a mock model for embedding models with appropriate pricing
            const embeddingPricing = {
                'text-embedding-3-small': { priceInput: 0.02, priceOutput: 0 },
                'text-embedding-3-large': { priceInput: 0.13, priceOutput: 0 },
                'text-embedding-ada-002': { priceInput: 0.10, priceOutput: 0 }
            };

            const pricing = embeddingPricing[modelName as keyof typeof embeddingPricing];
            if (pricing) {
                return {
                    id: 999,
                    model: modelName,
                    name: modelName,
                    description: 'Embedding model',
                    priceInput: pricing.priceInput,
                    priceOutput: pricing.priceOutput
                } as ModelAI;
            }
        }

        return null;
    }

    /**
     * Record new usage data
     */
    public async recordUsage(
        inputTokens: number,
        outputTokens: number,
        modelName: string,
        taskType: 'chat' | 'translate' | 'enhance-prompt' | 'generate-data'
    ): Promise<UsageRecord> {
        const model = this.findModelByName(modelName);
        if (!model) {
            throw new Error(`Unknown model: ${modelName}`);
        }

        const costs = this.calculateCost(inputTokens, outputTokens, model);

        const usageRecord: UsageRecord = {
            id: `usage_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
            timestamp: new Date(),
            modelName,
            inputTokens,
            outputTokens,
            inputCost: costs.inputCost,
            outputCost: costs.outputCost,
            totalCost: costs.totalCost,
            taskType
        };

        await usageCostStore.saveUsageRecord(usageRecord);
        return usageRecord;
    }

    /**
     * Get total accumulated cost across all usage
     */
    public async getTotalCost(): Promise<number> {
        return await usageCostStore.getTotalCost();
    }
    /**

     * Get analytics data with optional filtering
     */
    public async getAnalytics(filter?: Partial<UsageFilter>): Promise<UsageAnalytics> {
        const records = filter
            ? await usageCostStore.getFilteredUsageRecords(filter)
            : await usageCostStore.getAllUsageRecords();

        const analytics: UsageAnalytics = {
            totalCost: 0,
            totalTasks: records.length,
            totalInputTokens: 0,
            totalOutputTokens: 0,
            modelBreakdown: {},
            taskTypeBreakdown: {}
        };

        // Aggregate data from all records
        for (const record of records) {
            // Update totals
            analytics.totalCost += record.totalCost;
            analytics.totalInputTokens += record.inputTokens;
            analytics.totalOutputTokens += record.outputTokens;

            // Update model breakdown
            if (!analytics.modelBreakdown[record.modelName]) {
                analytics.modelBreakdown[record.modelName] = {
                    cost: 0,
                    tasks: 0,
                    inputTokens: 0,
                    outputTokens: 0
                };
            }
            analytics.modelBreakdown[record.modelName].cost += record.totalCost;
            analytics.modelBreakdown[record.modelName].tasks += 1;
            analytics.modelBreakdown[record.modelName].inputTokens += record.inputTokens;
            analytics.modelBreakdown[record.modelName].outputTokens += record.outputTokens;

            // Update task type breakdown
            if (!analytics.taskTypeBreakdown[record.taskType]) {
                analytics.taskTypeBreakdown[record.taskType] = {
                    cost: 0,
                    tasks: 0
                };
            }
            analytics.taskTypeBreakdown[record.taskType].cost += record.totalCost;
            analytics.taskTypeBreakdown[record.taskType].tasks += 1;
        }

        // Round totals to avoid floating point precision issues
        analytics.totalCost = Number(analytics.totalCost.toFixed(6));

        // Round model breakdown costs
        Object.keys(analytics.modelBreakdown).forEach(model => {
            analytics.modelBreakdown[model].cost = Number(analytics.modelBreakdown[model].cost.toFixed(6));
        });

        // Round task type breakdown costs
        Object.keys(analytics.taskTypeBreakdown).forEach(taskType => {
            analytics.taskTypeBreakdown[taskType].cost = Number(analytics.taskTypeBreakdown[taskType].cost.toFixed(6));
        });

        return analytics;
    }

    /**
     * Get analytics filtered by time range
     */
    public async getAnalyticsByTimeRange(
        timeRange: 'today' | '7days' | '30days' | '90days'
    ): Promise<UsageAnalytics> {
        return this.getAnalytics({ timeRange });
    }

    /**
     * Get analytics filtered by specific models
     */
    public async getAnalyticsByModels(models: string[]): Promise<UsageAnalytics> {
        return this.getAnalytics({ models });
    }

    /**
     * Get analytics filtered by task types
     */
    public async getAnalyticsByTaskTypes(
        taskTypes: ('chat' | 'translate' | 'enhance-prompt' | 'generate-data')[]
    ): Promise<UsageAnalytics> {
        return this.getAnalytics({ taskTypes });
    }

    /**
     * Get list of all models that have been used
     */
    public async getUsedModels(): Promise<string[]> {
        const records = await usageCostStore.getAllUsageRecords();
        const models = new Set<string>();
        records.forEach(record => models.add(record.modelName));
        return Array.from(models).sort();
    }

    /**
     * Get list of all task types that have been used
     */
    public async getUsedTaskTypes(): Promise<string[]> {
        const records = await usageCostStore.getAllUsageRecords();
        const taskTypes = new Set<string>();
        records.forEach(record => taskTypes.add(record.taskType));
        return Array.from(taskTypes).sort();
    }

    /**
     * Export all usage data for backup purposes
     */
    public async exportUsageData(): Promise<UsageRecord[]> {
        return await usageCostStore.getAllUsageRecords();
    }

    /**
     * Clear old usage records to manage storage
     */
    public async clearOldRecords(daysToKeep: number = 365): Promise<void> {
        await usageCostStore.clearOldRecords(daysToKeep);
    }
}

// Export singleton instance
export const usageCostService = UsageCostService.getInstance();