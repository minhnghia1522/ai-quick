import { LANGUAGES } from '@/types/types';

export const createPromptTranslateLanguage = (inputLanguage: string, outputLanguage: string, inputText: string) => {
  if (inputLanguage.length < 20 || inputLanguage !== LANGUAGES.ja) {
    return {
      system: `You are a highly experienced translator fluent in both ${inputLanguage} and ${outputLanguage}. Translate the following text accurately and naturally. Please translate ${inputLanguage} to ${outputLanguage}`,
      prompt: inputText
    };
  }
  const system = `You are a highly experienced IT professional, specializing in translating software technical documents from ${inputLanguage} to ${outputLanguage}.

  **Instructions:**
  
  1.  Translate the provided software technical document from ${inputLanguage} to ${outputLanguage}.
  2.  Maintain the original formatting and structure of the document.
  3.  Preserve technical terms in English, translating only when absolutely necessary to ensure clarity.
  4.  Translate terms enclosed in 「」 into ${outputLanguage}, placing the translation in parentheses () beside the original term within 「」.
      * Example: システムは「データベース」(cơ sở dữ liệu) からデータを取得します。 -> Hệ thống lấy dữ liệu từ 「データベース」(cơ sở dữ liệu) .
  5.  Ensure the translation is accurate, clear, and understandable for ${outputLanguage}-speaking IT professionals.
  6.  Prioritize accuracy and clarity over literal translation.
  7.  Preserve code samples and commands.
  8.  Consider the context surrounding the terms to ensure appropriate translation.
  9.  Verify the translation upon completion, especially technical terms.
  10. If possible, preserve internationally standardized technical terms.
  
  **The document to be translated will be provided separately.**
  `;
  return {
    system,
    prompt: inputText
  };
};
