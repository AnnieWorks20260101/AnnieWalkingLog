import i18n from '../i18n';

/**
 * @param {{ success: false, reason: string }} result
 * @param {'google' | 'apple'} provider
 * @returns {string | null}
 */
export function getOAuthAuthErrorMessage(result, provider) {
  if (result.success) {
    return null;
  }

  const loginErrorKey = provider === 'apple' ? 'auth.appleLoginError' : 'auth.googleLoginError';
  const notConfiguredKey = provider === 'apple' ? 'auth.appleNotAvailable' : 'auth.googleNotConfigured';
  const unsupportedKey =
    provider === 'apple' ? 'auth.appleUnsupportedProvider' : 'auth.googleUnsupportedProvider';
  const existingAccountKey =
    provider === 'apple' ? 'auth.appleExistingAccount' : 'auth.googleExistingAccount';

  switch (result.reason) {
    case 'cancelled':
      return null;
    case 'notConfigured':
    case 'notAvailable':
      return i18n.t(notConfiguredKey);
    case 'linkPasswordRequired':
      return null;
    case 'unsupportedExistingProvider':
      return i18n.t(unsupportedKey);
    case 'existingAccount':
      return i18n.t(existingAccountKey);
    case 'notGuest':
      return i18n.t('auth.upgradeError');
    default:
      return i18n.t(loginErrorKey);
  }
}
