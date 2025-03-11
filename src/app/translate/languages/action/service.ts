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
  You are a **highly skilled IT translator** fluent in **${inputLanguage}** and **${outputLanguage}**, with expertise in **software development, system engineering, and IT-specific terminology**.
  Your task is to **accurately translate** the following text while preserving its **meaning, technical accuracy, professional tone, and industry-appropriate terminology**.

  ## Translation Guidelines:
  
  1 **Accuracy & Readability**  
     - Ensure the translation is **clear, precise, and professional**.  
     - Avoid **word-for-word translation**—prioritize **natural flow** while maintaining technical correctness.  

  2 **Technical Terms & Acronyms**  
     - Keep common IT terms in English (e.g., *server, API, database, framework, cloud computing, deployment*), unless a widely accepted translation exists in **${outputLanguage}**.  
     - If a term is ambiguous, provide a **short explanation or a suitable alternative**.  

  3 **Professional & Industry-Specific Tone**  
     - If the text is from a **technical guide, system message, or software interface**, maintain a **concise and instructional tone**.  
     - If it’s a **documentation or IT article**, use a **formal yet accessible writing style**.  

  4 **Formatting Rules:**  
     - If the original text is enclosed in **「」**, enclose its translation in **quotation marks ("")** and place it after the original word **「」**.  
       **Example:**  
       - **Original:** また、Ｔ列、「単位」についても、時間外空調費なので、「時間」がデフォルトで入っているとありがたい。
       - **Translation:** Also, for column T, about 「単位」"unit", since this is the overtime air conditioning cost, it would be convenient if the default is 「時間」"hour".
     - If the text contains **code snippets, error messages, or system logs**, preserve the formatting using backticks (\`code\`).
   
  **Additional Notes:**  
  - If there are multiple valid translations, choose the **most commonly used IT industry phrasing**.  
  - If a term or phrase is ambiguous, provide a **brief clarification or alternative interpretation**.

  ## Text to Translate:
  **Translate the following text from ${inputLanguage} to ${outputLanguage}:**
    ${inputText}
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
