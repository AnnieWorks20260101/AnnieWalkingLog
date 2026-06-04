import { PLAN_TIER } from './planEntitlements';

/** お散歩写真の枚数・画質（プラン別） */
export const WALK_PHOTO_LIMITS = {
  guest: { maxPerWalk: 0, quality: 0 },
  free: { maxPerWalk: 3, quality: 0.7 },
  premium: { maxPerWalk: 10, quality: 1 },
};

/**
 * @param {import('./planEntitlements').PlanTier} tier
 */
export function getWalkPhotoLimits(tier) {
  if (tier === PLAN_TIER.premium) {
    return WALK_PHOTO_LIMITS.premium;
  }
  if (tier === PLAN_TIER.guest) {
    return WALK_PHOTO_LIMITS.guest;
  }
  return WALK_PHOTO_LIMITS.free;
}
