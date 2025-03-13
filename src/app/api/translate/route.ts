import { createPromptTranslateCode } from '@/prompt/codeTranslatePrompt';
import { OpenAIStream } from '@/service/openAI';
import { TranslateBody } from '@/types/types';

export const config = {
  runtime: 'edge'
};

export async function POST(req: Request): Promise<Response> {
  try {
    const { inputLanguage, outputLanguage, inputData } = (await req.json()) as TranslateBody;

    const prompt = createPromptTranslateCode(inputLanguage, outputLanguage, inputData);

    const stream = await OpenAIStream({
      prompt
    });

    return new Response(stream);
  } catch (error) {
    console.error(error);
    return new Response('Error', { status: 500 });
  }
}
