import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import {
  addRevenueCatCustomerInfoListener,
  isRevenueCatEntitlementActive,
  isRevenueCatPremiumActive,
} from '../services/revenueCat';

function isFirestorePremiumActive(familyData) {
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
 * 家族単位のプレミアム状態。
 * - Firestore: families.premiumExpiresAt（手動テスト / Webhook 連携後）
 * - RevenueCat: エンタイトルメント（アプリ内課金の即時反映）
 * 手順: docs/PREMIUM_FIRESTORE.md, docs/REVENUECAT.md
 */
export function usePremium() {
  const { familyId } = useAuth();
  const [firestorePremium, setFirestorePremium] = useState(false);
  const [revenueCatPremium, setRevenueCatPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshRevenueCatPremium = useCallback(async () => {
    const active = await isRevenueCatPremiumActive();
    setRevenueCatPremium(active);
  }, []);

  useEffect(() => {
    if (!familyId) {
      setFirestorePremium(false);
      setRevenueCatPremium(false);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const familyRef = doc(db, 'families', familyId);
    const unsubscribe = onSnapshot(
      familyRef,
      (snap) => {
        setFirestorePremium(snap.exists() && isFirestorePremiumActive(snap.data()));
        setLoading(false);
      },
      () => {
        setFirestorePremium(false);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [familyId]);

  useEffect(() => {
    if (!familyId) {
      setRevenueCatPremium(false);
      return undefined;
    }

    refreshRevenueCatPremium().catch((error) => {
      console.warn('usePremium: RevenueCat refresh failed:', error);
    });

    const removeListener = addRevenueCatCustomerInfoListener((customerInfo) => {
      setRevenueCatPremium(isRevenueCatEntitlementActive(customerInfo));
    });

    return removeListener;
  }, [familyId, refreshRevenueCatPremium]);

  const isPremium = firestorePremium || revenueCatPremium;

  return { isPremium, firestorePremium, revenueCatPremium, loading };
}
