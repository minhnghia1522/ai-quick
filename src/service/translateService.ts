import { ModelAI, STORAGE_KEY_MODEL } from '@/src/types/model';
import { generateText, streamText } from 'ai';
import { getProviderByModelName } from '@/src/utils/getProvider';
import { costTrackingInterceptor, TaskType } from './costTrackingInterceptor';

export const modelCallWithText = async ({
  prompt,
  taskType = 'translate'
}: {
  prompt: string;
  taskType?: TaskType;
}) => {
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

    // Track usage for cost analytics
    await costTrackingInterceptor.trackUsage(result, taskType);

    return result.text;
  } catch (error) {
    throw new Error(error as string);
  }
};

export const modelCallWithStreaming = async (
  { system, prompt, taskType = 'translate' }: { prompt: string; system?: string; taskType?: TaskType },
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

  const result = streamText({
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
    },
    onFinish: async (event) => {
      // Track usage for cost analytics when stream finishes
      await costTrackingInterceptor.trackUsage(event, taskType);
    }
  });

  return result;
};
