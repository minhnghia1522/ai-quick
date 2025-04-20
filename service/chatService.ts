import { createOpenAI } from '@ai-sdk/openai';
import { CoreMessage, streamText, tool } from 'ai';
import { z } from 'zod';
import { getEmbedding } from './embeddingService';
import { EmbeddingStore } from '@/src/utils/indexedDB';

const findRelevantContent = async (userQuery: string) => {
  const userQueryEmbedded = await getEmbedding({ values: [userQuery] });
  if (!userQueryEmbedded || userQueryEmbedded.length === 0) {
    throw new Error('Failed to get embedding for the user query');
  }
  const userQueryVector = userQueryEmbedded[0];
  const result = await EmbeddingStore.findSimilarEmbeddings(userQueryVector);
  console.log('result', result);
  return result;
};

export const chatPdfService = (messages: CoreMessage[], abortController: AbortSignal) => {
  const key = localStorage.getItem('apiKey');
  const openai = createOpenAI({
    compatibility: 'strict',
    apiKey: key || ''
  });

  const model = openai('gpt-4');

  return streamText({
    model,
    system: `You are a helpful assistant. Check your knowledge base before answering any questions.
    Only respond to questions using information from tool calls.
    if no relevant information is found in the tool calls, respond, "Sorry, I don't know."`,
    messages,
    tools: {
      //   addResource: tool({
      //     description: `add a resource to your knowledge base.
      //       If the user provides a random piece of knowledge unprompted, use this tool without asking for confirmation.`,
      //     parameters: z.object({
      //       content: z.string().describe('the content or resource to add to the knowledge base')
      //     }),
      //     execute: async ({ content }) => createResource({ content })
      //   })
      getInformation: tool({
        description: `get information from your knowledge base to answer questions.`,
        parameters: z.object({
          question: z.string().describe('the users question')
        }),
        execute: async ({ question }) => findRelevantContent(question)
      })
    },
    abortSignal: abortController,
    onError({ error }) {
      throw new Error(error as string);
    }
  });
};
