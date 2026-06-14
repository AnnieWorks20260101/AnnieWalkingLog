import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';

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

/**
 * @returns {Promise<{ idToken: string, rawNonce: string, user: { email: string | null, name: string | null } }>}
 */
export async function getAppleSignInTokens() {
  const isAvailable = await AppleAuthentication.isAvailableAsync();
  if (!isAvailable) {
    throw new AppleSignInUnavailableError();
  }

  const rawNonce = generateRawNonce();
  const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);

  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });

    if (!credential.identityToken) {
      throw new Error('Apple sign-in succeeded but identityToken is missing');
    }

    return {
      idToken: credential.identityToken,
      rawNonce,
      user: {
        email: credential.email ?? null,
        name: formatAppleFullName(credential.fullName),
      },
    };
  } catch (error) {
    if (error?.code === 'ERR_REQUEST_CANCELED') {
      throw new AppleSignInCancelledError();
    }
    throw error;
  }
}

export async function isAppleSignInAvailable() {
  try {
    return await AppleAuthentication.isAvailableAsync();
  } catch (error) {
    console.warn('isAppleSignInAvailable failed:', error);
    return false;
  }
}
