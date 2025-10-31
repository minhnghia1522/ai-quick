import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { UsageRecord, UsageFilter } from '@/src/types/usage';

interface UsageCostDBSchema extends DBSchema {
    usageRecords: {
        key: string;
        value: UsageRecord;
        indexes: {
            timestamp: Date;
            modelName: string;
            taskType: string;
        };
    };
}

class UsageCostStore {
    private readonly storeName = 'usageRecords';
    private readonly dbName = 'usageCostDB';
    private readonly version = 1;

    private async getDB(): Promise<IDBPDatabase<UsageCostDBSchema>> {
        return openDB<UsageCostDBSchema>(this.dbName, this.version, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('usageRecords')) {
                    const store = db.createObjectStore('usageRecords', { keyPath: 'id' });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                    store.createIndex('modelName', 'modelName', { unique: false });
                    store.createIndex('taskType', 'taskType', { unique: false });
                }
            }
        });
    }

    async saveUsageRecord(usageRecord: UsageRecord): Promise<void> {
        const db = await this.getDB();
        await db.put(this.storeName, usageRecord);
    }

    async getUsageRecord(id: string): Promise<UsageRecord | null> {
        const db = await this.getDB();
        const result = await db.get(this.storeName, id);
        return result ?? null;
    }

    async getAllUsageRecords(): Promise<UsageRecord[]> {
        const db = await this.getDB();
        return db.getAll(this.storeName);
    }

    async getFilteredUsageRecords(filter: Partial<UsageFilter>): Promise<UsageRecord[]> {
        const db = await this.getDB();
        let records = await db.getAll(this.storeName);

        // Apply time range filter
        if (filter.timeRange) {
            const now = new Date();
            let startDate: Date;

            switch (filter.timeRange) {
                case 'today':
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    break;
                case '7days':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case '30days':
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                case '90days':
                    startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    startDate = new Date(0);
            }

            records = records.filter(record => record.timestamp >= startDate);
        }

        // Apply model filter
        if (filter.models && filter.models.length > 0) {
            records = records.filter(record => filter.models!.includes(record.modelName));
        }

        // Apply task type filter
        if (filter.taskTypes && filter.taskTypes.length > 0) {
            records = records.filter(record => filter.taskTypes!.includes(record.taskType));
        }

        return records;
    }

    async deleteUsageRecord(id: string): Promise<void> {
        const db = await this.getDB();
        await db.delete(this.storeName, id);
    }

    async getTotalCost(): Promise<number> {
        const records = await this.getAllUsageRecords();
        return records.reduce((total, record) => total + record.totalCost, 0);
    }

    async clearOldRecords(daysToKeep: number = 365): Promise<void> {
        const db = await this.getDB();
        const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

        const tx = db.transaction(this.storeName, 'readwrite');
        const store = tx.objectStore(this.storeName);
        const index = store.index('timestamp');

        const range = IDBKeyRange.upperBound(cutoffDate);
        const cursor = await index.openCursor(range);

        const keysToDelete: string[] = [];
        let currentCursor = cursor;

        while (currentCursor) {
            keysToDelete.push(currentCursor.primaryKey);
            currentCursor = await currentCursor.continue();
        }

        for (const key of keysToDelete) {
            await store.delete(key);
        }

        await tx.done;
    }
}

export const usageCostStore = new UsageCostStore();
export type { UsageRecord };