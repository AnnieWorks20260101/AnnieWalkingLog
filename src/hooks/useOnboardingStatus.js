import { useState, useEffect, useCallback } from 'react';
import { hasCompletedOnboarding, setOnboardingCompleted } from '../utils/onboardingStorage';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

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
    // 新規ユーザーはオンボーディング直後に v1.05 お知らせを出さない
    try {
      await setDoc(
        doc(db, 'users', userId),
        {
          hasSeenV105Intro: true,
          v105IntroSeenAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      console.warn('markOnboardingCompleted: skip v105 intro flag failed:', error);
    }
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
