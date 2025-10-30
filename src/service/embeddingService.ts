import { createOpenAI } from '@ai-sdk/openai';
import { usageCostService } from './usageCostService';

const enum OPENAI_EMBEDDING_MODELS {
  'text-embedding-3-small' = 'text-embedding-3-small',
  'text-embedding-3-large' = 'text-embedding-3-large',
  'text-embedding-ada-002' = 'text-embedding-ada-002'
}



export const getEmbedding = async ({ values }: { values: string[] }): Promise<number[][]> => {
  const key = localStorage.getItem('apiKey');
  if (!key) {
    throw new Error('API key is missing');
  }
  const openai = createOpenAI({
    apiKey: key || ''
  });

  const modelName = OPENAI_EMBEDDING_MODELS['text-embedding-3-small'];
  const model = openai.textEmbeddingModel(modelName);

  try {
    const { embeddings, usage } = await model.doEmbed({
      values
    });

    // Track usage for cost analytics if usage data is available
    if (usage && usage.tokens) {
      try {
        const inputTokens = usage.tokens;
        const outputTokens = 0; // Embeddings don't have output tokens

        // Record usage with the embedding model
        await usageCostService.recordUsage(
          inputTokens,
          outputTokens,
          modelName,
          'chat' // Embeddings are typically used for chat/RAG functionality
        );
      } catch (trackingError) {
        console.warn('Failed to track embedding usage:', trackingError);
      }
    }

    return embeddings;
  } catch (error) {
    throw new Error(error as string);
  }
};
