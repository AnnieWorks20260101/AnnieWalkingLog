const DEFAULT_DISPLAY_NAMES = new Set(['ユーザー', 'ゲスト']);

/** 未設定扱いのデフォルト表示名か */
export function isDefaultDisplayName(name) {
  const trimmed = name?.trim() ?? '';
  return !trimmed || DEFAULT_DISPLAY_NAMES.has(trimmed);
}

/** 入力欄用に空文字へ正規化 */
export function getEditableDisplayName(name) {
  return isDefaultDisplayName(name) ? '' : name.trim();
}

/** 一覧表示用ラベル（未設定は null） */
export function getDisplayNameOrNull(name) {
  return isDefaultDisplayName(name) ? null : name.trim();
}

/** プッシュ通知などで使う送信者ラベル（未設定は null） */
export function getNotificationSenderName(name) {
  return getDisplayNameOrNull(name);
}
