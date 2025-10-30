import { create } from 'zustand';
import { ApiKeySlice, createApiKeySlice } from '@/src/store/ApiKeySlice';
import { UsageCostSlice, createUsageCostSlice } from '@/src/store/UsageCostSlice';

export type SetState<T> = (partial: Partial<T> | ((state: T) => Partial<T> | T)) => void;
type AppState = ApiKeySlice & UsageCostSlice;

export const useAppStore = create<AppState>((set, get) => ({
  ...createApiKeySlice(set, get),
  ...createUsageCostSlice(set, get)
}));
