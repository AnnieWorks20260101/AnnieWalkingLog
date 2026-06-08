/**
 * Firestore / Date 値を JSON エクスポート用に正規化する
 */

/**
 * @param {unknown} value
 * @returns {string | null}
 */
export function toExportIsoString(value) {
  if (value == null) {
    return null;
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
  return null;
}

/**
 * @param {unknown} value
 * @returns {unknown}
 */
export function serializeForExport(value) {
  if (value == null) {
    return value;
  }
  if (typeof value.toDate === 'function') {
    return value.toDate().toISOString();
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }
  if (Array.isArray(value)) {
    return value.map(serializeForExport);
  }
  if (typeof value === 'object') {
    const out = {};
    for (const [key, nested] of Object.entries(value)) {
      out[key] = serializeForExport(nested);
    }
    return out;
  }
  return value;
}
