/* eslint-disable @typescript-eslint/no-unused-vars */
import { createOpenAI } from '@ai-sdk/openai';
import { CoreMessage, streamText, tool } from 'ai';
import { z } from 'zod';
import { getEmbedding } from './embeddingService';
import { EmbeddingStore } from '@/src/utils/indexedDB';

const findRelevantContent = async (userQuery: string) => {
  console.log('userQuery', userQuery);
  // const userQueryEmbedded = await getEmbedding({ values: [userQuery] });
  // if (!userQueryEmbedded || userQueryEmbedded.length === 0) {
  //   throw new Error('Failed to get embedding for the user query');
  // }

  // const userQueryVector = userQueryEmbedded[0];
  // const result = await EmbeddingStore.findSimilarEmbeddings(userQueryVector);
  return `TOOL_CALL_RESULT: Nghiadz`;
};

const getInformation = tool({
  description: `get information from your knowledge base to answer questions.`,
  parameters: z.object({
    question: z.string().describe('the users question')
  }),
  execute: async ({ question }) => findRelevantContent(question)
});

export const chatPdfService = (messages: CoreMessage[], abortController: AbortSignal) => {
  const key = localStorage.getItem('apiKey');
  const openai = createOpenAI({
    compatibility: 'strict',
    apiKey: key || ''
  });

  const model = openai('gpt-4o-mini');

  const result = streamText({
    model,
    system: `
    Check your knowledge base before answering any questions.
    Only respond using information retrieved from tool calls.
    If no relevant information is found, respond: "Sorry, I don't know."`,
    messages,
    maxSteps: 5,
    tools: {
      getInformation: getInformation
    },
    abortSignal: abortController,
    onError({ error }) {
      console.log('error', error);
      throw new Error(error as string);
    }
  });

  result.toolCalls
    .then((toolCallsValue) => {
      // This log will show the actual array of tool results once the promise resolves.
      console.log('Resolved toolCalls:', toolCallsValue);
    })
    .catch((error) => {
      // It's also good practice to catch potential errors.
      console.error('Error resolving toolCalls:', error);
    });

  // Log the resolved value of toolResults correctly
  result.toolResults
    .then((toolResultsValue) => {
      // This log will show the actual array of tool results once the promise resolves.
      console.log('Resolved toolResults:', toolResultsValue);
    })
    .catch((error) => {
      // It's also good practice to catch potential errors.
      console.error('Error resolving toolResults:', error);
    });

  return result;
};
