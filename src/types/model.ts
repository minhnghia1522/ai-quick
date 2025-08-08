export const STORAGE_KEY_MODEL: string = 'modelData';
export const STORAGE_KEY_OPENAI_API_KEY: string = 'apiKey';
export const STORAGE_KEY_GEMINI_API_KEY: string = 'geminiApiKey';

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
    id: 4,
    model: 'gpt-5-2025-08-07',
    name: 'GPT-5',
    description: 'The best model for coding and agentic tasks across domains',
    // temperature: 1,
    priceInput: 1.25,
    priceOutput: 10.0
  },
  {
    id: 5,
    model: 'gpt-5-mini-2025-08-07',
    name: 'GPT-5 mini',
    description: 'A faster, more cost-efficient version of GPT-5 for well-defined tasks',
    // temperature: 1,
    priceInput: 0.25,
    priceOutput: 2.0
  },
  {
    id: 0,
    model: 'gpt-4.1',
    name: 'GPT-4.1',
    description: 'Flagship GPT model for complex tasks',
    priceInput: 2.0,
    priceOutput: 8.0
  },
  {
    id: 1,
    model: 'gpt-4.1-mini',
    name: 'GPT-4.1 mini',
    description: 'Affordable model balancing speed and intelligence',
    priceInput: 0.4,
    priceOutput: 1.6
  },
  {
    id: 2,
    model: 'gpt-4.1-nano',
    name: 'GPT-4.1 nano',
    description: 'Fastest, most cost-effective model for low-latency tasks',
    priceInput: 0.1,
    priceOutput: 0.4
  },
  {
    id: 3,
    model: 'o4-mini',
    name: 'o4-mini',
    description: 'Our faster, cost-efficient reasoning model delivering strong performance on math, coding and vision',
    priceInput: 1.1,
    priceOutput: 4.4
  }
];

export const geminiModels: Array<ModelAI> = [
  {
    id: 20,
    model: 'gemini-2.0-flash-001',
    name: 'Gemini 2.0 Flash',
    description: 'Flagship Gemini model',
    priceInput: 0.1,
    priceOutput: 0.4
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

export const MODEL_DEFAULT = openAIModels[1];
