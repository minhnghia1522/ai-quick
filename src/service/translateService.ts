import { ModelAI, STORAGE_KEY_MODEL, MODEL_DEFAULT } from '@/src/types/model';
import { generateText, streamText } from 'ai';
import type { ModelMessage } from 'ai';
import { getProviderByModelName } from '@/src/utils/getProvider';
import { costTrackingInterceptor, TaskType } from './costTrackingInterceptor';

type ModelCallWithStreamingParams = {
  system?: string;
  taskType?: TaskType;
  onCostTracked?: (cost: number) => void;
} & (
  | {
      prompt: string;
      messages?: never;
    }
  | {
      prompt?: never;
      messages: ModelMessage[];
    }
);

export const modelCallWithText = async ({
  prompt,
  taskType = 'translate'
}: {
  prompt: string;
  taskType?: TaskType;
}) => {
  const modelSelected = localStorage.getItem(STORAGE_KEY_MODEL);

  let model: ModelAI = MODEL_DEFAULT;

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
  { system, prompt, messages, taskType = 'translate', onCostTracked }: ModelCallWithStreamingParams,
  abortController: AbortSignal
) => {
  const modelSelected = localStorage.getItem(STORAGE_KEY_MODEL);
  let model: ModelAI = MODEL_DEFAULT;

  if (modelSelected) {
    model = JSON.parse(modelSelected);
  }

  const commonOptions = {
    model: getProviderByModelName(model.model),
    system,
    providerOptions: {
      openai: {
        ...(model.reasoningEffort && { reasoningEffort: model.reasoningEffort })
      }
    },
    temperature: model.temperature,
    abortSignal: abortController,
    onError({ error }: { error: unknown }) {
      throw new Error(error as string);
    },
    onFinish: async (event: unknown) => {
      // Track usage for cost analytics when stream finishes
      const cost = await costTrackingInterceptor.trackUsage(event, taskType);

      // Call the callback if provided to notify about the tracked cost
      if (onCostTracked) {
        onCostTracked(cost);
      }
    }
  };

  const result = messages
    ? streamText({
        ...commonOptions,
        messages
      })
    : streamText({
        ...commonOptions,
        prompt
      });

  return result;
};
