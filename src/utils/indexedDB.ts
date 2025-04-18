/* eslint-disable @typescript-eslint/no-unused-vars */
import { ValueEmbedding } from '@/types/chunk';

// Database configuration
const DB_NAME = 'embeddingData';
const DB_VERSION = 1;

// Store names
export enum StoreNames {
  EMBEDDINGS = 'embeddingData'
}

/**
 * Opens a connection to the IndexedDB database
 */
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(StoreNames.EMBEDDINGS)) {
        const store = db.createObjectStore(StoreNames.EMBEDDINGS, { keyPath: 'id' });
        // Add indices for faster lookups
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
};

/**
 * IndexedDB wrapper for embedding storage
 */
export const EmbeddingStore = {
  /**
   * Store an embedding in IndexedDB
   */
  async saveEmbedding(embedding: ValueEmbedding): Promise<void> {
    if (!embedding || !embedding.id) {
      throw new Error('Invalid embedding: missing required fields');
    }

    let db: IDBDatabase | null = null;
    try {
      db = await openDB();

      if (!db) {
        throw new Error('Failed to open database');
      }

      return new Promise<void>((resolve, reject) => {
        const transaction = db!.transaction([StoreNames.EMBEDDINGS], 'readwrite');
        const store = transaction.objectStore(StoreNames.EMBEDDINGS);

        const request = store.put(embedding);

        request.onsuccess = () => resolve();
        request.onerror = (event) => {
          const error = (event.target as IDBRequest).error;
          reject(new Error(`Failed to save embedding: ${error?.message || 'Unknown error'}`));
        };

        transaction.oncomplete = () => {
          if (db) db.close();
        };

        transaction.onerror = (event) => {
          const error = transaction.error;
          reject(new Error(`Transaction error while saving embedding: ${error?.message || 'Unknown error'}`));
        };

        transaction.onabort = (event) => {
          reject(
            new Error(`Transaction aborted while saving embedding: ${transaction.error?.message || 'Unknown reason'}`)
          );
        };
      });
    } catch (error) {
      if (db) db.close();
      throw error instanceof Error ? error : new Error(`Unexpected error while saving embedding: ${String(error)}`);
    }
  },

  /**
   * Save multiple embeddings in a batch operation
   */
  async saveEmbeddings(embeddings: ValueEmbedding[]): Promise<void> {
    if (embeddings.length === 0) return;

    // Validate all embeddings
    for (const embedding of embeddings) {
      if (!embedding || !embedding.id) {
        throw new Error('Invalid embedding in batch: missing required fields');
      }
    }

    let db: IDBDatabase | null = null;
    try {
      db = await openDB();

      if (!db) {
        throw new Error('Failed to open database');
      }

      return new Promise<void>((resolve, reject) => {
        const transaction = db!.transaction([StoreNames.EMBEDDINGS], 'readwrite');
        const store = transaction.objectStore(StoreNames.EMBEDDINGS);

        let completed = 0;
        let hasError = false;
        let errorMessage = '';

        embeddings.forEach((embedding) => {
          const request = store.put(embedding);

          request.onsuccess = () => {
            completed++;
            if (completed === embeddings.length && !hasError) {
              resolve();
            }
          };

          request.onerror = (event) => {
            if (!hasError) {
              hasError = true;
              const error = (event.target as IDBRequest).error;
              errorMessage = `Failed to save embedding with ID ${embedding.id}: ${error?.message || 'Unknown error'}`;
              reject(new Error(errorMessage));
            }
          };
        });

        transaction.oncomplete = () => {
          if (db) db.close();
        };

        transaction.onerror = (event) => {
          if (!hasError) {
            hasError = true;
            const error = transaction.error;
            reject(new Error(`Transaction error while saving embeddings batch: ${error?.message || 'Unknown error'}`));
          }
        };

        transaction.onabort = (event) => {
          if (!hasError) {
            hasError = true;
            reject(
              new Error(
                `Transaction aborted while saving embeddings batch: ${transaction.error?.message || 'Unknown reason'}`
              )
            );
          }
        };
      });
    } catch (error) {
      if (db) db.close();
      throw error instanceof Error
        ? error
        : new Error(`Unexpected error while saving embeddings batch: ${String(error)}`);
    }
  },

  /**
   * Retrieve an embedding by ID
   */
  async getEmbedding(id: string): Promise<ValueEmbedding | null> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([StoreNames.EMBEDDINGS], 'readonly');
      const store = transaction.objectStore(StoreNames.EMBEDDINGS);

      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        reject(new Error('Failed to retrieve embedding'));
      };

      transaction.oncomplete = () => db.close();
    });
  },

  /**
   * Get all stored embeddings
   */
  async getAllEmbeddings(): Promise<ValueEmbedding[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([StoreNames.EMBEDDINGS], 'readonly');
      const store = transaction.objectStore(StoreNames.EMBEDDINGS);

      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(new Error('Failed to retrieve embeddings'));
      };

      transaction.oncomplete = () => db.close();
    });
  },

  /**
   * Delete an embedding by ID
   */
  async deleteEmbedding(id: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([StoreNames.EMBEDDINGS], 'readwrite');
      const store = transaction.objectStore(StoreNames.EMBEDDINGS);

      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to delete embedding'));

      transaction.oncomplete = () => db.close();
    });
  },

  /**
   * Delete all embeddings
   */
  async clearEmbeddings(): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([StoreNames.EMBEDDINGS], 'readwrite');
      const store = transaction.objectStore(StoreNames.EMBEDDINGS);

      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to clear embeddings'));

      transaction.oncomplete = () => db.close();
    });
  },

  /**
   * Utility function to find closest embeddings using cosine similarity
   * @param queryVector The vector to compare against
   * @param limit Maximum number of results to return
   * @param threshold Minimum similarity score (0 to 1)
   */
  async findSimilarEmbeddings(
    queryVector: number[],
    limit = 5,
    threshold = 0.7
  ): Promise<
    Array<{
      embedding: ValueEmbedding;
      similarity: number;
      matchDetails: {
        storedEmbeddingIndex: number;
        chunkIndex: number;
        text: string;
      };
    }>
  > {
    const allEmbeddings = await this.getAllEmbeddings();

    // Calculate cosine similarity between vectors
    const cosineSimilarity = (a: number[], b: number[]): number => {
      if (a.length !== b.length) throw new Error('Vectors must have the same length');

      let dotProduct = 0;
      let normA = 0;
      let normB = 0;

      for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
      }

      if (normA === 0 || normB === 0) return 0;
      return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    };

    // Calculate similarities for each embedding
    const results = allEmbeddings
      .map((embedding) => {
        // Find the highest similarity across all chunks in all stored embeddings
        let highestSimilarity = 0;
        let bestMatchDetails = {
          storedEmbeddingIndex: 0,
          chunkIndex: 0,
          text: ''
        };

        // Iterate through each StoredEmbedding in the embeddingData array
        embedding.embeddingData.forEach((storedEmbedding, storedIndex) => {
          // Iterate through each semantic chunk
          storedEmbedding.semantic_chunks.forEach((chunk, chunkIndex) => {
            // Calculate similarity with the current chunk's embedding
            const similarity = cosineSimilarity(queryVector, chunk.combined_sentence_embedding);
            // Keep track of the highest similarity found
            if (similarity > highestSimilarity) {
              highestSimilarity = similarity;
              bestMatchDetails = {
                storedEmbeddingIndex: storedIndex,
                chunkIndex: chunkIndex,
                text: chunk.combined_sentence
              };
            }
          });
        });

        return {
          embedding,
          similarity: highestSimilarity,
          matchDetails: bestMatchDetails
        };
      })
      .filter((result) => result.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return results;
  },

  /**
   * Find the most similar semantic chunks to a query vector
   * @param queryVector The vector to compare against
   * @param limit Maximum number of results to return
   * @param threshold Minimum similarity score (0 to 1)
   */
  async findSimilarChunks(
    queryVector: number[],
    limit = 5,
    threshold = 0.7
  ): Promise<
    Array<{
      embeddingId: string;
      chunk: {
        text: string;
        similarity: number;
      };
    }>
  > {
    const allEmbeddings = await this.getAllEmbeddings();
    const flatResults: Array<{
      embeddingId: string;
      chunk: {
        text: string;
        similarity: number;
      };
    }> = [];

    // Calculate cosine similarity between vectors
    const cosineSimilarity = (a: number[], b: number[]): number => {
      if (a.length !== b.length) throw new Error('Vectors must have the same length');

      let dotProduct = 0;
      let normA = 0;
      let normB = 0;

      for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
      }

      if (normA === 0 || normB === 0) return 0;
      return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    };

    // Flatten all chunks from all embeddings and calculate similarity
    allEmbeddings.forEach((embedding) => {
      embedding.embeddingData.forEach((storedEmbedding) => {
        storedEmbedding.semantic_chunks.forEach((chunk) => {
          const similarity = cosineSimilarity(queryVector, chunk.combined_sentence_embedding);

          if (similarity >= threshold) {
            flatResults.push({
              embeddingId: embedding.id,
              chunk: {
                text: chunk.combined_sentence,
                similarity: similarity
              }
            });
          }
        });
      });
    });

    // Sort by similarity and limit results
    return flatResults.sort((a, b) => b.chunk.similarity - a.chunk.similarity).slice(0, limit);
  }
};
