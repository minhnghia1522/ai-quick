import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { JapaneseLearningCacheEntry } from '@/src/types/japaneseLearning';

interface JapaneseLearningDBSchema extends DBSchema {
  japaneseLearningEntries: {
    key: string;
    value: JapaneseLearningCacheEntry;
    indexes: { updatedAt: string };
  };
}

const CACHE_VERSION = 'v1';

const normalizeJapaneseLearningText = (text: string) => text.trim().replace(/\s+/g, ' ');

const hashText = (text: string) => {
  let hash = 2166136261;

  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36);
};

export const getJapaneseLearningCacheId = (text: string) => {
  const normalizedText = normalizeJapaneseLearningText(text);
  return `${CACHE_VERSION}:${normalizedText.length}:${hashText(normalizedText)}`;
};

class JapaneseLearningStore {
  private readonly storeName = 'japaneseLearningEntries';
  private readonly dbName = 'japaneseLearningDB';
  private readonly version = 1;

  private async getDB(): Promise<IDBPDatabase<JapaneseLearningDBSchema>> {
    return openDB<JapaneseLearningDBSchema>(this.dbName, this.version, {
      upgrade: (db) => {
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
      }
    });
  }

  async getEntry(text: string): Promise<JapaneseLearningCacheEntry | null> {
    const normalizedText = normalizeJapaneseLearningText(text);
    const db = await this.getDB();
    const result = await db.get(this.storeName, getJapaneseLearningCacheId(text));

    if (!result || result.normalizedText !== normalizedText) {
      return null;
    }

    return result;
  }

  async saveEntry(selectedText: string, content: string): Promise<void> {
    const normalizedText = normalizeJapaneseLearningText(selectedText);
    const now = new Date().toISOString();
    const existingEntry = await this.getEntry(selectedText);
    const db = await this.getDB();

    await db.put(this.storeName, {
      id: getJapaneseLearningCacheId(selectedText),
      normalizedText,
      selectedText,
      content,
      createdAt: existingEntry?.createdAt ?? now,
      updatedAt: now
    });
  }
}

export const japaneseLearningStore = new JapaneseLearningStore();
