/* eslint-disable @typescript-eslint/no-explicit-any */
// Interface for stored embedding objects
export interface StoredEmbedding {
  embeddingId: string;
  object: string;
  metadata?: Record<string, any>;
  semantic_chunks: {
    combined_sentence: string;
    combined_sentence_embedding: number[];
  }[];
}

export interface ValueEmbedding {
  id: string;
  embeddingData: StoredEmbedding[];
}
