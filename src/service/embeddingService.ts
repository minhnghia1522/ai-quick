import { createOpenAI } from '@ai-sdk/openai';
import { addFromUsage } from '@/src/utils/usageCost';

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

  const modelId = OPENAI_EMBEDDING_MODELS['text-embedding-3-small'];
  const model = openai.textEmbeddingModel(modelId);

  try {
    const result = await model.doEmbed({
      values
    });

    const rawUsage = result?.usage;
    const usage = rawUsage
      ? {
          input_tokens: rawUsage.tokens ?? 0,
          cached: Boolean((result as any)?.cached)
        }
      : null;

    if (usage && usage.input_tokens > 0) {
      addFromUsage('openai', modelId, usage, 'embedding');
    }

    return result.embeddings;
  } catch (error) {
    throw new Error(error as string);
  }
};
