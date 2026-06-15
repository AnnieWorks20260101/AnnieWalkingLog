import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  configureRevenueCat,
  identifyRevenueCatFamily,
  resetRevenueCatUser,
} from '../services/revenueCat';

/**
 * 起動時の RevenueCat 初期化と、ログイン状態に応じた familyId 紐づけ。
 */
export default function RevenueCatSync() {
  const { loading, userId, familyId } = useAuth();

  useEffect(() => {
    configureRevenueCat();
  }, []);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!userId || !familyId) {
      resetRevenueCatUser().catch((error) => {
        console.warn('[RevenueCatSync] reset failed:', error);
      });
      return;
    }

    identifyRevenueCatFamily(familyId, { userId }).catch((error) => {
      console.warn('[RevenueCatSync] identify failed:', error);
    });
  }, [loading, userId, familyId]);

  return null;
}
