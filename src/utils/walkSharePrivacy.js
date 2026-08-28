import { getDistanceBetween } from './locationUtils';
import { filterValidCoordinates } from './mapRegion';
import { getWalkPhotoCoordinate } from './walkPhotos';

function distanceMeters(a, b) {
  return getDistanceBetween(a, b) * 1000;
}

function isNearEndpoints(coordinate, start, end, radiusMeters) {
  if (!coordinate || !radiusMeters) {
    return false;
  }
  if (start && distanceMeters(coordinate, start) < radiusMeters) {
    return true;
  }
  if (end && distanceMeters(coordinate, end) < radiusMeters) {
    return true;
  }
  return false;
}

/**
 * 開始・終了地点から radiusMeters 以内の座標を除いたルートを返す
 * @param {Array<{ latitude: number, longitude: number }>} route
 * @param {number} radiusMeters
 */
export function trimRouteForShare(route, radiusMeters) {
  const validRoute = filterValidCoordinates(route);
  if (!radiusMeters || validRoute.length < 2) {
    return validRoute;
  }

  let startIndex = 0;
  let traveledMeters = 0;
  for (let i = 1; i < validRoute.length; i += 1) {
    traveledMeters += distanceMeters(validRoute[i - 1], validRoute[i]);
    if (traveledMeters >= radiusMeters) {
      startIndex = i;
      break;
    }
  }

  let endIndex = validRoute.length - 1;
  traveledMeters = 0;
  for (let i = validRoute.length - 2; i >= 0; i -= 1) {
    traveledMeters += distanceMeters(validRoute[i], validRoute[i + 1]);
    if (traveledMeters >= radiusMeters) {
      endIndex = i;
      break;
    }
  }

  if (startIndex >= endIndex) {
    return [];
  }
  return validRoute.slice(startIndex, endIndex + 1);
}

/**
 * @param {Array<{ latitude: number, longitude: number }>} marks
 * @param {{ latitude: number, longitude: number } | undefined} start
 * @param {{ latitude: number, longitude: number } | undefined} end
 * @param {number} radiusMeters
 */
export function filterMarksForShare(marks, start, end, radiusMeters) {
  if (!radiusMeters || !Array.isArray(marks)) {
    return marks ?? [];
  }
  return marks.filter((mark) => !isNearEndpoints(mark, start, end, radiusMeters));
}

/**
 * @param {Array<Record<string, unknown>>} photos
 */
export function filterPhotosForShare(photos, start, end, radiusMeters) {
  if (!radiusMeters || !Array.isArray(photos)) {
    return photos ?? [];
  }
  return photos.filter((photo) => {
    const coordinate = getWalkPhotoCoordinate(photo);
    if (!coordinate) {
      return true;
    }
    return !isNearEndpoints(coordinate, start, end, radiusMeters);
  });
}

/**
 * @param {Record<string, unknown>} walk
 * @param {number} radiusMeters
 */
export function applyWalkSharePrivacy(walk, radiusMeters) {
  const fullRoute = filterValidCoordinates(walk?.route ?? []);
  const start = fullRoute[0];
  const end = fullRoute[fullRoute.length - 1];
  const route = trimRouteForShare(fullRoute, radiusMeters);

  return {
    route,
    poops: filterMarksForShare(walk?.poops ?? [], start, end, radiusMeters),
    customMarks: filterMarksForShare(walk?.customMarks ?? [], start, end, radiusMeters),
    photos: filterPhotosForShare(walk?.photos ?? [], start, end, radiusMeters),
    routeFullyHidden: radiusMeters > 0 && fullRoute.length >= 2 && route.length < 2,
    privacyApplied: radiusMeters > 0,
  };
}
