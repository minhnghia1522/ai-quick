import { createOpenAI } from '@ai-sdk/openai';
import { generateText, streamText } from 'ai';
import { DEFAULT_CHAT_MODEL } from '@/types/types';

export const OpenAIText = async ({ prompt }: { prompt: string }) => {
  const key = localStorage.getItem('apiKey');
  const openai = createOpenAI({
    compatibility: 'strict',
    apiKey: key || ''
  });

  const model = openai('o1-mini');

  try{
  const { text } = await generateText({
    model,
    prompt,
  });

  return text;
  } catch (error) {
    throw new Error(error as string);
  }
};

export const OpenAIStream = async ({ prompt }: { prompt: string }) => {
  const key = localStorage.getItem('apiKey')
  const modelSelected = localStorage.getItem('model');
  const openai = createOpenAI({
    compatibility: 'strict',
    apiKey: key || ''
  });

  const model = openai(modelSelected || DEFAULT_CHAT_MODEL);

  return streamText({
    model,
    prompt,
    onError({ error }) {
      throw new Error(error as string);
    }
  });
};