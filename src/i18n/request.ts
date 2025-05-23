import { getRequestConfig } from 'next-intl/server';
import { SUPPORTED_LOCALES } from './config';
import { getUserLocale } from '../service/clientLocale';

export type Locale = 'en' | 'ja' | 'vi';
export const defaultLocale = 'vi';

export interface RequestConfig {
  locale: Locale;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  messages: Record<string, any>;
}

export default getRequestConfig(async (): Promise<RequestConfig> => {
  const locale = getUserLocale();

  if (!SUPPORTED_LOCALES.includes(locale as Locale)) {
    const mod = await import(`../../public/messages/en.json`);
    return {
      locale: 'en',
      messages: mod.default
    };
  }

  const mod = await import(`../../public/messages/${locale}.json`);
  return {
    locale: locale as Locale,
    messages: mod.default
  };
});
