import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';

function isPremiumActive(familyData) {
  if (!familyData) {
    return false;
  }
  const expiresAt = familyData.premiumExpiresAt;
  if (!expiresAt) {
    return false;
  }
  const date = typeof expiresAt.toDate === 'function' ? expiresAt.toDate() : new Date(expiresAt);
  return date.getTime() > Date.now();
}

/**
 * 家族単位のプレミアム状態（families.premiumExpiresAt）。
 * 課金連携後: RevenueCat 等 → Cloud Function で premiumExpiresAt を更新。
 * 手順: docs/PREMIUM_FIRESTORE.md
 */
export function usePremium() {
  const { familyId } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!familyId) {
      setIsPremium(false);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const familyRef = doc(db, 'families', familyId);
    const unsubscribe = onSnapshot(
      familyRef,
      (snap) => {
        setIsPremium(snap.exists() && isPremiumActive(snap.data()));
        setLoading(false);
      },
      () => {
        setIsPremium(false);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [familyId]);

  return { isPremium, loading };
}
