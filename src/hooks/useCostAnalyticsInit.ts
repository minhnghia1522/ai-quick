import { useEffect } from 'react';
import { useAppStore } from '@/src/store';
import { usageCostStore } from '@/src/lib/database/usageCostDB';

/**
 * Hook to initialize the cost analytics system on app startup
 * This hook should be used in the main layout component
 */
export const useCostAnalyticsInit = () => {
    const { refreshCosts, setLoading } = useAppStore();

    useEffect(() => {
        const initializeCostAnalytics = async () => {
            try {
                setLoading(true);

                // Initialize IndexedDB and ensure database schema is set up
                await usageCostStore.getAllUsageRecords();

                // Load existing usage data and initialize total cost in the store
                await refreshCosts();

                // Perform any necessary data cleanup (remove records older than 1 year)
                await usageCostStore.clearOldRecords(365);

                console.log('Cost analytics system initialized successfully');
            } catch (error) {
                console.error('Failed to initialize cost analytics system:', error);

                // Even if initialization fails, we should still try to set a default state
                try {
                    await refreshCosts();
                } catch (fallbackError) {
                    console.error('Fallback initialization also failed:', fallbackError);
                }
            } finally {
                setLoading(false);
            }
        };

        initializeCostAnalytics();
    }, [refreshCosts, setLoading]);
};