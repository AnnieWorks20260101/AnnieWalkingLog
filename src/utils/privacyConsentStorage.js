import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { PRIVACY_POLICY_VERSION } from '../constants/legalUrls';

const PRIVACY_CONSENT_KEY = '@legal/privacy_consent_v1';

function buildConsentPayload() {
  return {
    version: PRIVACY_POLICY_VERSION,
    acceptedAt: new Date().toISOString(),
  };
}

/**
 * @returns {Promise<boolean>}
 */
export async function hasAcceptedPrivacyPolicy() {
  try {
    const raw = await AsyncStorage.getItem(PRIVACY_CONSENT_KEY);
    if (!raw) {
      return false;
    }
    const parsed = JSON.parse(raw);
    return parsed?.version === PRIVACY_POLICY_VERSION;
  } catch (error) {
    console.warn('hasAcceptedPrivacyPolicy failed:', error);
    return false;
  }
}

/**
 * 端末ローカルと Firestore users/{uid}.privacyConsent の両方に同意を記録する。
 * @param {string | null | undefined} userId 省略時は auth.currentUser を使用
 */
export async function setAcceptedPrivacyPolicy(userId = null) {
  const payload = buildConsentPayload();

  await AsyncStorage.setItem(PRIVACY_CONSENT_KEY, JSON.stringify(payload));

  const uid = userId ?? auth.currentUser?.uid;
  if (!uid) {
    return;
  }

  try {
    await setDoc(
      doc(db, 'users', uid),
      { privacyConsent: payload },
      { merge: true }
    );
  } catch (error) {
    console.warn('setAcceptedPrivacyPolicy Firestore write failed:', error);
    throw error;
  }
}

export async function clearAcceptedPrivacyPolicy() {
  await AsyncStorage.removeItem(PRIVACY_CONSENT_KEY);
}
