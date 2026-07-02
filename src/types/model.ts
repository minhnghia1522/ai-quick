export const STORAGE_KEY_MODEL: string = 'modelData';
export const STORAGE_KEY_OPENAI_API_KEY: string = 'apiKey';
export const STORAGE_KEY_GEMINI_API_KEY: string = 'geminiApiKey';
export const STORAGE_KEY_AIQUICK_API_KEY: string = 'aiquickApiKey';

export interface ModelAI {
  id: number;
  model: string;
  name: string;
  description: string;
  reasoningEffort?: string;
  temperature?: number;
  priceInput: number;
  priceOutput: number;
}

export const openAIModels: Array<ModelAI> = [
  {
    id: 0,
    model: 'gpt-5.4-2026-03-05',
    name: 'GPT-5.4',
    description: 'Best intelligence at scale for agentic, coding, and professional workflows',
    temperature: 1,
    priceInput: 2.5,
    priceOutput: 15.0,
    reasoningEffort: 'low'
  },
  {
    id: 1,
    model: 'gpt-5.4-mini-2026-03-17',
    name: 'GPT-5.4 mini',
    description: 'Our strongest mini model yet for coding, computer use, and subagents',
    temperature: 1,
    priceInput: 0.75,
    priceOutput: 4.5,
    reasoningEffort: 'low'
  }
];

export const geminiModels: Array<ModelAI> = [
  {
    id: 20,
    model: 'gemini-3.1-flash-lite-preview',
    name: 'Gemini 3.1 Flash lite',
    description: 'Flagship Gemini model',
    priceInput: 0.25,
    priceOutput: 1.5
  }
];

export interface TranslateBody {
  inputLanguage: string;
  outputLanguage: string;
  inputData: string;
  model?: ModelAI;
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

export const MODEL_DEFAULT = openAIModels[0];
