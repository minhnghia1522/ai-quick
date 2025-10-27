import { ModelAI, STORAGE_KEY_MODEL } from '@/src/types/model';
import { generateText, streamText } from 'ai';
import { getProviderByModelName } from '@/src/utils/getProvider';
import { addFromUsage } from '@/src/utils/usageCost';

export const modelCallWithText = async ({ prompt }: { prompt: string }) => {
  const modelSelected = localStorage.getItem(STORAGE_KEY_MODEL);

  let model = {
    id: 1,
    model: 'gpt-4.1',
    name: 'gpt-4.1',
    description: 'Flagship GPT model for complex tasks',
    priceInput: 2.0,
    priceOutput: 8.0
  } as ModelAI;

  if (modelSelected) {
    model = JSON.parse(modelSelected);
  }

  try {
    const result = await generateText({
      model: getProviderByModelName(model.model),
      prompt,
      temperature: model.temperature ?? 0
    });

    const rawUsage = result?.usage;
    const usage = rawUsage
      ? {
          input_tokens: rawUsage.inputTokens ?? 0,
          output_tokens: rawUsage.outputTokens ?? 0,
          total_tokens: rawUsage.totalTokens ?? 0,
          cached: Boolean((result as any)?.cached ?? rawUsage?.cachedInputTokens)
        }
      : null;
        
    if (usage && usage.input_tokens) {
      const provider = model.model.toLowerCase().includes('gemini') ? 'google' : 'openai';
      const modelId = model.model;
      addFromUsage(provider, modelId, usage, 'translate');
    }

    return result.text;
  } catch (error) {
    throw new Error(error as string);
  }
};

export const modelCallWithStreaming = async (
  { system, prompt }: { prompt: string; system?: string },
  abortController: AbortSignal
) => {
  const modelSelected = localStorage.getItem(STORAGE_KEY_MODEL);
  let model = {
    id: 1,
    model: 'gpt-4.1',
    name: 'gpt-4.1',
    description: 'Flagship GPT model for complex tasks',
    priceInput: 2.0,
    priceOutput: 8.0
  } as ModelAI;

  if (modelSelected) {
    model = JSON.parse(modelSelected);
  }

  return streamText({
    model: getProviderByModelName(model.model),
    system,
    prompt: prompt,
    providerOptions: {
      openai: {
        ...(model.reasoningEffort && { reasoningEffort: model.reasoningEffort })
      }
    },
    temperature: model.temperature,
    abortSignal: abortController,
    onError({ error }) {
      throw new Error(error as string);
    }
  });
};
