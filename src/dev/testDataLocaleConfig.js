/** @typedef {'ja' | 'en' | 'es' | 'ko' | 'de' | 'fr' | 'it' | 'pt' | 'nl'} TestDataLocale */

/** @type {Record<TestDataLocale, { defaultPetName: string, petNameSeparator: string }>} */
export const TEST_DATA_LOCALE_CONFIG = {
  ja: { defaultPetName: 'ペット', petNameSeparator: '、' },
  en: { defaultPetName: 'Pet', petNameSeparator: ', ' },
  es: { defaultPetName: 'Mascota', petNameSeparator: ', ' },
  ko: { defaultPetName: '반려동물', petNameSeparator: ', ' },
  de: { defaultPetName: 'Haustier', petNameSeparator: ', ' },
  fr: { defaultPetName: 'Animal', petNameSeparator: ', ' },
  it: { defaultPetName: 'Animale', petNameSeparator: ', ' },
  pt: { defaultPetName: 'Animal', petNameSeparator: ', ' },
  nl: { defaultPetName: 'Huisdier', petNameSeparator: ', ' },
};

/**
 * @param {string | undefined | null} locale
 * @returns {{ defaultPetName: string, petNameSeparator: string, locale: TestDataLocale }}
 */
export function getTestDataLocaleConfig(locale) {
  const code = String(locale || 'en')
    .toLowerCase()
    .split(/[-_]/)[0];
  const resolved = Object.prototype.hasOwnProperty.call(TEST_DATA_LOCALE_CONFIG, code)
    ? /** @type {TestDataLocale} */ (code)
    : 'en';
  return { ...TEST_DATA_LOCALE_CONFIG[resolved], locale: resolved };
}
