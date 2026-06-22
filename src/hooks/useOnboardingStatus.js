import { useState, useEffect, useCallback } from 'react';
import { hasCompletedOnboarding, setOnboardingCompleted } from '../utils/onboardingStorage';

/**
 * @param {string | null | undefined} userId
 */
export function useOnboardingStatus(userId) {
  const [completed, setCompleted] = useState(null);

  const refreshOnboarding = useCallback(async () => {
    if (!userId) {
      setCompleted(true);
      return;
    }
    const ok = await hasCompletedOnboarding(userId);
    setCompleted(ok);
  }, [userId]);

  const markOnboardingCompleted = useCallback(async () => {
    if (!userId) {
      return;
    }
    await setOnboardingCompleted(userId);
    setCompleted(true);
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setCompleted(true);
      return undefined;
    }

    let cancelled = false;
    setCompleted(null);

    hasCompletedOnboarding(userId)
      .then((ok) => {
        if (!cancelled) {
          setCompleted(ok);
        }
      })
      .catch((error) => {
        console.warn('useOnboardingStatus failed:', error);
        if (!cancelled) {
          setCompleted(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return {
    onboardingCompleted: completed,
    onboardingLoading: userId != null && completed === null,
    refreshOnboarding,
    markOnboardingCompleted,
  };
}
