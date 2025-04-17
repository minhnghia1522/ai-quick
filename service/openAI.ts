import { OpenAIModel, STORAGE_KEY_MODEL } from '@/types/types';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText, streamText } from 'ai';

export const OpenAIText = async ({ prompt }: { prompt: string }) => {
  const key = localStorage.getItem('apiKey');
  const openai = createOpenAI({
    compatibility: 'strict',
    apiKey: key || ''
  });

  const model = openai('gpt-4.1');

  try {
    const { text } = await generateText({
      model,
      prompt
    });

    return text;
  } catch (error) {
    throw new Error(error as string);
  }
};

export const OpenAIStream = async (
  { system, prompt }: { prompt: string; system?: string },
  abortController: AbortSignal
) => {
  const key = localStorage.getItem('apiKey');
  const modelSelected = localStorage.getItem(STORAGE_KEY_MODEL);
  const openai = createOpenAI({
    compatibility: 'strict',
    apiKey: key || ''
  });

  let model = {
    id: 1,
    model: 'gpt-4.1',
    name: 'gpt-4.1',
    description: 'Flagship GPT model for complex tasks',
    priceInput: 2.0,
    priceOutput: 8.0
  } as OpenAIModel;

  if (modelSelected) {
    model = JSON.parse(modelSelected);
  }

  return streamText({
    model: openai(model.model),
    system,
    prompt: prompt,
    providerOptions: {
      openai: {
        ...(model.reasoningEffort && { reasoningEffort: model.reasoningEffort })
      }
    },
    abortSignal: abortController,
    onError({ error }) {
      throw new Error(error as string);
    }
  });
};
