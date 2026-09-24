import {
  appendCustomMark,
  appendPoopMark,
  getActiveMarkPetId,
  getWalkSessionSnapshot,
  isWalkTrackingActive,
  setActiveMarkPetId,
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
    textColorHex: options.textColorHex,
    activePetId: options.activePetId ?? '',
    walkPetsJson: JSON.stringify(options.walkPets ?? []),
    activePetLabelPrefix: options.activePetLabelPrefix ?? '',
    distanceIntervalMeters: options.distanceIntervalMeters ?? 5,
  });
}

export async function stopWalkLocationTracking() {
  return stopWalkTracking();
}

export async function fetchWalkSessionSnapshot() {
  const snapshot = await getWalkSessionSnapshot();
  return snapshot ?? {
    route: [],
    poops: [],
    customMarks: [],
    isTracking: false,
  };
}

export async function recordPoopMarkNative() {
  return appendPoopMark();
}

export async function recordCustomMarkNative() {
  return appendCustomMark();
}

export function syncActiveMarkPetId(petId) {
  try {
    setActiveMarkPetId(petId ?? '');
  } catch (error) {
    console.warn('syncActiveMarkPetId failed:', error);
  }
}

export function readActiveMarkPetId() {
  try {
    return getActiveMarkPetId() ?? '';
  } catch (error) {
    console.warn('readActiveMarkPetId failed:', error);
    return '';
  }
}

export function syncLastKnownCoordinate(_latitude, _longitude) {
  // Android route updates are handled by the foreground service.
}

export function isNativeWalkTrackingActive() {
  try {
    return isWalkTrackingActive();
  } catch {
    return false;
  }
}
