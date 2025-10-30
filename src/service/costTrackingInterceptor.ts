import { usageCostService } from './usageCostService';
import { ModelAI, STORAGE_KEY_MODEL } from '@/src/types/model';

export type TaskType = 'chat' | 'translate' | 'enhance-prompt' | 'generate-data';

/**
 * Cost tracking interceptor for capturing token usage from AI service calls
 */
export class CostTrackingInterceptor {
    private static instance: CostTrackingInterceptor;

    private constructor() { }

    public static getInstance(): CostTrackingInterceptor {
        if (!CostTrackingInterceptor.instance) {
            CostTrackingInterceptor.instance = new CostTrackingInterceptor();
        }
        return CostTrackingInterceptor.instance;
    }

    /**
     * Get the currently selected model from localStorage
     */
    private getCurrentModel(): ModelAI {
        const modelSelected = localStorage.getItem(STORAGE_KEY_MODEL);

        // Default fallback model
        const defaultModel: ModelAI = {
            id: 1,
            model: 'gpt-4.1',
            name: 'gpt-4.1',
            description: 'Flagship GPT model for complex tasks',
            priceInput: 2.0,
            priceOutput: 8.0
        };

        if (modelSelected) {
            try {
                return JSON.parse(modelSelected);
            } catch (error) {
                console.warn('Failed to parse selected model from localStorage:', error);
                return defaultModel;
            }
        }

        return defaultModel;
    }

    /**
     * Extract token usage from AI SDK response objects
     */
    private extractTokenUsage(result: unknown): { inputTokens: number; outputTokens: number } | null {
        try {
            // Handle different response formats from AI SDK
            let usage = null;

            // Type guard to check if result is an object
            if (result && typeof result === 'object') {
                const resultObj = result as Record<string, unknown>;

                // Check for usage in different possible locations
                if (resultObj.usage && typeof resultObj.usage === 'object') {
                    usage = resultObj.usage as Record<string, unknown>;
                } else if (resultObj.response && typeof resultObj.response === 'object') {
                    const response = resultObj.response as Record<string, unknown>;
                    if (response.usage && typeof response.usage === 'object') {
                        usage = response.usage as Record<string, unknown>;
                    }
                } else if (resultObj.experimental_providerMetadata && typeof resultObj.experimental_providerMetadata === 'object') {
                    const metadata = resultObj.experimental_providerMetadata as Record<string, unknown>;
                    if (metadata.usage && typeof metadata.usage === 'object') {
                        usage = metadata.usage as Record<string, unknown>;
                    }
                }
            }

            if (usage) {
                // Handle different usage format variations
                const inputTokens = usage.promptTokens || usage.inputTokens || usage.input_tokens || 0;
                const outputTokens = usage.completionTokens || usage.outputTokens || usage.output_tokens || 0;

                return {
                    inputTokens: Number(inputTokens) || 0,
                    outputTokens: Number(outputTokens) || 0
                };
            }

            return null;
        } catch (error) {
            console.warn('Failed to extract token usage from AI response:', error);
            return null;
        }
    }

    /**
     * Track token usage and record to database
     * Works with both generateText and streamText (via onFinish event)
     */
    public async trackUsage(result: unknown, taskType: TaskType): Promise<void> {
        try {
            const model = this.getCurrentModel();
            const tokenUsage = this.extractTokenUsage(result);

            if (tokenUsage && (tokenUsage.inputTokens > 0 || tokenUsage.outputTokens > 0)) {
                await usageCostService.recordUsage(
                    tokenUsage.inputTokens,
                    tokenUsage.outputTokens,
                    model.model,
                    taskType
                );
            }
        } catch (error) {
            console.warn('Failed to track usage:', error);
        }
    }
}

// Export singleton instance
export const costTrackingInterceptor = CostTrackingInterceptor.getInstance();