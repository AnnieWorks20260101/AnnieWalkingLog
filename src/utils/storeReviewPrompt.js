import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';

const COMPLETED_WALK_COUNT_KEY = '@app_review/completed_walk_count_v1';
const LAST_PROMPTED_AT_KEY = '@app_review/last_prompted_at_v1';
const LAST_PROMPTED_MILESTONE_KEY = '@app_review/last_prompted_milestone_v1';

const REVIEW_COOLDOWN_MS = 90 * 24 * 60 * 60 * 1000;
const REVIEW_PROMPT_DELAY_MS = 1500;

/**
 * @param {number} count
 * @returns {number | null} milestone count if eligible, else null
 */
export function shouldRequestReviewAtCount(count) {
  if (count === 5 || count === 10) {
    return count;
  }
  if (count > 10 && count % 10 === 0) {
    return count;
  }
  return null;
}

async function readCompletedWalkCount() {
  try {
    const raw = await AsyncStorage.getItem(COMPLETED_WALK_COUNT_KEY);
    const parsed = Number.parseInt(raw ?? '0', 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  } catch (error) {
    console.warn('readCompletedWalkCount failed:', error);
    return 0;
  }
}

/**
 * @returns {Promise<number>} updated completed walk count
 */
export async function incrementCompletedWalkCount() {
  const current = await readCompletedWalkCount();
  const next = current + 1;
  await AsyncStorage.setItem(COMPLETED_WALK_COUNT_KEY, String(next));
  return next;
}

async function getLastPromptedAt() {
  try {
    const raw = await AsyncStorage.getItem(LAST_PROMPTED_AT_KEY);
    if (!raw) {
      return null;
    }
    const parsed = Date.parse(raw);
    return Number.isFinite(parsed) ? parsed : null;
  } catch (error) {
    console.warn('getLastPromptedAt failed:', error);
    return null;
  }
}

async function getLastPromptedMilestone() {
  try {
    const raw = await AsyncStorage.getItem(LAST_PROMPTED_MILESTONE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) ? parsed : null;
  } catch (error) {
    console.warn('getLastPromptedMilestone failed:', error);
    return null;
  }
}

/**
 * @param {number} milestone
 */
export async function markReviewPrompted(milestone) {
  await AsyncStorage.multiSet([
    [LAST_PROMPTED_AT_KEY, new Date().toISOString()],
    [LAST_PROMPTED_MILESTONE_KEY, String(milestone)],
  ]);
}

/**
 * @param {{ milestone: number }} options
 * @returns {Promise<boolean>} true if requestReview was invoked
 */
export async function maybeRequestStoreReview({ milestone }) {
  if (__DEV__) {
    return false;
  }
  if (!milestone || !shouldRequestReviewAtCount(milestone)) {
    return false;
  }

  const lastMilestone = await getLastPromptedMilestone();
  if (lastMilestone === milestone) {
    return false;
  }

  const lastPromptedAt = await getLastPromptedAt();
  if (lastPromptedAt != null && Date.now() - lastPromptedAt < REVIEW_COOLDOWN_MS) {
    return false;
  }

  const available = await StoreReview.isAvailableAsync();
  if (!available) {
    return false;
  }

  await StoreReview.requestReview();
  await markReviewPrompted(milestone);
  return true;
}

export const STORE_REVIEW_PROMPT_DELAY_MS = REVIEW_PROMPT_DELAY_MS;
