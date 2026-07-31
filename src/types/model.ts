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
    model: 'gpt-5.6-luna',
    name: 'GPT-5.6 Luna',
    description: 'GPT-5.6 model optimized for cost-sensitive workloads',
    temperature: 1,
    priceInput: 0.2,
    priceOutput: 1.2,
    reasoningEffort: 'high'
  },
  {
    id: 1,
    model: 'gpt-5.6-terra',
    name: 'GPT-5.6 Terra',
    description: 'GPT-5.6 model that balances intelligence and cost',
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
