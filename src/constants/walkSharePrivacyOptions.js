/** 記録共有時に開始・終了地点からマスクする距離（メートル）。0 はマスクなし */
export const WALK_SHARE_PRIVACY_RADIUS_OPTIONS = [0, 100, 200, 300, 400, 500];

export const DEFAULT_WALK_SHARE_PRIVACY_RADIUS_METERS = 0;

export function isValidWalkSharePrivacyRadius(value) {
  const meters = Number(value);
  return WALK_SHARE_PRIVACY_RADIUS_OPTIONS.includes(meters);
}

export function normalizeWalkSharePrivacyRadius(value) {
  const meters = Number(value);
  if (isValidWalkSharePrivacyRadius(meters)) {
    return meters;
  }
  return DEFAULT_WALK_SHARE_PRIVACY_RADIUS_METERS;
}

/**
 * @param {number} radiusMeters
 * @param {'metric' | 'imperial'} unitSystem
 * @param {import('i18n-js').I18n} i18n
 */
export function getWalkSharePrivacyRadiusLabel(radiusMeters, unitSystem, i18n) {
  if (radiusMeters === 0) {
    return i18n.t('settings.sharePrivacyOff');
  }
  if (unitSystem === 'imperial') {
    return i18n.t(`settings.sharePrivacyImperial_${radiusMeters}`);
  }
  return i18n.t('settings.sharePrivacyMetric', { meters: radiusMeters });
}
