import { useCallback, useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Constants from 'expo-constants';
import { db } from '../services/firebase';
import { needsV10501Intro } from '../utils/v10501Intro';

function readAppVersion() {
  return Constants.expoConfig?.version ?? '0.0.0';
}

/**
 * @param {string | null | undefined} userId
 * @param {{ isGuest?: boolean, enabled?: boolean }} [options]
 */
export function useV10501IntroStatus(userId, options = {}) {
  const { isGuest = false, enabled = true } = options;
  const [needsIntro, setNeedsIntro] = useState(null);
  const appVersion = readAppVersion();

  const refresh = useCallback(async () => {
    if (!userId || !enabled || isGuest) {
      setNeedsIntro(false);
      return;
    }

    try {
      const snap = await getDoc(doc(db, 'users', userId));
      const data = snap.exists() ? snap.data() : {};
      setNeedsIntro(needsV10501Intro(data, { isGuest, appVersion }));
    } catch (error) {
      console.warn('useV10501IntroStatus failed:', error);
      setNeedsIntro(false);
    }
  }, [userId, enabled, isGuest, appVersion]);

  const markV10501IntroSeen = useCallback(async () => {
    if (!userId) {
      return;
    }
    await setDoc(
      doc(db, 'users', userId),
      {
        hasSeenV10501Intro: true,
        v10501IntroSeenAt: new Date().toISOString(),
      },
      { merge: true }
    );
    setNeedsIntro(false);
  }, [userId]);

  useEffect(() => {
    if (!userId || !enabled || isGuest) {
      setNeedsIntro(false);
      return undefined;
    }

    let cancelled = false;
    setNeedsIntro(null);

    getDoc(doc(db, 'users', userId))
      .then((snap) => {
        if (cancelled) {
          return;
        }
        const data = snap.exists() ? snap.data() : {};
        setNeedsIntro(needsV10501Intro(data, { isGuest, appVersion }));
      })
      .catch((error) => {
        console.warn('useV10501IntroStatus failed:', error);
        if (!cancelled) {
          setNeedsIntro(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [userId, enabled, isGuest, appVersion]);

  return {
    needsV10501Intro: needsIntro,
    v10501IntroLoading: enabled && !isGuest && userId != null && needsIntro === null,
    refreshV10501Intro: refresh,
    markV10501IntroSeen,
  };
}
