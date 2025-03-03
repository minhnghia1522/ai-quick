import endent from 'endent';
import {
  createParser,
  ParsedEvent,
  ReconnectInterval
} from 'eventsource-parser';

const createPromptTranslateLanguage = (
  inputLanguage: string,
  outputLanguage: string,
  inputText: string
) => {
  return endent`
      You are an expert IT translator. 
      Your task is to translate the text from the  "${inputLanguage}" language to the "${outputLanguage}" language.
      Please ensure that the translation is accurate, paying careful attention to preserving punctuation, formatting, and the context of the original text.

      For example, when translating from Japanese to Vietnamese:
        - Japanese text:
          「電車」をおります
        - Expected Vietnamese translation:
          Xuống 「電車」(tàu)
      
      "${inputLanguage}" language:
       ${inputText}   

      "${outputLanguage}" language (no \`\`\`):
     `;
};

export const OpenAIStreamTranslateLanguage = async (
  outputLanguage: string,
  inputLanguage: string,
  inputData: string,
  model: string,
  key: string
) => {
  const prompt = createPromptTranslateLanguage(
    inputLanguage,
    outputLanguage,
    inputData
  );

  const system = { role: 'system', content: prompt };

  const res = await fetch(`https://api.openai.com/v1/chat/completions`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key || process.env.OPENAI_API_KEY}`
    },
    method: 'POST',
    body: JSON.stringify({
      model,
      messages: [system],
      temperature: 0,
      stream: true
    })
  });

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  if (res.status !== 200) {
    const statusText = res.statusText;
    const result = await res.body?.getReader().read();
    throw new Error(
      `OpenAI API returned an error: ${
        decoder.decode(result?.value) || statusText
      }`
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === 'event') {
          const data = event.data;

          if (data === '[DONE]') {
            controller.close();
            return;
          }

          try {
            const json = JSON.parse(data);
            const text = json.choices[0].delta.content;
            const queue = encoder.encode(text);
            controller.enqueue(queue);
          } catch (e) {
            controller.error(e);
          }
        }
      };

      const parser = createParser(onParse);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    }
  });

  return new Response(stream);
};
