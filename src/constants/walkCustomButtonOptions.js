/** お散歩中カスタムボタンで選べるアイコン */
export const WALK_CUSTOM_BUTTON_OPTIONS = [
  { id: 'pee', icon: '💦', labelKey: 'settings.customButton.pee' },
  { id: 'dog', icon: '🐶', labelKey: 'settings.customButton.dog' },
  { id: 'water', icon: '💧', labelKey: 'settings.customButton.water' },
  { id: 'star', icon: '⭐', labelKey: 'settings.customButton.star' },
  { id: 'heart_yellow', icon: '💛', labelKey: 'settings.customButton.heartYellow' },
  { id: 'heart', icon: '❤️', labelKey: 'settings.customButton.heart' },
  { id: 'paw', icon: '🐾', labelKey: 'settings.customButton.paw' },
  { id: 'flower', icon: '🌸', labelKey: 'settings.customButton.flower' },
  { id: 'bone', icon: '🦴', labelKey: 'settings.customButton.bone' },
  { id: 'ball', icon: '🎾', labelKey: 'settings.customButton.ball' },
  { id: 'exclamation', icon: '❗', labelKey: 'settings.customButton.exclamation' },
  { id: 'question', icon: '❓', labelKey: 'settings.customButton.question' },
];

export const DEFAULT_WALK_CUSTOM_BUTTON_ID = 'pee';

/** 削除済み ID（旧バージョンからの移行用） */
export const DEPRECATED_WALK_CUSTOM_BUTTON_IDS = new Set(['circle', 'poop']);

export function getWalkCustomButtonOption(id) {
  const resolvedId = normalizeWalkCustomButtonId(id);
  return WALK_CUSTOM_BUTTON_OPTIONS.find((o) => o.id === resolvedId);
}

export function isValidWalkCustomButtonId(id) {
  return WALK_CUSTOM_BUTTON_OPTIONS.some((o) => o.id === id);
}

export function normalizeWalkCustomButtonId(id) {
  if (isValidWalkCustomButtonId(id)) {
    return id;
  }
  if (DEPRECATED_WALK_CUSTOM_BUTTON_IDS.has(id)) {
    return DEFAULT_WALK_CUSTOM_BUTTON_ID;
  }
  return DEFAULT_WALK_CUSTOM_BUTTON_ID;
}
