/* eslint-disable @typescript-eslint/no-explicit-any */
import { getRequestConfig } from 'next-intl/server';

export type Locale = 'en' | 'ja' | 'vi';
export const defaultLocale = 'vi';

// Định nghĩa một interface cho cấu hình trả về của hàm
export interface RequestConfig {
  locale: Locale;
  messages: Record<string, any>; // có thể thay đổi chi tiết type của messages nếu cần
}

export const STORAGE_KEY_LOCALE = 'locale';

export default getRequestConfig(async (): Promise<RequestConfig> => {
  const listSupportedLocales: Locale[] = ['en', 'ja', 'vi'];
  const locale = 'en';

  if (!listSupportedLocales.includes(locale as Locale)) {
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
