import { doc, increment, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

/**
 * friendMarks から friendPetId ごとの加算回数を集計する。
 * @param {Array<{ friendPetId?: unknown }> | null | undefined} friendMarks
 * @returns {Map<string, number>}
 */
export function collectFriendEncounterIncrements(friendMarks) {
  const counts = new Map();
  if (!Array.isArray(friendMarks)) {
    return counts;
  }
  for (const mark of friendMarks) {
    const id = typeof mark?.friendPetId === 'string' ? mark.friendPetId.trim() : '';
    if (!id) {
      continue;
    }
    counts.set(id, (counts.get(id) || 0) + 1);
  }
  return counts;
}

/**
 * walks.friendPetIds 用。重複なしの friendPetId 一覧。
 * @param {Array<{ friendPetId?: unknown }> | null | undefined} friendMarks
 * @returns {string[]}
 */
export function collectFriendPetIds(friendMarks) {
  return [...collectFriendEncounterIncrements(friendMarks).keys()];
}

/**
 * @param {unknown} value
 * @returns {Timestamp | null}
 */
function toEncounterTimestamp(value) {
  if (!value) {
    return Timestamp.now();
  }
  if (value instanceof Timestamp) {
    return value;
  }
  if (typeof value?.toDate === 'function') {
    try {
      return Timestamp.fromDate(value.toDate());
    } catch {
      return Timestamp.now();
    }
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return Timestamp.fromDate(value);
  }
  const asDate = new Date(value);
  if (!Number.isNaN(asDate.getTime())) {
    return Timestamp.fromDate(asDate);
  }
  return Timestamp.now();
}

/**
 * @param {Map<string, number> | Array<[string, number]> | Record<string, number>} deltas
 * @param {{ encounterAt?: unknown }} [options]
 *   encounterAt: 加算時に lastEncounterAt へ書く日時（ピン削除の減算時は更新しない）
 */
export async function applyFriendEncounterDeltas(deltas, options = {}) {
  let entries;
  if (deltas instanceof Map) {
    entries = [...deltas.entries()];
  } else if (Array.isArray(deltas)) {
    entries = deltas;
  } else if (deltas && typeof deltas === 'object') {
    entries = Object.entries(deltas);
  } else {
    return;
  }

  const encounterAt = toEncounterTimestamp(options.encounterAt);

  const tasks = entries
    .filter(([friendId, delta]) => typeof friendId === 'string' && friendId && Number(delta) !== 0)
    .map(async ([friendId, delta]) => {
      const n = Number(delta);
      try {
        const payload = {
          encounterCount: increment(n),
        };
        // 前進のみ。ピン削除などの減算では最終遭遇日を触らない
        if (n > 0) {
          payload.lastEncounterAt = encounterAt;
        }
        await updateDoc(doc(db, 'pet_friends', friendId), payload);
      } catch (error) {
        console.warn('applyFriendEncounterDeltas failed:', friendId, error);
      }
    });

  await Promise.all(tasks);
}

/**
 * @param {unknown} value
 * @returns {number}
 */
export function readFriendEncounterCount(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) {
    return 0;
  }
  return Math.floor(n);
}

/**
 * @param {unknown} value
 * @returns {Date | null}
 */
export function readFriendLastEncounterDate(value) {
  if (!value) {
    return null;
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }
  if (typeof value?.toDate === 'function') {
    try {
      const date = value.toDate();
      return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null;
    } catch {
      return null;
    }
  }
  const asDate = new Date(value);
  return Number.isNaN(asDate.getTime()) ? null : asDate;
}
