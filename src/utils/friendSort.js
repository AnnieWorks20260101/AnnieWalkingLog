import { readFriendEncounterCount, readFriendLastEncounterDate } from '../services/friendEncounters';

export const FRIEND_SORT_REGISTERED = 'registered';
export const FRIEND_SORT_ENCOUNTER_COUNT = 'encounterCount';
export const FRIEND_SORT_LAST_ENCOUNTER = 'lastEncounterAt';

/**
 * @param {unknown} value
 * @returns {number}
 */
function createdAtMs(value) {
  if (value?.toMillis) {
    return value.toMillis();
  }
  if (value instanceof Date) {
    return value.getTime();
  }
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.getTime() : 0;
}

/**
 * @param {{ id?: string, createdAt?: unknown, encounterCount?: unknown, lastEncounterAt?: unknown }[]} friends
 * @param {string} sortKey
 */
export function sortFriends(friends, sortKey) {
  const list = Array.isArray(friends) ? [...friends] : [];

  if (sortKey === FRIEND_SORT_ENCOUNTER_COUNT) {
    return list.sort((a, b) => {
      const countDiff =
        readFriendEncounterCount(b.encounterCount) - readFriendEncounterCount(a.encounterCount);
      if (countDiff !== 0) {
        return countDiff;
      }
      return createdAtMs(a.createdAt) - createdAtMs(b.createdAt);
    });
  }

  if (sortKey === FRIEND_SORT_LAST_ENCOUNTER) {
    return list.sort((a, b) => {
      const aDate = readFriendLastEncounterDate(a.lastEncounterAt);
      const bDate = readFriendLastEncounterDate(b.lastEncounterAt);
      const aMs = aDate ? aDate.getTime() : 0;
      const bMs = bDate ? bDate.getTime() : 0;
      // 未遭遇は後ろ
      if (aMs === 0 && bMs === 0) {
        return createdAtMs(a.createdAt) - createdAtMs(b.createdAt);
      }
      if (aMs === 0) {
        return 1;
      }
      if (bMs === 0) {
        return -1;
      }
      if (bMs !== aMs) {
        return bMs - aMs;
      }
      return createdAtMs(a.createdAt) - createdAtMs(b.createdAt);
    });
  }

  // 登録順（古い順）
  return list.sort((a, b) => {
    const diff = createdAtMs(a.createdAt) - createdAtMs(b.createdAt);
    if (diff !== 0) {
      return diff;
    }
    return String(a.id || '').localeCompare(String(b.id || ''));
  });
}
