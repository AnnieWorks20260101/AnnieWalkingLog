/**
 * @param {string} localUri
 * @param {{ latitude: number, longitude: number }} coordinate
 */
export function createPendingWalkPhoto(localUri, coordinate) {
  return {
    id: `photo_${Date.now()}`,
    localUri,
    takenAt: new Date().toISOString(),
    latitude: coordinate.latitude,
    longitude: coordinate.longitude,
  };
}

/** @param {{ latitude?: number, longitude?: number }} | null | undefined} photo */
/** @param {{ photos?: Array<{ storageUrl?: string }> } | null | undefined} walk */
export function walkHasPhotos(walk) {
  return (
    Array.isArray(walk?.photos) &&
    walk.photos.some((p) => typeof p?.storageUrl === 'string' && p.storageUrl.trim().length > 0)
  );
}

/** @param {{ photos?: Array<{ storageUrl?: string }> } | null | undefined} walk */
export function getWalkPhotos(walk) {
  if (!Array.isArray(walk?.photos)) {
    return [];
  }
  return walk.photos.filter(
    (p) => typeof p?.storageUrl === 'string' && p.storageUrl.trim().length > 0
  );
}

export function getWalkPhotoCoordinate(photo) {
  if (
    photo &&
    typeof photo.latitude === 'number' &&
    typeof photo.longitude === 'number' &&
    !Number.isNaN(photo.latitude) &&
    !Number.isNaN(photo.longitude)
  ) {
    return { latitude: photo.latitude, longitude: photo.longitude };
  }
  return null;
}
