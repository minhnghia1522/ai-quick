import { STORAGE_KEY_OPENAI_API_KEY, STORAGE_KEY_GEMINI_API_KEY } from '@/src/types/model';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';

export const getProviderByModelName = (modelName: string) => {
  const openAiKey = localStorage.getItem(STORAGE_KEY_OPENAI_API_KEY);
  const geminiKey = localStorage.getItem(STORAGE_KEY_GEMINI_API_KEY);

  const openai = createOpenAI({
    apiKey: openAiKey || ''
  });

  const google = createGoogleGenerativeAI({
    apiKey: geminiKey || ''
  });

  return modelName.toLowerCase().includes('gemini') ? google(modelName) : openai.chat(modelName);
};

export const areAnyApiKeysAvailable = () => {
  const openAiKey = localStorage.getItem(STORAGE_KEY_OPENAI_API_KEY);
  const geminiKey = localStorage.getItem(STORAGE_KEY_GEMINI_API_KEY);

  return openAiKey || geminiKey;
};
