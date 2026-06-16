/** @typedef {'ja' | 'en' | 'es' | 'ko' | 'de' | 'fr' | 'it' | 'pt' | 'nl'} AppLocale */

export const APP_LOCALES = /** @type {const} */ ([
  'ja',
  'en',
  'es',
  'ko',
  'de',
  'fr',
  'it',
  'pt',
  'nl',
]);

/**
 * @param {string | undefined | null} locale
 * @returns {AppLocale}
 */
export function normalizeAppLocale(locale) {
  if (!locale) {
    return 'ja';
  }
  const code = String(locale).toLowerCase().split(/[-_]/)[0];
  return APP_LOCALES.includes(/** @type {AppLocale} */ (code)) ? /** @type {AppLocale} */ (code) : 'en';
}

/**
 * @param {string | undefined | null} deviceLocale
 * @returns {AppLocale}
 */
export function resolveInitialLocale(deviceLocale) {
  return normalizeAppLocale(deviceLocale);
}
