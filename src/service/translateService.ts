import { ModelAI, STORAGE_KEY_AIQUICK_API_KEY, STORAGE_KEY_MODEL, MODEL_DEFAULT } from '@/src/types/model';
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

type TextStreamResult = {
  textStream: AsyncIterable<string>;
};

const AUTH_ERROR_TERMS = [
  '401',
  '403',
  'api key',
  'authentication',
  'invalid_api_key',
  'incorrect api key',
  'permission_denied',
  'unauthorized'
];

const getSelectedModel = (fallbackModel: ModelAI = MODEL_DEFAULT) => {
  const modelSelected = localStorage.getItem(STORAGE_KEY_MODEL);

  if (!modelSelected) {
    return fallbackModel;
  }

  try {
    return JSON.parse(modelSelected) as ModelAI;
  } catch {
    return fallbackModel;
  }
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
};

const isAuthError = (error: unknown) => {
  const message = getErrorMessage(error).toLowerCase();

  return AUTH_ERROR_TERMS.some((term) => message.includes(term));
};

const isOpenAIModel = (modelName: string) => !modelName.toLowerCase().includes('gemini');

const shouldFallbackToAIQuick = (error: unknown, model: ModelAI) => {
  const aiQuickApiKey = localStorage.getItem(STORAGE_KEY_AIQUICK_API_KEY);

  return Boolean(aiQuickApiKey) && isOpenAIModel(model.model) && isAuthError(error);
};

const createFallbackTextStream = async function* ({
  params,
  model,
  abortSignal
}: {
  params: ModelCallWithStreamingParams;
  model: ModelAI;
  abortSignal: AbortSignal;
}) {
  const aiQuickApiKey = localStorage.getItem(STORAGE_KEY_AIQUICK_API_KEY);

  if (!aiQuickApiKey) {
    throw new Error('AIQUICK API key is missing.');
  }

  const response = await fetch('/api/ai/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': aiQuickApiKey
    },
    body: JSON.stringify({
      prompt: 'prompt' in params ? params.prompt : undefined,
      messages: 'messages' in params ? params.messages : undefined,
      system: params.system,
      model: model.model,
      temperature: model.temperature,
      reasoningEffort: model.reasoningEffort,
      taskType: params.taskType
    }),
    signal: abortSignal
  });

  if (!response.ok) {
    let errorMessage = 'AIQUICK authentication failed.';

    try {
      const data = (await response.json()) as { error?: string };
      errorMessage = data.error || errorMessage;
    } catch {
      // Keep the generic error message when the server response is not JSON.
    }

    throw new Error(errorMessage);
  }

  if (!response.body) {
    throw new Error('AIQUICK fallback response is empty.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      yield decoder.decode(value, { stream: true });
    }

    const remainingText = decoder.decode();

    if (remainingText) {
      yield remainingText;
    }
  } finally {
    reader.releaseLock();
  }
};

export const modelCallWithText = async ({
  prompt,
  taskType = 'translate'
}: {
  prompt: string;
  taskType?: TaskType;
}) => {
  const model = getSelectedModel();

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
  params: ModelCallWithStreamingParams,
  abortController: AbortSignal
): Promise<TextStreamResult> => {
  const model = getSelectedModel();

  const textStream = async function* () {
    let hasLocalOutput = false;

    const commonOptions = {
      model: getProviderByModelName(model.model),
      system: params.system,
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
        const cost = await costTrackingInterceptor.trackUsage(event, params.taskType ?? 'translate');

        // Call the callback if provided to notify about the tracked cost
        if (params.onCostTracked) {
          params.onCostTracked(cost);
        }
      }
    };

    try {
      const result =
        'messages' in params
          ? streamText({
              ...commonOptions,
              messages: params.messages
            })
          : streamText({
              ...commonOptions,
              prompt: params.prompt
            });

      for await (const textPart of result.textStream) {
        hasLocalOutput = true;
        yield textPart;
      }
    } catch (error) {
      if (hasLocalOutput || !shouldFallbackToAIQuick(error, model)) {
        throw error;
      }

      for await (const textPart of createFallbackTextStream({ params, model, abortSignal: abortController })) {
        yield textPart;
      }
    }
  };

  return {
    textStream: textStream()
  };
};
