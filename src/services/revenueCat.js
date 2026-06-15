import { Platform } from 'react-native';
import Constants from 'expo-constants';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { REVENUECAT_ENTITLEMENT_ID } from '../constants/revenueCat';

let isConfigured = false;
let identifiedFamilyId = null;

function getRevenueCatApiKey() {
  const extra = Constants.expoConfig?.extra ?? {};
  if (Platform.OS === 'ios') {
    return extra.revenueCatApiKeyIos?.trim() || null;
  }
  if (Platform.OS === 'android') {
    return extra.revenueCatApiKeyAndroid?.trim() || null;
  }
  return null;
}

export function isRevenueCatSupportedPlatform() {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

export function isRevenueCatConfigured() {
  return isConfigured;
}

/**
 * アプリ起動時に1回だけ呼ぶ（ステップ5）。
 * @returns {boolean} 設定できたか
 */
export function configureRevenueCat() {
  if (isConfigured) {
    return true;
  }

  if (!isRevenueCatSupportedPlatform()) {
    return false;
  }

  const apiKey = getRevenueCatApiKey();
  if (!apiKey) {
    console.warn(
      '[RevenueCat] API キーが未設定です。.env に REVENUECAT_API_KEY_IOS / REVENUECAT_API_KEY_ANDROID を設定してください。'
    );
    return false;
  }

  Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.INFO);
  Purchases.configure({ apiKey });
  isConfigured = true;
  return true;
}

/**
 * @param {import('react-native-purchases').CustomerInfo | null | undefined} customerInfo
 */
export function isRevenueCatEntitlementActive(customerInfo) {
  if (!customerInfo?.entitlements?.active) {
    return false;
  }
  return customerInfo.entitlements.active[REVENUECAT_ENTITLEMENT_ID] != null;
}

/**
 * 家族単位の課金: App User ID に familyId を使う（1人加入で家族全員）。
 * @param {string} familyId
 * @param {{ userId?: string | null }} [options]
 */
export async function identifyRevenueCatFamily(familyId, options = {}) {
  if (!familyId) {
    return null;
  }

  if (!configureRevenueCat()) {
    return null;
  }

  if (identifiedFamilyId === familyId) {
    return Purchases.getCustomerInfo();
  }

  const { customerInfo, created } = await Purchases.logIn(familyId);
  identifiedFamilyId = familyId;

  if (options.userId) {
    try {
      await Purchases.setAttributes({
        firebase_user_id: options.userId,
      });
    } catch (error) {
      console.warn('[RevenueCat] setAttributes failed:', error);
    }
  }

  if (__DEV__ && created) {
    console.log('[RevenueCat] New customer created for family:', familyId);
  }

  return customerInfo;
}

export async function resetRevenueCatUser() {
  if (!isConfigured) {
    identifiedFamilyId = null;
    return null;
  }

  try {
    const customerInfo = await Purchases.logOut();
    identifiedFamilyId = null;
    return customerInfo;
  } catch (error) {
    console.warn('[RevenueCat] logOut failed:', error);
    identifiedFamilyId = null;
    return null;
  }
}

export async function getRevenueCatCustomerInfo() {
  if (!isConfigured) {
    return null;
  }

  try {
    return await Purchases.getCustomerInfo();
  } catch (error) {
    console.warn('[RevenueCat] getCustomerInfo failed:', error);
    return null;
  }
}

export async function isRevenueCatPremiumActive() {
  const customerInfo = await getRevenueCatCustomerInfo();
  return isRevenueCatEntitlementActive(customerInfo);
}

/**
 * @param {(customerInfo: import('react-native-purchases').CustomerInfo) => void} listener
 * @returns {() => void} unsubscribe
 */
export function addRevenueCatCustomerInfoListener(listener) {
  if (!isRevenueCatSupportedPlatform()) {
    return () => {};
  }

  configureRevenueCat();
  Purchases.addCustomerInfoUpdateListener(listener);
  return () => {
    Purchases.removeCustomerInfoUpdateListener(listener);
  };
}
