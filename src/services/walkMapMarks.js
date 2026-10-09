import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { collectFriendPetIds } from './friendEncounters';

function sanitizePetId(value) {
  return typeof value === 'string' ? value : '';
}

/**
 * @param {{ latitude?: unknown, longitude?: unknown, petId?: unknown }} mark
 * @returns {{ latitude: number, longitude: number, petId: string }}
 */
export function sanitizePoopMark(mark) {
  return {
    latitude: Number(mark.latitude),
    longitude: Number(mark.longitude),
    petId: sanitizePetId(mark.petId),
  };
}

/**
 * @param {{ latitude?: unknown, longitude?: unknown, icon?: unknown, buttonId?: unknown, petId?: unknown }} mark
 * @returns {{ latitude: number, longitude: number, icon: string, buttonId: string, petId: string }}
 */
export function sanitizeCustomMark(mark) {
  return {
    latitude: Number(mark.latitude),
    longitude: Number(mark.longitude),
    icon: typeof mark.icon === 'string' && mark.icon ? mark.icon : '💦',
    buttonId: typeof mark.buttonId === 'string' && mark.buttonId ? mark.buttonId : 'pee',
    petId: sanitizePetId(mark.petId),
  };
}

/**
 * @param {{ latitude?: unknown, longitude?: unknown, friendPetId?: unknown, name?: unknown, photoUrl?: unknown, memo?: unknown }} mark
 * @returns {{ latitude: number, longitude: number, friendPetId: string, name: string, photoUrl: string, memo: string }}
 */
export function sanitizeFriendMark(mark) {
  const rawMemo = typeof mark.memo === 'string' ? mark.memo.trim() : '';
  return {
    latitude: Number(mark.latitude),
    longitude: Number(mark.longitude),
    friendPetId: typeof mark.friendPetId === 'string' ? mark.friendPetId : '',
    name: typeof mark.name === 'string' ? mark.name : '',
    photoUrl: typeof mark.photoUrl === 'string' ? mark.photoUrl : '',
    memo: rawMemo.slice(0, 80),
  };
}

function markComparableFields(mark) {
  return [mark?.latitude, mark?.longitude, mark?.icon, mark?.buttonId, mark?.petId];
}

/**
 * ネイティブ同期で同じ内容が返ってきたときに state を差し替えないための比較。
 * 差し替えると地図マーカーが再描画され、Android でちらつく。
 *
 * @param {unknown} a
 * @param {unknown} b
 */
export function areWalkMarkListsEqual(a, b) {
  if (a === b) {
    return true;
  }
  const left = Array.isArray(a) ? a : [];
  const right = Array.isArray(b) ? b : [];
  if (left.length !== right.length) {
    return false;
  }
  for (let i = 0; i < left.length; i += 1) {
    const leftFields = markComparableFields(left[i]);
    const rightFields = markComparableFields(right[i]);
    for (let field = 0; field < leftFields.length; field += 1) {
      if (leftFields[field] !== rightFields[field]) {
        return false;
      }
    }
  }
  return true;
}

/**
 * 複数ピンが完全に重ならないよう、基準座標の周囲に少しずらす（およそ radiusMeters）。
 * @param {{ latitude: number, longitude: number }} coordinate
 * @param {number} index
 * @param {number} total
 * @param {number} [radiusMeters]
 * @returns {{ latitude: number, longitude: number }}
 */
export function offsetCoordinateForCluster(coordinate, index, total, radiusMeters = 5) {
  const latitude = Number(coordinate?.latitude);
  const longitude = Number(coordinate?.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return { latitude: 0, longitude: 0 };
  }
  if (!Number.isFinite(total) || total <= 1) {
    return { latitude, longitude };
  }
  const angle = (2 * Math.PI * index) / total - Math.PI / 2;
  const latRad = (latitude * Math.PI) / 180;
  const metersPerDegLat = 111320;
  const metersPerDegLng = Math.max(111320 * Math.cos(latRad), 1e-6);
  return {
    latitude: latitude + (Math.cos(angle) * radiusMeters) / metersPerDegLat,
    longitude: longitude + (Math.sin(angle) * radiusMeters) / metersPerDegLng,
  };
}

/**
 * @param {Array<Record<string, unknown>>} marks
 * @param {number} index
 * @param {{ latitude: number, longitude: number }} coordinate
 */
export function moveWalkMark(marks, index, coordinate) {
  if (!Array.isArray(marks) || index < 0 || index >= marks.length) {
    return marks;
  }
  return marks.map((mark, i) =>
    i === index
      ? {
          ...mark,
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
        }
      : mark
  );
}

/**
 * @param {{ latitude: number, longitude: number }} coordinate
 * @param {{ petId?: string }} options
 */
export function createPoopMark(coordinate, options = {}) {
  return sanitizePoopMark({
    ...coordinate,
    petId: options.petId,
  });
}

/**
 * @param {{ latitude: number, longitude: number }} coordinate
 * @param {{ icon?: string, buttonId?: string, petId?: string }} options
 */
export function createCustomMark(coordinate, options = {}) {
  return sanitizeCustomMark({
    ...coordinate,
    icon: options.icon,
    buttonId: options.buttonId,
    petId: options.petId,
  });
}

/**
 * @param {{ latitude: number, longitude: number }} coordinate
 * @param {{ friendPetId?: string, name?: string, photoUrl?: string, memo?: string }} options
 */
export function createFriendMark(coordinate, options = {}) {
  return sanitizeFriendMark({
    ...coordinate,
    friendPetId: options.friendPetId,
    name: options.name,
    photoUrl: options.photoUrl,
    memo: options.memo,
  });
}

/**
 * @param {Array<Record<string, unknown>>} marks
 * @param {number} index
 */
export function removeWalkMark(marks, index) {
  if (!Array.isArray(marks) || index < 0 || index >= marks.length) {
    return marks;
  }
  return marks.filter((_, i) => i !== index);
}

/**
 * @param {string} walkId
 * @param {{ poops?: unknown[], customMarks?: unknown[], friendMarks?: unknown[] }} marks
 */
export async function persistWalkMapMarks(walkId, { poops, customMarks, friendMarks }) {
  const nextFriendMarks = Array.isArray(friendMarks) ? friendMarks.map(sanitizeFriendMark) : [];
  await updateDoc(doc(db, 'walks', walkId), {
    poops: Array.isArray(poops) ? poops.map(sanitizePoopMark) : [],
    customMarks: Array.isArray(customMarks) ? customMarks.map(sanitizeCustomMark) : [],
    friendMarks: nextFriendMarks,
    friendPetIds: collectFriendPetIds(nextFriendMarks),
  });
}
