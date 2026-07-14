/** Notion 上の法的文書（全言語共通） */
export const PRIVACY_POLICY_URL =
  'https://peppered-marigold-b52.notion.site/Annie-s-Walking-Log-Privacy-Policy-39daf1786c2780838a54e9b60efa0807';

export const TERMS_OF_SERVICE_URL =
  'https://peppered-marigold-b52.notion.site/Annie-s-Walking-Log-Terms-of-Service-39daf1786c27809ea788cec0a7f6427b?pvs=73';

/** ポリシー改定時は日付を更新し、未同意ユーザーに再同意を求める */
export const PRIVACY_POLICY_VERSION = '2026-06-16';

/** 利用規約改定時は日付を更新し、未同意ユーザーに再同意を求める */
export const TERMS_OF_SERVICE_VERSION = '2026-06-16';

/**
 * @param {string | undefined | null} [_locale] 互換のため残置（全言語同一 URL）
 * @returns {string}
 */
export function getPrivacyPolicyUrl(_locale = 'ja') {
  return PRIVACY_POLICY_URL;
}

/**
 * @param {string | undefined | null} [_locale] 互換のため残置（全言語同一 URL）
 * @returns {string}
 */
export function getTermsOfServiceUrl(_locale = 'ja') {
  return TERMS_OF_SERVICE_URL;
}
