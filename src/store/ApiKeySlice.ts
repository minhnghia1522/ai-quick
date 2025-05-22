import { SetState } from '.';

/* eslint-disable @typescript-eslint/no-unused-vars */
export type ApiKeySlice = {
  isOpenApiKey: boolean;
  isGeminiApiKey: boolean;
  setIsOpenApiKey: (haveKey: boolean) => void;
  setIsGeminiApiKey: (haveKey: boolean) => void;
};

const initData = {
  isOpenApiKey: false,
  isGeminiApiKey: false
};

export const createApiKeySlice = (set: SetState<ApiKeySlice>, get: () => ApiKeySlice): ApiKeySlice => ({
  ...initData,
  setIsOpenApiKey: (haveKey: boolean) => set({ isOpenApiKey: haveKey }),
  setIsGeminiApiKey: (haveKey: boolean) => set({ isGeminiApiKey: haveKey })
});
