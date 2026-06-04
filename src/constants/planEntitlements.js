import { Timestamp } from 'firebase/firestore';

/** @typedef {'guest' | 'registered' | 'premium'} PlanTier */

export const PLAN_TIER = {
  guest: 'guest',
  registered: 'registered',
  premium: 'premium',
};

export const PLAN_ENTITLEMENTS = {
  guest: {
    maxWalks: 10,
    historyDays: null,
    maxPets: 1,
    photos: null,
  },
  registered: {
    maxWalks: null,
    historyDays: 365,
    maxPets: 2,
    photos: 'free',
  },
  premium: {
    maxWalks: null,
    historyDays: null,
    maxPets: null,
    photos: 'premium',
  },
};

/**
 * @param {boolean} isGuest
 * @param {boolean} isPremium
 * @returns {PlanTier}
 */
export function resolvePlanTier(isGuest, isPremium) {
  if (isGuest) {
    return PLAN_TIER.guest;
  }
  if (isPremium) {
    return PLAN_TIER.premium;
  }
  return PLAN_TIER.registered;
}

/**
 * @param {PlanTier} tier
 */
export function getPlanEntitlements(tier) {
  return PLAN_ENTITLEMENTS[tier] ?? PLAN_ENTITLEMENTS.registered;
}

/**
 * Firestore walks クエリ用オプション
 * @param {ReturnType<typeof getPlanEntitlements>} entitlements
 */
export function getFamilyWalkQueryOptions(entitlements) {
  const options = {};
  if (entitlements.maxWalks) {
    options.maxCount = entitlements.maxWalks;
  }
  if (entitlements.historyDays) {
    const since = new Date();
    since.setDate(since.getDate() - entitlements.historyDays);
    options.sinceTimestamp = Timestamp.fromDate(since);
  }
  return options;
}

/**
 * @param {number} currentPetCount
 * @param {ReturnType<typeof getPlanEntitlements>} entitlements
 */
export function canAddPet(currentPetCount, entitlements) {
  if (entitlements.maxPets == null) {
    return true;
  }
  return currentPetCount < entitlements.maxPets;
}

/**
 * @param {ReturnType<typeof getPlanEntitlements>} entitlements
 */
export function canUseWalkPhotos(entitlements) {
  return entitlements.photos != null;
}
