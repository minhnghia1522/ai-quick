import { TranslateBody } from '@/types/types';
import { OpenAIStream } from '@/utils';

export const config = {
  runtime: 'edge'
};

export async function POST(req: Request): Promise<Response> {
  try {
    const { inputLanguage, outputLanguage, inputData, model, apiKey } =
      (await req.json()) as TranslateBody;

    const stream = await OpenAIStream(
      inputLanguage,
      outputLanguage,
      inputData,
      model,
      apiKey
    );

    return new Response(stream);
  } catch (error) {
    console.error(error);
    return new Response('Error', { status: 500 });
  }
}
