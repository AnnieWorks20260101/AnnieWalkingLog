import { Platform } from 'react-native';
import Constants from 'expo-constants';
import ja from '../locales/ja.json';

/**
 * Android メーカー別のバックグラウンド案内文言キー用カテゴリ
 */
export function getDeviceManufacturerCategory() {
  if (Platform.OS === 'ios') {
    return 'ios';
  }
  if (Platform.OS !== 'android') {
    return 'generic';
  }

  const manufacturer = (
    Constants.platform?.android?.manufacturer ??
    Constants.brand ??
    ''
  )
    .toString()
    .toLowerCase();

  if (/xiaomi|redmi|poco/i.test(manufacturer)) {
    return 'xiaomi';
  }
  if (/samsung/i.test(manufacturer)) {
    return 'samsung';
  }
  if (/huawei|honor/i.test(manufacturer)) {
    return 'huawei';
  }
  if (/oppo|realme|oneplus/i.test(manufacturer)) {
    return 'oppo';
  }
  if (/vivo/i.test(manufacturer)) {
    return 'vivo';
  }
  if (/google/i.test(manufacturer)) {
    return 'google';
  }
  return 'generic';
}

const STRICT_ANDROID_CATEGORIES = new Set(['xiaomi', 'samsung', 'huawei', 'oppo', 'vivo']);

export function isStrictAndroidDevice() {
  if (Platform.OS !== 'android') {
    return false;
  }
  return STRICT_ANDROID_CATEGORIES.has(getDeviceManufacturerCategory());
}

export function getManufacturerDisplayName() {
  if (Platform.OS === 'ios') {
    return 'iOS';
  }
  const manufacturer = (
    Constants.platform?.android?.manufacturer ??
    Constants.brand ??
    ''
  )
    .toString()
    .trim();
  return manufacturer || 'Android';
}

export function getDeviceGuideBodyKey(category) {
  const suffix = `deviceGuideBody_${category}`;
  if (ja.walk[suffix]) {
    return `walk.${suffix}`;
  }
  return 'walk.deviceGuideBody_generic';
}
