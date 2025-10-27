// Các mức giá là ước lượng (2024-2025). Hãy xác minh với nhà cung cấp trước khi dùng production.

export type ModelPricing = {
  currency: 'USD';
  inputPer1K: number;
  outputPer1K: number;
};

export type EmbeddingPricing = {
  currency: 'USD';
  inputPer1K: number;
};

export const PRICING_TABLE: Record<string, Record<string, ModelPricing>> = {
  openai: {
    'gpt-4o': { currency: 'USD', inputPer1K: 0.005, outputPer1K: 0.015 },
    'gpt-4o-mini': { currency: 'USD', inputPer1K: 0.00015, outputPer1K: 0.0006 },
    'gpt-4o-mini-high': { currency: 'USD', inputPer1K: 0.0006, outputPer1K: 0.0024 },
    'o4-mini': { currency: 'USD', inputPer1K: 0.0011, outputPer1K: 0.0044 },
    o4: { currency: 'USD', inputPer1K: 0.015, outputPer1K: 0.06 },
  },
  anthropic: {
    'claude-3-5-sonnet-20240620': { currency: 'USD', inputPer1K: 0.003, outputPer1K: 0.015 },
    'claude-3-5-haiku-20241022': { currency: 'USD', inputPer1K: 0.0008, outputPer1K: 0.004 },
  },
  google: {
    'gemini-1.5-pro': { currency: 'USD', inputPer1K: 0.0035, outputPer1K: 0.0105 },
    'gemini-1.5-flash': { currency: 'USD', inputPer1K: 0.00035, outputPer1K: 0.00105 },
  },
  mistral: {
    'mistral-large-latest': { currency: 'USD', inputPer1K: 0.008, outputPer1K: 0.024 },
    'mistral-small-latest': { currency: 'USD', inputPer1K: 0.002, outputPer1K: 0.006 },
    'mistral-nemo': { currency: 'USD', inputPer1K: 0.001, outputPer1K: 0.003 },
  },
};

export const EMBEDDING_PRICING_TABLE: Record<string, Record<string, EmbeddingPricing>> = {
  openai: {
    'text-embedding-3-large': { currency: 'USD', inputPer1K: 0.00013 },
  },
  mistral: {
    embed: { currency: 'USD', inputPer1K: 0.0001 },
  },
};

export function getModelPricing(provider: string, modelId: string): ModelPricing | null {
  const providerPricing = PRICING_TABLE[provider];
  if (!providerPricing) {
    return null;
  }

  return providerPricing[modelId] ?? null;
}

export function getEmbeddingPricing(provider: string, modelId: string): EmbeddingPricing | null {
  const providerPricing = EMBEDDING_PRICING_TABLE[provider];
  if (!providerPricing) {
    return null;
  }

  return providerPricing[modelId] ?? null;
}