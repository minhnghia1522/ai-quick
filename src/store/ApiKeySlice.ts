import { SetState } from '.';

/* eslint-disable @typescript-eslint/no-unused-vars */
export type ApiKeySlice = {
  isOpenApiKey: boolean;
  isGeminiApiKey: boolean;
  setIsOpenApiKey: (flag: boolean) => void;
  setIsGeminiApiKey: (flag: boolean) => void;
};

const initData = {
  isOpenApiKey: false,
  isGeminiApiKey: false
};

export const createApiKeySlice = (set: SetState<ApiKeySlice>, get: () => ApiKeySlice): ApiKeySlice => ({
  ...initData,
  setIsOpenApiKey: (flag: boolean) => set({ isOpenApiKey: flag }),
  setIsGeminiApiKey: (flag: boolean) => set({ isGeminiApiKey: flag })
});
