import { CoreMessage, streamText, tool } from 'ai';
import { z } from 'zod';
import { getEmbedding } from './embeddingService';
import { ModelAI, openAIModels, STORAGE_KEY_MODEL } from '@/src/types/model';
import { FileStore } from '@/src/lib/database/fileDataDB';
import { systemRagPrompt } from '@/src/prompt/chatSystemPrompt';
import { getProviderByModelName } from '@/src/utils/getProvider';

const findRelevantContent = async (chatId: string, userQuery: string) => {
  const userQueryEmbedded = await getEmbedding({ values: [userQuery] });
  if (!userQueryEmbedded || userQueryEmbedded.length === 0) {
    throw new Error('Failed to get embedding for the user query');
  }

  const userQueryVector = userQueryEmbedded[0];
  const fileDataMatch = await FileStore.findSimilarEmbeddings(chatId, userQueryVector, 0.6);

  const data = fileDataMatch.map((fileData) => {
    const content = fileData.embedding.map((data) => {
      if (data?.page && data?.content) {
        return `<page number: ${data.page}>\n` + data.content + `\n`;
      }
    });
    return `<file: ${fileData.filename}>\n` + content;
  });
  return data.join('\n\n');
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
  const modelSelected = localStorage.getItem(STORAGE_KEY_MODEL);
  let model = openAIModels[0] as ModelAI;

  if (modelSelected) {
    model = JSON.parse(modelSelected);
  }

  const result = streamText({
    model: getProviderByModelName(model.model),
    system: systemRagPrompt,
    messages,
    maxSteps: 2, // Gọi streamText với maxSteps = 2 để đảm bảo LLM sẽ phản hồi sau khi tool chạy
    tools: { getInformation: getInformation(chatId), get_current_time },
    abortSignal: abortController,
    onError(error) {
      throw error;
    }
  });

  return result;
};
