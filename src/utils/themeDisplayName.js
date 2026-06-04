/**
 * @param {string} themeKey
 * @param {import('i18n-js').I18n} i18n
 */
export function getThemeDisplayName(themeKey, i18n) {
  const key = `settings.themes.${themeKey}`;
  const translated = i18n.t(key);
  return translated !== key ? translated : themeKey;
}
