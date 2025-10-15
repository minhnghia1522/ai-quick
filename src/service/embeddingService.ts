import { createOpenAI } from '@ai-sdk/openai';

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

  const model = openai.textEmbeddingModel(OPENAI_EMBEDDING_MODELS['text-embedding-3-small']);

  try {
    const { embeddings } = await model.doEmbed({
      values
    });
    return embeddings;
  } catch (error) {
    throw new Error(error as string);
  }
};
