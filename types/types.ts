export const STORAGE_KEY_MODEL: string = 'modelData';
export interface OpenAIModel {
  id: number;
  model: string;
  name: string;
  description: string;
  reasoningEffort?: string;
}

export const openAIModels: Array<OpenAIModel> = [
  {
    id: 1,
    model: 'gpt-4o-mini',
    name: 'gpt-4o-mini',
    description: 'Affordable small model for fast, everyday tasks'
  },
  {
    id: 2,
    model: 'gpt-4o',
    name: 'gpt-4o',
    description: 'High-intelligence model for complex tasks'
  },
  {
    id: 3,
    model: 'o1-mini',
    name: 'o1-mini',
    description: 'Uses advanced reasoning'
  },
  {
    id: 4,
    model: 'o3-mini-2025-01-31',
    name: 'o3-mini (high)',
    description: 'Uses advanced reasoning',
    reasoningEffort: 'high'
  },
  {
    id: 5,
    model: 'o3-mini-2025-01-31',
    name: 'o3-mini (medium)',
    description: 'Uses advanced reasoning',
    reasoningEffort: 'medium'
  },
  {
    id: 6,
    model: 'o3-mini-2025-01-31',
    name: 'o3-mini (low)',
    description: 'Uses advanced reasoning',
    reasoningEffort: 'low'
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
