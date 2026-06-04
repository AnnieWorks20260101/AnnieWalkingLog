import { toWalkStartDate } from './walkGraphMetrics';

/** @typedef {'auto' | 'h12' | 'h24'} TimeFormat */

/**
 * @param {Date} date
 * @param {TimeFormat} format
 */
export function formatTimeOfDay(date, format = 'auto') {
  if (!date || Number.isNaN(date.getTime())) {
    return '';
  }
  const options = { hour: '2-digit', minute: '2-digit' };
  if (format === 'h12') {
    options.hour12 = true;
  } else if (format === 'h24') {
    options.hour12 = false;
  }
  return date.toLocaleTimeString([], options);
}

/**
 * Firestore Timestamp など
 * @param {{ toDate?: () => Date } | Date | null | undefined} value
 * @param {TimeFormat} format
 */
export function formatTimestampTime(value, format = 'auto') {
  const date = toWalkStartDate(value);
  if (!date || Number.isNaN(date.getTime())) {
    return '';
  }
  return formatTimeOfDay(date, format);
}

export function getTimeFormatLabel(format, i18n) {
  const key = `settings.timeFormat_${format}`;
  const translated = i18n.t(key);
  return translated !== key ? translated : format;
}
