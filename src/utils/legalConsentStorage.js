import {
  hasAcceptedPrivacyPolicy,
  setAcceptedPrivacyPolicy,
  clearAcceptedPrivacyPolicy,
} from './privacyConsentStorage';
import {
  hasAcceptedTermsOfService,
  setAcceptedTermsOfService,
  clearAcceptedTermsOfService,
} from './termsConsentStorage';

/**
 * @returns {Promise<boolean>}
 */
export async function hasAcceptedLegalDocuments() {
  const [privacy, terms] = await Promise.all([
    hasAcceptedPrivacyPolicy(),
    hasAcceptedTermsOfService(),
  ]);
  return privacy && terms;
}

/**
 * @param {string | null | undefined} userId
 */
export async function setAcceptedLegalDocuments(userId = null) {
  await Promise.all([setAcceptedPrivacyPolicy(userId), setAcceptedTermsOfService(userId)]);
}

export async function clearAcceptedLegalDocuments() {
  await Promise.all([clearAcceptedPrivacyPolicy(), clearAcceptedTermsOfService()]);
}
