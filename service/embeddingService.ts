import { createOpenAI } from '@ai-sdk/openai';

const enum OPENAI_EMBEDDING_MODELS {
  'text-embedding-3-small' = 'text-embedding-3-small',
  'text-embedding-3-large' = 'text-embedding-3-large',
  'text-embedding-ada-002' = 'text-embedding-ada-002'
}

export const getEmbedding = async ({ values }: { values: string[] }): Promise<number[][]> => {
  const key = localStorage.getItem('apiKey');
  const openai = createOpenAI({
    compatibility: 'strict',
    apiKey: key || ''
  });

  const model = openai.textEmbeddingModel(OPENAI_EMBEDDING_MODELS['text-embedding-3-small']);

  const result = await model.doEmbed({ values });
  return result.embeddings;
};
