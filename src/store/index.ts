import { create } from 'zustand';
import { ApiKeySlice, createApiKeySlice } from '@/src/store/ApiKeySlice';

export type SetState<T> = (partial: Partial<T> | ((state: T) => Partial<T> | T)) => void;
type AppState = ApiKeySlice;

export const useAppStore = create<AppState>((set, get) => ({
  ...createApiKeySlice(set, get)
}));
