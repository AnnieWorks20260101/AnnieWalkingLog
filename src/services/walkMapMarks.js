import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

/**
 * @param {{ latitude?: unknown, longitude?: unknown }} mark
 * @returns {{ latitude: number, longitude: number }}
 */
export function sanitizePoopMark(mark) {
  return {
    latitude: Number(mark.latitude),
    longitude: Number(mark.longitude),
  };
}

/**
 * @param {{ latitude?: unknown, longitude?: unknown, icon?: unknown, buttonId?: unknown }} mark
 * @returns {{ latitude: number, longitude: number, icon: string, buttonId: string }}
 */
export function sanitizeCustomMark(mark) {
  return {
    latitude: Number(mark.latitude),
    longitude: Number(mark.longitude),
    icon: typeof mark.icon === 'string' && mark.icon ? mark.icon : '💦',
    buttonId: typeof mark.buttonId === 'string' && mark.buttonId ? mark.buttonId : 'pee',
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
 */
export function createPoopMark(coordinate) {
  return sanitizePoopMark(coordinate);
}

/**
 * @param {{ latitude: number, longitude: number }} coordinate
 * @param {{ icon?: string, buttonId?: string }} options
 */
export function createCustomMark(coordinate, options = {}) {
  return sanitizeCustomMark({
    ...coordinate,
    icon: options.icon,
    buttonId: options.buttonId,
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
 * @param {{ poops?: unknown[], customMarks?: unknown[] }} marks
 */
export async function persistWalkMapMarks(walkId, { poops, customMarks }) {
  await updateDoc(doc(db, 'walks', walkId), {
    poops: Array.isArray(poops) ? poops.map(sanitizePoopMark) : [],
    customMarks: Array.isArray(customMarks) ? customMarks.map(sanitizeCustomMark) : [],
  });
}
