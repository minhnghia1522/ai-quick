import { DBSchema, IDBPDatabase, openDB } from 'idb';

const DB_NAME = 'file-storage';
const STORE_NAME = 'pdfs';
const DB_VERSION = 1;

interface EmbeddingData {
  content: string;
  embedding?: number[];
  chunkIndex: number;
  page?: number;
  startLine?: number;
  endLine?: number;
}

export interface FileData {
  id: string;
  filename: string;
  type: string;
  size: number;
  lastModified: number;
  blob?: Blob;
  embedding?: EmbeddingData[];
}

interface FileDataBSchema extends DBSchema {
  [STORE_NAME]: {
    key: string;
    value: FileData[];
    indexes: { createdAt: Date };
  };
}

const getDB = async (): Promise<IDBPDatabase<FileDataBSchema>> => {
  return openDB<FileDataBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME); // Không dùng keyPath, dùng out-of-line key
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    }
  });
};

export const FileStore = {
  async saveFile(chatId: string, file: FileData[]): Promise<void> {
    const db = await getDB();
    await db.put(STORE_NAME, file, chatId);
  },

  async getFileByChatId(chatId: string): Promise<FileData[]> {
    const db = await getDB();
    const result = await db.get(STORE_NAME, chatId);
    return result ?? [];
  },

  async deleteFileByFileId(chatId: string, fileId: string): Promise<void> {
    const db = await getDB();
    const oldFiles = (await db.get(STORE_NAME, chatId)) ?? [];
    const updatedFiles = oldFiles.filter((f: FileData) => f.id !== fileId); // Assuming 'id' field
    await db.put(STORE_NAME, updatedFiles, chatId);
  },

  async deleteFileByChatId(chatId: string): Promise<void> {
    const db = await getDB();
    await db.delete(STORE_NAME, chatId);
  },

  async findSimilarEmbeddings(
    chatId: string,
    queryVector: number[],
    limit = 5,
    threshold = 0.1
  ): Promise<
    Array<{
      similarity: number;
      matchData: FileData[];
    }>
  > {
    const allFile = await this.getFileByChatId(chatId);

    // Calculate cosine similarity between vectors
    function cosineSimilarity(vec1: number[], vec2: number[]): number {
      const dot = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
      const norm1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
      const norm2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
      return dot / (norm1 * norm2);
    }

    // Calculate similarities for each embedding
    const results = allFile
      .map((fileData) => {
        // Find the highest similarity across all chunks in all stored embeddings
        let highestSimilarity = 0;
        let matchEmbedding: EmbeddingData = {
          content: '',
          chunkIndex: 0
        };

        // Iterate through each StoredEmbedding in the embeddingData array
        fileData.embedding?.forEach((embeddingData) => {
          if (embeddingData.embedding) {
            const similarity = cosineSimilarity(queryVector, embeddingData.embedding);
            if (similarity > highestSimilarity) {
              highestSimilarity = similarity;
              matchEmbedding = embeddingData;
            }
          }
        });

        return {
          similarity: highestSimilarity,
          matchData: [{ ...fileData, blob: undefined, embedding: [{ ...matchEmbedding, embedding: undefined }] }]
        };
      })
      .filter((result) => result.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return results;
  }
};
