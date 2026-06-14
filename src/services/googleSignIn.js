import Constants from 'expo-constants';
import { Platform } from 'react-native';
import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';

let configured = false;

export class GoogleSignInCancelledError extends Error {
  constructor() {
    super('Google sign-in cancelled');
    this.name = 'GoogleSignInCancelledError';
  }
}

export class GoogleSignInNotConfiguredError extends Error {
  constructor() {
    super('GOOGLE_WEB_CLIENT_ID is not configured');
    this.name = 'GoogleSignInNotConfiguredError';
  }
}

function getGoogleWebClientId() {
  return Constants.expoConfig?.extra?.googleWebClientId?.trim() || null;
}

export function ensureGoogleSignInConfigured() {
  const webClientId = getGoogleWebClientId();
  if (!webClientId) {
    throw new GoogleSignInNotConfiguredError();
  }

  if (!configured) {
    GoogleSignin.configure({
      webClientId,
      offlineAccess: false,
    });
    configured = true;
  }
}

/**
 * @returns {Promise<{ idToken: string, user: { email: string | null, name: string | null, photo: string | null } }>}
 */
export async function getGoogleSignInTokens() {
  ensureGoogleSignInConfigured();

  if (Platform.OS === 'android') {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  }

  try {
    const response = await GoogleSignin.signIn();

    if (response.type === 'cancelled') {
      throw new GoogleSignInCancelledError();
    }

    const idToken = response.data?.idToken;
    if (!idToken) {
      throw new Error('Google sign-in succeeded but idToken is missing');
    }

    const profile = response.data?.user;
    return {
      idToken,
      user: {
        email: profile?.email ?? null,
        name: profile?.name ?? null,
        photo: profile?.photo ?? null,
      },
    };
  } catch (error) {
    if (error instanceof GoogleSignInCancelledError) {
      throw error;
    }
    if (isErrorWithCode(error) && error.code === statusCodes.SIGN_IN_CANCELLED) {
      throw new GoogleSignInCancelledError();
    }
    throw error;
  }
}
