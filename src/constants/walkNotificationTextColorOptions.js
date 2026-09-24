/** お散歩中の通知／Live Activity の文字色 */
export const WALK_NOTIFICATION_TEXT_COLOR_OPTIONS = [
  { id: 'white', hex: '#FFFFFF' },
  { id: 'black', hex: '#000000' },
  { id: 'green', hex: '#2E7D32' },
  { id: 'red', hex: '#C62828' },
  { id: 'blue', hex: '#1565C0' },
];

export const DEFAULT_WALK_NOTIFICATION_TEXT_COLOR_ID = 'white';

export function isValidWalkNotificationTextColorId(value) {
  return WALK_NOTIFICATION_TEXT_COLOR_OPTIONS.some((option) => option.id === value);
}

export function normalizeWalkNotificationTextColorId(value) {
  if (isValidWalkNotificationTextColorId(value)) {
    return value;
  }
  return DEFAULT_WALK_NOTIFICATION_TEXT_COLOR_ID;
}

export function getWalkNotificationTextColorOption(id) {
  const normalized = normalizeWalkNotificationTextColorId(id);
  return (
    WALK_NOTIFICATION_TEXT_COLOR_OPTIONS.find((option) => option.id === normalized) ||
    WALK_NOTIFICATION_TEXT_COLOR_OPTIONS[0]
  );
}

export function getWalkNotificationTextColorHex(id) {
  return getWalkNotificationTextColorOption(id).hex;
}

/**
 * @param {string} id
 * @param {import('i18n-js').I18n} i18n
 */
export function getWalkNotificationTextColorLabel(id, i18n) {
  const normalized = normalizeWalkNotificationTextColorId(id);
  return i18n.t(`settings.notificationTextColor_${normalized}`);
}
