export const DEFAULT_CHAT_MODEL: string = 'gpt-4o';
interface OpenAIModel {
  id: string;
  name: string;
  description: string;
}

export const openAIModels: Array<OpenAIModel> = [
  {
    id: 'gpt-4o',
    name: 'gpt-4o',
    description: 'Small model for fast, lightweight tasks'
  },
  {
    id: 'gpt-4o-mini',
    name: 'gpt-4o-mini',
    description: 'Large model for complex, multi-step tasks'
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
