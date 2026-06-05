import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import {
  appendCustomMark,
  appendPoopMark,
  getWalkSessionSnapshot,
  isWalkTrackingActive,
  startWalkTracking,
  stopWalkTracking,
} from 'expo-walk-tracking';

export const usesNativeWalkTracking = true;

const LOCATION_TASK_NAME = 'background-location-task';
const TEMP_ROUTE_KEY = 'temp_route';

async function mergeRouteIntoSnapshot(snapshot) {
  const saved = await AsyncStorage.getItem(TEMP_ROUTE_KEY);
  const route = saved ? JSON.parse(saved) : [];
  return {
    ...(snapshot ?? {
      route: [],
      poops: [],
      customMarks: [],
      isTracking: false,
    }),
    route,
  };
}

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

  await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
    accuracy: Location.Accuracy.High,
    distanceInterval: 5,
    showsBackgroundLocationIndicator: true,
  });
}

export async function stopWalkLocationTracking() {
  try {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
  } catch (_error) {
    // already stopped
  }

  const snapshot = await stopWalkTracking();
  return mergeRouteIntoSnapshot(snapshot);
}

export async function fetchWalkSessionSnapshot() {
  const snapshot = await getWalkSessionSnapshot();
  return mergeRouteIntoSnapshot(snapshot);
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
