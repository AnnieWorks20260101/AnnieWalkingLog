import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import ja from './locales/ja.json';

// 言語定義を設定
const i18n = new I18n({
  ja,
  // 英語など他の言語が必要になったらここに追加します
  // en: require('./locales/en.json'),
});

// アプリ起動時にデバイスの言語設定を取得して設定
i18n.locale = Localization.locale;

// デバイスの言語が設定されていない言語の場合はフォールバックする
i18n.enableFallback = true;
i18n.defaultLocale = 'ja';

export default i18n;
