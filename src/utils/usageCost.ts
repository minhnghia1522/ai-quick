import { getModelPricing } from './pricing';

export type UsageTokens = {
  input_tokens: number;
  output_tokens?: number;
  total_tokens?: number;
  cached?: boolean;
};

export const USAGE_COST_LS_TOTAL_KEY = 'usage_cost_total_usd_v1';
export const USAGE_COST_LS_BREAKDOWN_KEY = 'usage_cost_breakdown_v1';
export const USAGE_COST_EVENT_NAME = 'usage:cost-updated';
export const USAGE_COST_CHANNEL = 'usage-cost';

type UsageFeature = 'translate' | 'chat' | 'enhance' | 'generate' | 'pdf' | 'embedding';
type CostBreakdown = Record<string, Record<string, Record<string, Record<string, number>>>>;
type BroadcastPayload = { type: 'update'; total: number };

const DEFAULT_FEATURE_KEY = 'default';
const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
const hasBroadcastChannel = typeof BroadcastChannel !== 'undefined';

const round6 = (n: number): number => Math.round((n + Number.EPSILON) * 1e6) / 1e6;

const ensureNonNegative = (value: number): number => (value < 0 ? 0 : value);

let emitterChannel: BroadcastChannel | null = null;

const ensureEmitterChannel = (): BroadcastChannel | null => {
  if (!isBrowser || !hasBroadcastChannel) {
    return null;
  }

  if (emitterChannel) {
    return emitterChannel;
  }

  try {
    emitterChannel = new BroadcastChannel(USAGE_COST_CHANNEL);
  } catch {
    emitterChannel = null;
  }

  return emitterChannel;
};

const postCostUpdate = (total: number): void => {
  if (!isBrowser) {
    return;
  }

  const payload: BroadcastPayload = { type: 'update', total };
  const channel = ensureEmitterChannel();

  if (channel) {
    try {
      channel.postMessage(payload);
      return;
    } catch {
      // Fallback to window event below.
    }
  }

  try {
    window.dispatchEvent(new CustomEvent(USAGE_COST_EVENT_NAME, { detail: { total } }));
  } catch {
    // Ignore dispatch errors silently.
  }
};

const readTotalFromStorage = (): number => {
  if (!isBrowser) {
    return 0;
  }

  const raw = window.localStorage.getItem(USAGE_COST_LS_TOTAL_KEY);
  if (!raw) {
    return 0;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
};

const writeTotalToStorage = (total: number): void => {
  if (!isBrowser) {
    return;
  }

  window.localStorage.setItem(USAGE_COST_LS_TOTAL_KEY, round6(total).toString());
};

const readBreakdownFromStorage = (): CostBreakdown => {
  if (!isBrowser) {
    return {};
  }

  const raw = window.localStorage.getItem(USAGE_COST_LS_BREAKDOWN_KEY);
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed as CostBreakdown;
    }
  } catch {
    // Ignore parse errors and fallback to empty object.
  }

  return {};
};

const writeBreakdownToStorage = (breakdown: CostBreakdown): void => {
  if (!isBrowser) {
    return;
  }

  window.localStorage.setItem(USAGE_COST_LS_BREAKDOWN_KEY, JSON.stringify(breakdown));
};

const getTodayKey = (): string => new Date().toISOString().slice(0, 10);

export function computeCostUSD(provider: string, modelId: string, usage: UsageTokens): number {
  if (usage.cached === true) {
    return 0;
  }

  const pricing = getModelPricing(provider, modelId);
  if (!pricing) {
    return 0;
  }

  const inputTokens = ensureNonNegative(usage.input_tokens ?? 0);
  const outputTokensCandidate =
    usage.output_tokens ??
    (usage.total_tokens != null ? ensureNonNegative(usage.total_tokens - inputTokens) : undefined);
  const outputTokens = outputTokensCandidate != null ? ensureNonNegative(outputTokensCandidate) : undefined;

  const inputCost = (inputTokens / 1000) * pricing.inputPer1K;
  const outputCost =
    outputTokens != null ? (outputTokens / 1000) * pricing.outputPer1K : 0;

  return round6(inputCost + outputCost);
}

export function addFromUsage(
  provider: string,
  modelId: string,
  usage: UsageTokens,
  feature?: UsageFeature,
): number {
  const cost = computeCostUSD(provider, modelId, usage);
  if (cost <= 0) {
    return 0;
  }

  if (!isBrowser) {
    return cost;
  }

  const currentTotal = readTotalFromStorage();
  const nextTotal = round6(currentTotal + cost);
  writeTotalToStorage(nextTotal);

  const breakdown = readBreakdownFromStorage();
  const dateKey = getTodayKey();
  const featureKey = feature ?? DEFAULT_FEATURE_KEY;

  if (!breakdown[dateKey]) {
    breakdown[dateKey] = {};
  }
  if (!breakdown[dateKey][provider]) {
    breakdown[dateKey][provider] = {};
  }
  if (!breakdown[dateKey][provider][modelId]) {
    breakdown[dateKey][provider][modelId] = {};
  }

  const previous = breakdown[dateKey][provider][modelId][featureKey] ?? 0;
  breakdown[dateKey][provider][modelId][featureKey] = round6(previous + cost);

  writeBreakdownToStorage(breakdown);
  postCostUpdate(nextTotal);

  return cost;
}

export function getTotalUSD(): number {
  return round6(readTotalFromStorage());
}

export function resetTotal(): void {
  if (!isBrowser) {
    return;
  }

  window.localStorage.removeItem(USAGE_COST_LS_TOTAL_KEY);
  window.localStorage.removeItem(USAGE_COST_LS_BREAKDOWN_KEY);

  postCostUpdate(0);
}

export function formatUSD(total: number): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(total);
  } catch {
    return `$${total.toFixed(2)}`;
  }
}

export function subscribeCostChanged(listener: (total: number) => void): () => void {
  if (!isBrowser) {
    return () => {
      // No-op unsubscribe in non-browser environments.
    };
  }

  let channel: BroadcastChannel | null = null;

  const handleChannel = (event: MessageEvent): void => {
    const data = event.data as BroadcastPayload | undefined;
    if (data && data.type === 'update' && typeof data.total === 'number') {
      listener(data.total);
    }
  };

  if (hasBroadcastChannel) {
    try {
      channel = new BroadcastChannel(USAGE_COST_CHANNEL);
      channel.onmessage = handleChannel;
    } catch {
      channel = null;
    }
  }

  const handleWindow: EventListener = (event) => {
    const detail = (event as CustomEvent<{ total?: number }>).detail;
    if (detail && typeof detail.total === 'number') {
      listener(detail.total);
    }
  };

  try {
    window.addEventListener(USAGE_COST_EVENT_NAME, handleWindow);
  } catch {
    // Ignore addEventListener failures.
  }

  return () => {
    if (channel) {
      channel.onmessage = null;
      channel.close();
      channel = null;
    }

    try {
      window.removeEventListener(USAGE_COST_EVENT_NAME, handleWindow);
    } catch {
      // Ignore removeEventListener failures.
    }
  };
}