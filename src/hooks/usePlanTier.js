import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePremium } from './usePremium';
import {
  getPlanEntitlements,
  getFamilyWalkQueryOptions,
  resolvePlanTier,
} from '../constants/planEntitlements';

/**
 * ゲスト / 無料登録 / 家族プレミアム のティアとエンタイトルメント
 */
export function usePlanTier() {
  const { isGuest } = useAuth();
  const { isPremium, loading: premiumLoading } = usePremium();

  const tier = resolvePlanTier(isGuest, isPremium);
  const entitlements = useMemo(() => getPlanEntitlements(tier), [tier]);
  const walkQueryOptions = useMemo(
    () => getFamilyWalkQueryOptions(entitlements),
    [entitlements]
  );

  return {
    tier,
    entitlements,
    walkQueryOptions,
    isGuest,
    isPremium,
    isRegistered: !isGuest && !isPremium,
    loading: premiumLoading,
  };
}
