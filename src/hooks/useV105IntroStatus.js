import { useCallback, useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Constants from 'expo-constants';
import { db } from '../services/firebase';
import { needsV105Intro } from '../utils/v105Intro';

function readAppVersion() {
  return Constants.expoConfig?.version ?? '0.0.0';
}

/**
 * @param {string | null | undefined} userId
 * @param {{ isGuest?: boolean, enabled?: boolean }} [options]
 *   enabled: オンボーディング完了後など、表示判定を有効にするとき true
 */
export function useV105IntroStatus(userId, options = {}) {
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
      setNeedsIntro(needsV105Intro(data, { isGuest, appVersion }));
    } catch (error) {
      console.warn('useV105IntroStatus failed:', error);
      // 失敗時はメイン画面を優先（お知らせでアプリを塞がない）
      setNeedsIntro(false);
    }
  }, [userId, enabled, isGuest, appVersion]);

  const markV105IntroSeen = useCallback(async () => {
    if (!userId) {
      return;
    }
    await setDoc(
      doc(db, 'users', userId),
      {
        hasSeenV105Intro: true,
        v105IntroSeenAt: new Date().toISOString(),
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
        setNeedsIntro(needsV105Intro(data, { isGuest, appVersion }));
      })
      .catch((error) => {
        console.warn('useV105IntroStatus failed:', error);
        if (!cancelled) {
          setNeedsIntro(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [userId, enabled, isGuest, appVersion]);

  return {
    needsV105Intro: needsIntro,
    v105IntroLoading: enabled && !isGuest && userId != null && needsIntro === null,
    refreshV105Intro: refresh,
    markV105IntroSeen,
  };
}
