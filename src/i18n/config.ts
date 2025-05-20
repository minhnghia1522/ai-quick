export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const STORAGE_KEY_LOCALE = 'locale';
export const SUPPORTED_LOCALES = ['en', 'vi', 'ja'] as const;
export const DEFAULT_LOCALE: Locale = 'en';
