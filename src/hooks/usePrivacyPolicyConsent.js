import { useState, useEffect, useCallback } from 'react';
import { hasAcceptedLegalDocuments } from '../utils/legalConsentStorage';

/**
 * ログイン済みユーザー向けの法的文書同意状態（プライバシーポリシー・利用規約の版と照合）
 * @param {string | null | undefined} userId
 */
export function usePrivacyPolicyConsent(userId) {
  const [accepted, setAccepted] = useState(null);

  const refreshPolicyConsent = useCallback(async () => {
    if (!userId) {
      setAccepted(true);
      return;
    }
    const ok = await hasAcceptedLegalDocuments();
    setAccepted(ok);
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setAccepted(true);
      return;
    }

    let cancelled = false;
    setAccepted(null);

    hasAcceptedLegalDocuments()
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
