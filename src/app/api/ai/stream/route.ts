import { createOpenAI } from '@ai-sdk/openai';
import { streamText, type ModelMessage } from 'ai';
import { timingSafeEqual } from 'crypto';

export const runtime = 'nodejs';

type StreamRequestBody = {
  prompt?: string;
  messages?: ModelMessage[];
  system?: string;
  model?: string;
  temperature?: number;
  reasoningEffort?: string;
};

const getConfiguredAIQuickKey = () => process.env.AIQUICK_KEY || process.env.AIQUICK_API_KEY;

const isValidAIQuickKey = (providedKey: string, configuredKey: string) => {
  const providedBuffer = Buffer.from(providedKey);
  const configuredBuffer = Buffer.from(configuredKey);

  if (providedBuffer.length !== configuredBuffer.length) {
    return false;
  }

  return timingSafeEqual(providedBuffer, configuredBuffer);
};

const createErrorResponse = (message: string, status: number) =>
  Response.json(
    {
      error: message
    },
    {
      status
    }
  );

const isValidMessages = (messages: unknown): messages is ModelMessage[] => Array.isArray(messages);

export async function POST(request: Request) {
  const providedAIQuickKey = request.headers.get('X-API-KEY');

  if (!providedAIQuickKey) {
    return createErrorResponse('Missing X-API-KEY header.', 401);
  }

  const configuredAIQuickKey = getConfiguredAIQuickKey();

  if (!configuredAIQuickKey || !isValidAIQuickKey(providedAIQuickKey, configuredAIQuickKey)) {
    return createErrorResponse('Invalid API key.', 403);
  }

  const openAIKey = process.env['OPEN_API_KEY'];

  if (!openAIKey) {
    return createErrorResponse('Server OpenAI key is not configured.', 503);
  }

  let body: StreamRequestBody;

  try {
    body = (await request.json()) as StreamRequestBody;
  } catch {
    return createErrorResponse('Invalid request body.', 400);
  }

  // if (!body.model || typeof body.model !== 'string') {
  //   return createErrorResponse('Missing model.', 400);
  // }

  body.model = "gpt-5.4-mini-2026-03-17"

  if (!body.prompt && !isValidMessages(body.messages)) {
    return createErrorResponse('Missing prompt or messages.', 400);
  }

  const openai = createOpenAI({
    apiKey: openAIKey
  });

  const commonOptions = {
    model: openai.chat(body.model),
    system: body.system,
    providerOptions: {
      openai: {
        ...(body.reasoningEffort && { reasoningEffort: body.reasoningEffort })
      }
    },
    temperature: body.temperature
  };

  const result = body.messages
    ? streamText({
        ...commonOptions,
        messages: body.messages
      })
    : streamText({
        ...commonOptions,
        prompt: body.prompt!
      });

  const encoder = new TextEncoder();
  const textStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const textPart of result.textStream) {
          controller.enqueue(encoder.encode(textPart));
        }
        controller.close();
      } catch {
        controller.error(new Error('AI fallback request failed.'));
      }
    }
  });

  return new Response(textStream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}