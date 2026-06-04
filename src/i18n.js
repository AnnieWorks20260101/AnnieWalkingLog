import { I18n } from 'i18n-js';
import { getLocales } from 'expo-localization';
import ja from './locales/ja.json';
import en from './locales/en.json';
import { resolveInitialLocale } from './i18n/localeConfig';

const i18n = new I18n({ ja, en });

let deviceLocale = 'ja';
try {
  const locales = getLocales();
  deviceLocale = locales[0]?.languageCode ?? locales[0]?.languageTag ?? 'ja';
} catch (error) {
  console.warn('Failed to read device locale, falling back to ja', error);
}

i18n.locale = resolveInitialLocale(deviceLocale);
i18n.enableFallback = true;
i18n.defaultLocale = 'ja';

export default i18n;
