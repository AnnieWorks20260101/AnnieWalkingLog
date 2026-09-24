import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

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
 * @param {{ latitude?: unknown, longitude?: unknown, friendPetId?: unknown, name?: unknown, photoUrl?: unknown }} mark
 * @returns {{ latitude: number, longitude: number, friendPetId: string, name: string, photoUrl: string }}
 */
export function sanitizeFriendMark(mark) {
  return {
    latitude: Number(mark.latitude),
    longitude: Number(mark.longitude),
    friendPetId: typeof mark.friendPetId === 'string' ? mark.friendPetId : '',
    name: typeof mark.name === 'string' ? mark.name : '',
    photoUrl: typeof mark.photoUrl === 'string' ? mark.photoUrl : '',
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
 * @param {{ friendPetId?: string, name?: string, photoUrl?: string }} options
 */
export function createFriendMark(coordinate, options = {}) {
  return sanitizeFriendMark({
    ...coordinate,
    friendPetId: options.friendPetId,
    name: options.name,
    photoUrl: options.photoUrl,
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
  await updateDoc(doc(db, 'walks', walkId), {
    poops: Array.isArray(poops) ? poops.map(sanitizePoopMark) : [],
    customMarks: Array.isArray(customMarks) ? customMarks.map(sanitizeCustomMark) : [],
    friendMarks: Array.isArray(friendMarks) ? friendMarks.map(sanitizeFriendMark) : [],
  });
}
