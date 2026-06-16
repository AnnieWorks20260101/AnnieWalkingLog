import { I18n } from 'i18n-js';
import { getLocales } from 'expo-localization';
import ja from './locales/ja.json';
import en from './locales/en.json';
import es from './locales/es.json';
import ko from './locales/ko.json';
import de from './locales/de.json';
import fr from './locales/fr.json';
import it from './locales/it.json';
import pt from './locales/pt.json';
import nl from './locales/nl.json';
import { resolveInitialLocale } from './i18n/localeConfig';

const i18n = new I18n({ ja, en, es, ko, de, fr, it, pt, nl });

let deviceLocale = 'ja';
try {
  const locales = getLocales();
  deviceLocale = locales[0]?.languageCode ?? locales[0]?.languageTag ?? 'ja';
} catch (error) {
  console.warn('Failed to read device locale, falling back to ja', error);
}

i18n.locale = resolveInitialLocale(deviceLocale);
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export default i18n;
