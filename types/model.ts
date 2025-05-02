export const STORAGE_KEY_MODEL: string = 'modelData';
export const STORAGE_KEY_OPENAI_API_KEY: string = 'apiKey';
export const STORAGE_KEY_GEMINI_API_KEY: string = 'geminiApiKey';
export interface ModelAI {
  id: number;
  model: string;
  name: string;
  description: string;
  reasoningEffort?: string;
  priceInput: number;
  priceOutput: number;
}

export const openAIModels: Array<ModelAI> = [
  {
    id: 0,
    model: 'gpt-4.1',
    name: 'gpt-4.1',
    description: 'Flagship GPT model for complex tasks',
    priceInput: 2.0,
    priceOutput: 8.0
  },
  {
    id: 1,
    model: 'gpt-4o-mini',
    name: 'gpt-4o-mini',
    description: 'Affordable small model for fast, everyday tasks',
    priceInput: 0.015,
    priceOutput: 0.6
  },
  {
    id: 2,
    model: 'gpt-4o',
    name: 'gpt-4o',
    description: 'High-intelligence model for complex tasks',
    priceInput: 2.5,
    priceOutput: 10.0
  },
  {
    id: 3,
    model: 'o1-mini',
    name: 'o1-mini',
    description: 'Uses advanced reasoning',
    priceInput: 0.15,
    priceOutput: 0.6
  },
  {
    id: 4,
    model: 'o3-mini-2025-01-31',
    name: 'o3-mini (high)',
    description: 'Uses advanced reasoning',
    reasoningEffort: 'high',
    priceInput: 1.1,
    priceOutput: 4.4
  },
  {
    id: 5,
    model: 'o3-mini-2025-01-31',
    name: 'o3-mini (medium)',
    description: 'Uses advanced reasoning',
    reasoningEffort: 'medium',
    priceInput: 1.1,
    priceOutput: 4.4
  },
  {
    id: 6,
    model: 'o3-mini-2025-01-31',
    name: 'o3-mini (low)',
    description: 'Uses advanced reasoning',
    reasoningEffort: 'low',
    priceInput: 1.1,
    priceOutput: 4.4
  }
];

export const geminiModels: Array<ModelAI> = [
  {
    id: 0,
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
