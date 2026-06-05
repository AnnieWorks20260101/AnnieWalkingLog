import * as FileSystem from 'expo-file-system/legacy';

/**
 * 撮影直後にキャッシュへコピー（iOS の一時 URI が保存前に無効になるのを防ぐ）
 * @param {string} localUri
 * @returns {Promise<string>}
 */
export async function persistWalkPhotoUri(localUri) {
  if (!localUri) {
    throw new Error('persistWalkPhotoUri: missing uri');
  }

  const cachePrefix = `${FileSystem.cacheDirectory}walk-photo-`;
  if (localUri.startsWith(cachePrefix)) {
    return localUri;
  }

  const dest = `${cachePrefix}${Date.now()}.jpg`;
  await FileSystem.copyAsync({ from: localUri, to: dest });
  return dest;
}

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
