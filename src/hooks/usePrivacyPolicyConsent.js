import { useState, useEffect, useCallback } from 'react';
import { hasAcceptedPrivacyPolicy } from '../utils/privacyConsentStorage';

/**
 * ログイン済みユーザー向けのポリシー同意状態（PRIVACY_POLICY_VERSION と照合）
 * @param {string | null | undefined} userId
 */
export function usePrivacyPolicyConsent(userId) {
  const [accepted, setAccepted] = useState(null);

  const refreshPolicyConsent = useCallback(async () => {
    if (!userId) {
      setAccepted(true);
      return;
    }
    const ok = await hasAcceptedPrivacyPolicy();
    setAccepted(ok);
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setAccepted(true);
      return;
    }

    let cancelled = false;
    setAccepted(null);

    hasAcceptedPrivacyPolicy()
      .then((ok) => {
        if (!cancelled) {
          setAccepted(ok);
        }
      })
      .catch((error) => {
        console.warn('usePrivacyPolicyConsent failed:', error);
        if (!cancelled) {
          setAccepted(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return {
    policyConsentAccepted: accepted,
    policyConsentLoading: userId != null && accepted === null,
    refreshPolicyConsent,
  };
}
