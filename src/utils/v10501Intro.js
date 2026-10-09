import { compareAppVersions } from './v105Intro';

/**
 * v1.05.01 アップデートお知らせ
 * アプリ本体が 1.05.01 以上のときだけ表示する。
 * v1.05 案内（hasSeenV105Intro）とは別フラグ。1.04 などからの更新では両方出うる。
 */
export const V10501_INTRO_MIN_VERSION = '1.05.01';

/**
 * @param {Record<string, unknown> | null | undefined} userData
 * @param {{ isGuest?: boolean, appVersion?: string }} [options]
 */
export function needsV10501Intro(userData, options = {}) {
  if (options.isGuest === true) {
    return false;
  }
  if (userData?.isGuest === true || userData?.authProvider === 'guest') {
    return false;
  }
  const appVersion = options.appVersion;
  if (
    typeof appVersion === 'string' &&
    compareAppVersions(appVersion, V10501_INTRO_MIN_VERSION) < 0
  ) {
    return false;
  }
  if (!userData) {
    return false;
  }
  return userData.hasSeenV10501Intro !== true;
}
