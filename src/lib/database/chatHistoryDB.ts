import { UIMessage } from '@/src/types/messages';
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface ChatHistory {
  id: string;
  messages: UIMessage[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatHistoryDBSchema extends DBSchema {
  chatHistory: {
    key: string;
    value: ChatHistory;
    indexes: { updatedAt: Date };
  };
}

class ChatHistoryStore {
  private readonly storeName = 'chatHistory';
  private readonly dbName = 'chatHistoryDB';
  private readonly version = 1;

  private async getDB(): Promise<IDBPDatabase<ChatHistoryDBSchema>> {
    return openDB<ChatHistoryDBSchema>(this.dbName, this.version, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('chatHistory')) {
          const store = db.createObjectStore('chatHistory', { keyPath: 'id' });
          store.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
      }
    });
  }

  async saveChatHistory(chatHistory: ChatHistory): Promise<void> {
    const db = await this.getDB();
    await db.put(this.storeName, chatHistory);
  }

  async getChatHistory(id: string): Promise<ChatHistory | null> {
    const db = await this.getDB();
    const result = await db.get(this.storeName, id);
    return result ?? null;
  }

  async getAllChatHistories(): Promise<ChatHistory[]> {
    const db = await this.getDB();
    return db.getAll(this.storeName);
  }

  async deleteChatHistory(id: string): Promise<void> {
    const db = await this.getDB();
    await db.delete(this.storeName, id);
  }
}

export const chatHistoryStore = new ChatHistoryStore();
export type { ChatHistory };
