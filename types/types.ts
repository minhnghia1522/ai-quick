export type OpenAIModel = 'gpt-4o' | 'gpt-4o-mini' | 'o1-mini';

export interface TranslateBody {
  inputLanguage: string;
  outputLanguage: string;
  inputCode: string;
  model: OpenAIModel;
  apiKey: string;
}

export interface TranslateResponse {
  code: string;
}
