import { isErrorWithCode, statusCodes } from '@react-native-google-signin/google-signin';
import i18n from '../i18n';
import {
  GoogleSignInCancelledError,
  GoogleSignInNotConfiguredError,
} from '../services/googleSignIn';

/**
 * Google Sign-In / Firebase 連携の例外をユーザー向け文言に変換する。
 * @returns {string | null} null はキャンセル等でアラート不要
 */
export function getGoogleSignInErrorMessage(error) {
  if (!error) {
    return i18n.t('auth.googleLoginError');
  }

  if (error instanceof GoogleSignInCancelledError) {
    return null;
  }

  if (error instanceof GoogleSignInNotConfiguredError) {
    return i18n.t('auth.googleNotConfigured');
  }

  if (
    String(error?.code) === '12500' ||
    /\b12500\b/.test(String(error?.message ?? ''))
  ) {
    return i18n.t('auth.googleError12500');
  }

  if (isErrorWithCode(error)) {
    switch (error.code) {
      case statusCodes.SIGN_IN_CANCELLED:
        return null;
      case statusCodes.IN_PROGRESS:
        return i18n.t('auth.googleLoginInProgress');
      case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
        return i18n.t('auth.googlePlayServicesUnavailable');
      case statusCodes.DEVELOPER_ERROR:
        return i18n.t('auth.googleDeveloperError');
      case '12500':
      case 12500:
        return i18n.t('auth.googleError12500');
      default:
        break;
    }
  }

  if (typeof error.message === 'string' && error.message.includes('idToken is missing')) {
    return i18n.t('auth.googleIdTokenMissing');
  }

  const firebaseCode = error.code;
  if (firebaseCode === 'auth/invalid-credential') {
    return i18n.t('auth.googleInvalidCredential');
  }
  if (firebaseCode === 'auth/network-request-failed') {
    return i18n.t('auth.googleNetworkError');
  }

  const detail = firebaseCode || error.message;
  if (detail) {
    return i18n.t('auth.googleLoginErrorDetail', { detail: String(detail) });
  }

  return i18n.t('auth.googleLoginError');
}
