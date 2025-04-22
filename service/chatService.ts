import { createOpenAI } from '@ai-sdk/openai';
import { CoreMessage, streamText, tool } from 'ai';
import { z } from 'zod';
import { getEmbedding } from './embeddingService';
import { OpenAIModel, STORAGE_KEY_MODEL } from '@/types/types';
import { FileStore } from '@/src/lib/database/fileDataDB';

const findRelevantContent = async (chatId: string, userQuery: string) => {
  console.log('chatId', chatId);
  const userQueryEmbedded = await getEmbedding({ values: [userQuery] });
  if (!userQueryEmbedded || userQueryEmbedded.length === 0) {
    throw new Error('Failed to get embedding for the user query');
  }

  const userQueryVector = userQueryEmbedded[0];
  const result = await FileStore.findSimilarEmbeddings(chatId, userQueryVector);

  console.log('result', result);

  const data = result.map((result) => {
    const { similarity, matchData } = result;
    const formated = `similarity: ${similarity}
      dataL: ${JSON.stringify(matchData)}
  `;
    return formated;
  });

  return `Retrieved content based on your query "${userQuery}": ${JSON.stringify(data)}`; // Make the result more descriptive
};

const getInformation = (chatId: string) =>
  tool({
    description: `get information from your knowledge base to answer questions.`,
    parameters: z.object({
      question: z.string().describe('the users question')
    }),
    execute: async ({ question }) => findRelevantContent(chatId, question)
  });

const get_current_time = tool({
  description: `Return the current time in the UTC time zone.`,
  parameters: z.object({
    question: z.string().describe('get time UTC')
  }),
  execute: async () => {
    return { time: new Date().toISOString() };
  }
});

export const chatPdfService = (messages: CoreMessage[], abortController: AbortSignal, chatId: string) => {
  const key = localStorage.getItem('apiKey');
  const modelSelected = localStorage.getItem(STORAGE_KEY_MODEL);
  const openai = createOpenAI({
    compatibility: 'strict',
    apiKey: key || ''
  });

  let model = {
    id: 1,
    model: 'gpt-4o-mini',
    name: 'gpt-4o-mini',
    description: 'Affordable small model for fast, everyday tasks'
  } as OpenAIModel;

  if (modelSelected) {
    model = JSON.parse(modelSelected);
  }

  const result = streamText({
    model: openai(model.model),
    system: `
    Check your knowledge base before answering any questions.
    Only respond using information retrieved from tool calls.
    If no relevant information is found, respond: "Sorry, I don't know."
    
    Always return markdown format.
    `,
    messages,
    maxSteps: 2, // Gọi streamText với maxSteps = 2 để đảm bảo LLM sẽ phản hồi sau khi tool chạy
    tools: { getInformation: getInformation(chatId), get_current_time },
    abortSignal: abortController,
    onError(error) {
      console.error('[streamText onError] An error occurred:', error);
      // Rethrow or handle as needed, but log it first.
      throw error; // Rethrow the original error object for better stack trace
    }
  });

  return result;
};
