/**
 * React Navigation の params は JSON 化されるため、
 * Firestore Timestamp / Date は ISO 文字列に変換して渡す。
 */

/**
 * @param {unknown} value
 * @returns {string | undefined}
 */
function toISOStringValue(value) {
  if (value == null) {
    return undefined;
  }
  if (typeof value.toDate === 'function') {
    return value.toDate().toISOString();
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return new Date(value).toISOString();
  }
  return undefined;
}

/**
 * @param {unknown} value
 * @returns {Date | undefined}
 */
function parseNavigationDate(value) {
  if (value == null) {
    return undefined;
  }
  if (typeof value === 'string') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }
  if (typeof value.toDate === 'function') {
    return value.toDate();
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }
  return undefined;
}

/**
 * @param {Record<string, unknown> | null | undefined} walk
 */
export function serializeWalkForNavigation(walk) {
  if (!walk) {
    return walk;
  }

  const serialized = { ...walk };

  const startIso = toISOStringValue(walk.startTime);
  const endIso = toISOStringValue(walk.endTime);
  if (startIso !== undefined) {
    serialized.startTime = startIso;
  }
  if (endIso !== undefined) {
    serialized.endTime = endIso;
  }

  const createdIso = toISOStringValue(walk.createdAt);
  if (createdIso !== undefined) {
    serialized.createdAt = createdIso;
  } else {
    delete serialized.createdAt;
  }

  if (Array.isArray(walk.photos)) {
    serialized.photos = walk.photos.map((photo) => {
      if (!photo || typeof photo !== 'object') {
        return photo;
      }
      const takenIso = toISOStringValue(photo.takenAt);
      return takenIso !== undefined ? { ...photo, takenAt: takenIso } : { ...photo };
    });
  }

  return serialized;
}

/**
 * @param {Record<string, unknown> | null | undefined} walk
 */
export function parseWalkFromNavigationParams(walk) {
  if (!walk) {
    return walk;
  }

  const parsed = { ...walk };

  const startDate = parseNavigationDate(walk.startTime);
  const endDate = parseNavigationDate(walk.endTime);
  if (startDate !== undefined) {
    parsed.startTime = startDate;
  }
  if (endDate !== undefined) {
    parsed.endTime = endDate;
  }

  const createdDate = parseNavigationDate(walk.createdAt);
  if (createdDate !== undefined) {
    parsed.createdAt = createdDate;
  } else {
    delete parsed.createdAt;
  }

  if (Array.isArray(walk.photos)) {
    parsed.photos = walk.photos.map((photo) => {
      if (!photo || typeof photo !== 'object') {
        return photo;
      }
      const takenDate = parseNavigationDate(photo.takenAt);
      return takenDate !== undefined ? { ...photo, takenAt: takenDate } : { ...photo };
    });
  }

  return parsed;
}
