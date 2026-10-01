/**
 * v1.05 アップデートお知らせ（AnnieEndingNote の v104-intro 相当）
 * アプリ本体が 1.05.00 以上のときだけ表示する。
 */
export const V105_INTRO_MIN_VERSION = '1.05.00';

/**
 * @param {string} a
 * @param {string} b
 * @returns {number} negative if a < b, 0 if equal, positive if a > b
 */
export function compareAppVersions(a, b) {
  const parse = (value) =>
    String(value || '0')
      .split('.')
      .map((part) => {
        const n = parseInt(part, 10);
        return Number.isFinite(n) ? n : 0;
      });
  const left = parse(a);
  const right = parse(b);
  const len = Math.max(left.length, right.length);
  for (let i = 0; i < len; i += 1) {
    const l = left[i] ?? 0;
    const r = right[i] ?? 0;
    if (l !== r) {
      return l - r;
    }
  }
  return 0;
}

/**
 * @param {Record<string, unknown> | null | undefined} userData
 * @param {{ isGuest?: boolean, appVersion?: string }} [options]
 */
export function needsV105Intro(userData, options = {}) {
  if (options.isGuest === true) {
    return false;
  }
  if (userData?.isGuest === true || userData?.authProvider === 'guest') {
    return false;
  }
  const appVersion = options.appVersion;
  if (
    typeof appVersion === 'string' &&
    compareAppVersions(appVersion, V105_INTRO_MIN_VERSION) < 0
  ) {
    return false;
  }
  if (!userData) {
    // ドキュメント未取得時はまだ判定しない（フック側で待つ）
    return false;
  }
  return userData.hasSeenV105Intro !== true;
}
