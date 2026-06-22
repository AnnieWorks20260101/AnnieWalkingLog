import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY_PREFIX = '@onboarding/completed_v1_';

function storageKey(userId) {
  return `${ONBOARDING_KEY_PREFIX}${userId}`;
}

/**
 * @param {string} userId
 * @returns {Promise<boolean>}
 */
export async function hasCompletedOnboarding(userId) {
  if (!userId) {
    return true;
  }
  try {
    const value = await AsyncStorage.getItem(storageKey(userId));
    return value === 'true';
  } catch (error) {
    console.warn('hasCompletedOnboarding failed:', error);
    return false;
  }
}

/**
 * @param {string} userId
 */
export async function setOnboardingCompleted(userId) {
  if (!userId) {
    return;
  }
  await AsyncStorage.setItem(storageKey(userId), 'true');
}
