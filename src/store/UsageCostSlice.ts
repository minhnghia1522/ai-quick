import { SetState } from '.';
import { UsageAnalytics, UsageFilter } from '@/src/types/usage';
import { usageCostService } from '@/src/service/usageCostService';
export type UsageCostSlice = {
    // State
    totalCost: number;
    isLoading: boolean;
    cachedAnalytics: UsageAnalytics | null;
    lastCacheUpdate: Date | null;

    // Actions
    refreshTotalCost: () => Promise<void>;
    updateUsageData: (inputTokens: number, outputTokens: number, modelName: string, taskType: 'chat' | 'translate' | 'enhance-prompt' | 'generate-data') => Promise<void>;
    getAnalytics: (filter?: Partial<UsageFilter>) => Promise<UsageAnalytics>;
    clearCache: () => void;
    setLoading: (loading: boolean) => void;
};

const initData = {
    totalCost: 0,
    isLoading: false,
    cachedAnalytics: null,
    lastCacheUpdate: null
};

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

export const createUsageCostSlice = (
    set: SetState<UsageCostSlice>,
    get: () => UsageCostSlice
): UsageCostSlice => ({
    ...initData,

    refreshTotalCost: async () => {
        try {
            const totalCost = await usageCostService.getTotalCost();
            set({ totalCost });
        } catch (error) {
            console.error('Failed to refresh total cost:', error);
        }
    },

    updateUsageData: async (inputTokens, outputTokens, modelName, taskType) => {
        try {
            set({ isLoading: true });

            // Record the new usage
            await usageCostService.recordUsage(inputTokens, outputTokens, modelName, taskType);

            // Refresh total cost
            const totalCost = await usageCostService.getTotalCost();

            // Clear cache since we have new data
            set({
                totalCost,
                cachedAnalytics: null,
                lastCacheUpdate: null,
                isLoading: false
            });
        } catch (error) {
            console.error('Failed to update usage data:', error);
            set({ isLoading: false });
        }
    },

    getAnalytics: async (filter) => {
        const state = get();
        const now = new Date();

        // Check if we have valid cached data and no filter is applied
        if (
            !filter &&
            state.cachedAnalytics &&
            state.lastCacheUpdate &&
            (now.getTime() - state.lastCacheUpdate.getTime()) < CACHE_DURATION
        ) {
            return state.cachedAnalytics;
        }

        try {
            set({ isLoading: true });

            const analytics = await usageCostService.getAnalytics(filter);

            // Cache the result only if no filter was applied
            if (!filter) {
                set({
                    cachedAnalytics: analytics,
                    lastCacheUpdate: now,
                    isLoading: false
                });
            } else {
                set({ isLoading: false });
            }

            return analytics;
        } catch (error) {
            console.error('Failed to get analytics:', error);
            set({ isLoading: false });
            throw error;
        }
    },

    clearCache: () => {
        set({ cachedAnalytics: null, lastCacheUpdate: null });
    },

    setLoading: (loading: boolean) => {
        set({ isLoading: loading });
    }
});