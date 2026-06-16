import { normalizeAppLocale } from '../i18n/localeConfig';

const LEGAL_SITE_ORIGIN = 'https://www.annie-works.com';
const LEGAL_APP_PATH = 'AnnieWalkingLog';

/** ポリシー改定時は日付を更新し、未同意ユーザーに再同意を求める */
export const PRIVACY_POLICY_VERSION = '2026-05-29';

/** 利用規約改定時は日付を更新し、未同意ユーザーに再同意を求める */
export const TERMS_OF_SERVICE_VERSION = '2026-05-29';

/**
 * アプリ locale（ja.json 等の先頭2文字）→ 製品HPの言語パス。
 * 日本語のみ Web 側が `jp`（`ja` ではない）。
 * @param {string | undefined | null} locale
 * @returns {string}
 */
export function getLegalWebsiteLangCode(locale) {
  const appLocale = normalizeAppLocale(locale);
  if (appLocale === 'ja') {
    return 'jp';
  }
  return appLocale;
}

/**
 * @param {string | undefined | null} [locale] 省略時は日本語（jp）
 * @returns {string}
 */
export function getPrivacyPolicyUrl(locale = 'ja') {
  const lang = getLegalWebsiteLangCode(locale);
  return `${LEGAL_SITE_ORIGIN}/${lang}/${LEGAL_APP_PATH}/Privacy-Policy`;
}

/**
 * @param {string | undefined | null} [locale] 省略時は日本語（jp）
 * @returns {string}
 */
export function getTermsOfServiceUrl(locale = 'ja') {
  const lang = getLegalWebsiteLangCode(locale);
  return `${LEGAL_SITE_ORIGIN}/${lang}/${LEGAL_APP_PATH}/ToS`;
}

/** @deprecated getPrivacyPolicyUrl(i18n.locale) を使用 */
export const PRIVACY_POLICY_URL = getPrivacyPolicyUrl('ja');

/** @deprecated getTermsOfServiceUrl(i18n.locale) を使用 */
export const TERMS_OF_SERVICE_URL = getTermsOfServiceUrl('ja');
