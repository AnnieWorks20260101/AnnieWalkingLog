import {
  fetchActiveAnnouncements,
  filterShutdownAnnouncements,
} from './announcements';

/**
 * True when any shutdown announcement is past startsOn (visible window).
 * Used to stop new store purchases while restore remains available.
 */
export async function isShutdownPurchaseFreezeActive() {
  try {
    const rows = await fetchActiveAnnouncements();
    return filterShutdownAnnouncements(rows).length > 0;
  } catch (error) {
    console.warn('[announcements] purchase-freeze check failed', error);
    return false;
  }
}

export function shutdownFreezeFromRows(rows) {
  return filterShutdownAnnouncements(rows).length > 0;
}
