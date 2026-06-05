import ExpoWalkTracking from './ExpoWalkTrackingModule';
import type {
  WalkCoordinate,
  WalkCustomMark,
  WalkSessionSnapshot,
  WalkTrackingStartOptions,
} from './ExpoWalkTracking.types';

export {
  ExpoWalkTracking,
  WalkCoordinate,
  WalkCustomMark,
  WalkSessionSnapshot,
  WalkTrackingStartOptions,
};

export function startWalkTracking(options: WalkTrackingStartOptions) {
  return ExpoWalkTracking.startWalkTracking(options);
}

export function stopWalkTracking() {
  return ExpoWalkTracking.stopWalkTracking();
}

export function getWalkSessionSnapshot() {
  return ExpoWalkTracking.getWalkSessionSnapshot();
}

export function appendPoopMark() {
  return ExpoWalkTracking.appendPoopMark();
}

export function appendCustomMark() {
  return ExpoWalkTracking.appendCustomMark();
}

export function isWalkTrackingActive() {
  return ExpoWalkTracking.isWalkTrackingActive();
}
