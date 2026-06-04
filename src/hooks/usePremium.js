/**
 * プレミアム加入状態（課金連携前は常に false）。
 * ストア / RevenueCat 等と接続したらここで isPremium を返す。
 */
export function usePremium() {
  return {
    isPremium: false,
    loading: false,
  };
}
