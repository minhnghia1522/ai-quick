import { STORAGE_KEY_LOCALE } from '../i18n/request';

// Default locale if none is stored
const DEFAULT_LOCALE = 'en';

// List of supported locales
const SUPPORTED_LOCALES = ['en', 'vi', 'ja'];

/**
 * Gets the user's locale from localStorage or navigator preferences
 */
export function getClientLocale(): string {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;

  // First check localStorage
  const savedLocale = localStorage.getItem(STORAGE_KEY_LOCALE);
  if (savedLocale && SUPPORTED_LOCALES.includes(savedLocale)) {
    return savedLocale;
  }

  // Then check browser settings
  const browserLocales = navigator.languages || [navigator.language];

  // Find the first browser locale that matches our supported locales
  for (const locale of browserLocales) {
    const shortLocale = locale.split('-')[0];
    if (SUPPORTED_LOCALES.includes(shortLocale)) {
      return shortLocale;
    }
  }

  return DEFAULT_LOCALE;
}

/**
 * Sets the user's locale in localStorage
 */
export function setClientLocale(locale: string): void {
  if (typeof window !== 'undefined' && SUPPORTED_LOCALES.includes(locale)) {
    localStorage.setItem(STORAGE_KEY_LOCALE, locale);
  }
}

/**
 * Loads the messages for a specific locale by fetching from public folder
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function loadLocaleMessages(locale: string): Promise<any> {
  try {
    const response = await fetch(`/messages/${locale}.json`);

    if (!response.ok) {
      throw new Error(`Failed to load locale file: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to load messages for locale ${locale}:`, error);

    // Try to load default locale as fallback if different
    if (locale !== DEFAULT_LOCALE) {
      try {
        const fallbackResponse = await fetch(`/messages/${DEFAULT_LOCALE}.json`);
        if (fallbackResponse.ok) {
          return await fallbackResponse.json();
        }
      } catch (fallbackError) {
        console.error(`Failed to load fallback locale:`, fallbackError);
      }
    }

    // Return empty object if everything fails
    return {};
  }
}
