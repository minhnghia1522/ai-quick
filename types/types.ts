export const DEFAULT_CHAT_MODEL: string = 'gpt-4o-mini';
interface OpenAIModel {
  id: string;
  name: string;
  description: string;
}

export const openAIModels: Array<OpenAIModel> = [
  {
    id: 'gpt-4o-mini',
    name: 'gpt-4o-mini',
    description: 'Affordable small model for fast, everyday tasks'
  },
  {
    id: 'gpt-4o',
    name: 'gpt-4o',
    description: 'High-intelligence model for complex tasks'
  },
  {
    id: 'o1-mini',
    name: 'o1-mini',
    description: 'Uses advanced reasoning'
  }
];

export interface TranslateBody {
  inputLanguage: string;
  outputLanguage: string;
  inputData: string;
  model?: OpenAIModel;
  apiKey?: string;
}

export interface TranslateResponse {
  code: string;
}

export const LANGUAGES = {
  ja: 'Japanese',
  vn: 'Vietnamese',
  en: 'English',
  natural: 'Natural languages'
};
