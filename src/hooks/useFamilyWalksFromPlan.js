import { usePlanTier } from './usePlanTier';
import { useFamilyWalks } from './useFamilyWalks';

/** プランに応じた件数・期間で家族のお散歩を購読 */
export function useFamilyWalksFromPlan(familyId) {
  const { walkQueryOptions, loading: planLoading } = usePlanTier();
  const { walks, loading: walksLoading } = useFamilyWalks(familyId, walkQueryOptions);

  return {
    walks,
    loading: planLoading || walksLoading,
  };
}
