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
  const locale = await getUserLocale();

  if (!SUPPORTED_LOCALES.includes(locale as Locale)) {
    return {
      locale: 'en',
      messages: (await import(`../../public/messages/en.json`)).default
    };
  }

  return {
    locale: locale as Locale,
    messages: (await import(`../../public/messages/${locale}.json`)).default
  };
});
