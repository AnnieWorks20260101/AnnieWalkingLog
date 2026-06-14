import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { TERMS_OF_SERVICE_VERSION } from '../constants/legalUrls';
import { isAccountDeletionInProgress } from './accountDeletionState';

const TERMS_CONSENT_KEY = '@legal/terms_consent_v1';

function buildConsentPayload() {
  return {
    version: TERMS_OF_SERVICE_VERSION,
    acceptedAt: new Date().toISOString(),
  };
}

/**
 * @returns {Promise<boolean>}
 */
export async function hasAcceptedTermsOfService() {
  try {
    const raw = await AsyncStorage.getItem(TERMS_CONSENT_KEY);
    if (!raw) {
      return false;
    }
    const parsed = JSON.parse(raw);
    return parsed?.version === TERMS_OF_SERVICE_VERSION;
  } catch (error) {
    console.warn('hasAcceptedTermsOfService failed:', error);
    return false;
  }
}

/**
 * 端末ローカルと Firestore users/{uid}.termsConsent の両方に同意を記録する。
 * @param {string | null | undefined} userId 省略時は auth.currentUser を使用
 */
export async function setAcceptedTermsOfService(userId = null) {
  const payload = buildConsentPayload();

  await AsyncStorage.setItem(TERMS_CONSENT_KEY, JSON.stringify(payload));

  const uid = userId ?? auth.currentUser?.uid;
  if (!uid || isAccountDeletionInProgress()) {
    return;
  }

  try {
    await setDoc(
      doc(db, 'users', uid),
      { termsConsent: payload },
      { merge: true }
    );
  } catch (error) {
    console.warn('setAcceptedTermsOfService Firestore write failed:', error);
    throw error;
  }
}

export async function clearAcceptedTermsOfService() {
  await AsyncStorage.removeItem(TERMS_CONSENT_KEY);
}
