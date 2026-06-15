import { Platform } from 'react-native';
import { appleAuth, appleAuthAndroid } from '@invertase/react-native-apple-authentication';
import { APPLE_SERVICES_ID, APPLE_REDIRECT_URI } from '../constants/appleAuth';

export class AppleSignInCancelledError extends Error {
  constructor() {
    super('Apple sign-in cancelled');
    this.name = 'AppleSignInCancelledError';
  }
}

export class AppleSignInUnavailableError extends Error {
  constructor() {
    super('Sign in with Apple is not available on this device');
    this.name = 'AppleSignInUnavailableError';
  }
}

function formatAppleFullName(fullName) {
  if (!fullName) {
    return null;
  }
  const parts = [fullName.givenName, fullName.familyName].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : null;
}

function generateRawNonce(length = 32) {
  const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-._';
  let result = '';
  for (let i = 0; i < length; i += 1) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

function isAppleSignInCancelled(error) {
  if (!error) {
    return false;
  }
  if (error.code === appleAuth.Error.CANCELED) {
    return true;
  }
  if (error.code === appleAuthAndroid.Error.SIGNIN_CANCELLED) {
    return true;
  }
  if (error.message === appleAuthAndroid.Error.SIGNIN_CANCELLED) {
    return true;
  }
  return false;
}

async function getAppleSignInTokensIOS() {
  if (!appleAuth.isSupported) {
    throw new AppleSignInUnavailableError();
  }

  const rawNonce = generateRawNonce();

  try {
    const response = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      nonce: rawNonce,
    });

    if (!response.identityToken) {
      throw new Error('Apple sign-in succeeded but identityToken is missing');
    }

    return {
      idToken: response.identityToken,
      rawNonce,
      user: {
        email: response.email ?? null,
        name: formatAppleFullName(response.fullName),
      },
    };
  } catch (error) {
    if (isAppleSignInCancelled(error)) {
      throw new AppleSignInCancelledError();
    }
    throw error;
  }
}

async function getAppleSignInTokensAndroid() {
  if (!appleAuthAndroid.isSupported) {
    throw new AppleSignInUnavailableError();
  }

  const rawNonce = generateRawNonce();
  const state = generateRawNonce();

  appleAuthAndroid.configure({
    clientId: APPLE_SERVICES_ID,
    redirectUri: APPLE_REDIRECT_URI,
    responseType: appleAuthAndroid.ResponseType.ID_TOKEN,
    scope: appleAuthAndroid.Scope.ALL,
    nonce: rawNonce,
    state,
  });

  try {
    const response = await appleAuthAndroid.signIn();
    const idToken = response.id_token;

    if (!idToken) {
      throw new Error('Apple sign-in succeeded but id_token is missing');
    }

    const androidUser = response.user;
    const name = androidUser?.name
      ? formatAppleFullName({
          givenName: androidUser.name.firstName,
          familyName: androidUser.name.lastName,
        })
      : null;

    return {
      idToken,
      rawNonce,
      user: {
        email: androidUser?.email ?? null,
        name,
      },
    };
  } catch (error) {
    if (isAppleSignInCancelled(error)) {
      throw new AppleSignInCancelledError();
    }
    if (error?.code === appleAuthAndroid.Error.NOT_CONFIGURED) {
      throw new AppleSignInUnavailableError();
    }
    throw error;
  }
}

/**
 * @returns {Promise<{ idToken: string, rawNonce: string, user: { email: string | null, name: string | null } }>}
 */
export async function getAppleSignInTokens() {
  if (Platform.OS === 'android') {
    return getAppleSignInTokensAndroid();
  }
  return getAppleSignInTokensIOS();
}

export async function isAppleSignInAvailable() {
  try {
    if (Platform.OS === 'android') {
      return appleAuthAndroid.isSupported;
    }
    return appleAuth.isSupported;
  } catch (error) {
    console.warn('isAppleSignInAvailable failed:', error);
    return false;
  }
}
