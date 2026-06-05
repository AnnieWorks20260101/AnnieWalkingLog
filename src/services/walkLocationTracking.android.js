import {
  appendCustomMark,
  appendPoopMark,
  getWalkSessionSnapshot,
  isWalkTrackingActive,
  startWalkTracking,
  stopWalkTracking,
} from 'expo-walk-tracking';

export const usesNativeWalkTracking = true;

export async function startWalkLocationTracking(options) {
  await startWalkTracking({
    title: options.title,
    body: options.body,
    poopLabel: options.poopLabel,
    customLabel: options.customLabel,
    customButtonId: options.customButtonId,
    customIcon: options.customIcon,
    distanceIntervalMeters: options.distanceIntervalMeters ?? 5,
  });
}

export async function stopWalkLocationTracking() {
  return stopWalkTracking();
}

export async function fetchWalkSessionSnapshot() {
  return getWalkSessionSnapshot();
}

export async function recordPoopMarkNative() {
  return appendPoopMark();
}

export async function recordCustomMarkNative() {
  return appendCustomMark();
}

export function isNativeWalkTrackingActive() {
  try {
    return isWalkTrackingActive();
  } catch {
    return false;
  }
}
