import { I18n } from 'i18n-js';
import { getLocales } from 'expo-localization';
import ja from './locales/ja.json';

// 言語定義を設定
const i18n = new I18n({
  ja,
  // 英語など他の言語が必要になったらここに追加します
  // en: require('./locales/en.json'),
});

// アプリ起動時にデバイスの言語設定を取得して設定
let deviceLocale = 'ja';
try {
  const locales = getLocales();
  deviceLocale = locales[0]?.languageTag ?? locales[0]?.languageCode ?? 'ja';
} catch (error) {
  console.warn('Failed to read device locale, falling back to ja', error);
}
i18n.locale = deviceLocale;

// デバイスの言語が設定されていない言語の場合はフォールバックする
i18n.enableFallback = true;
i18n.defaultLocale = 'ja';

export default i18n;
