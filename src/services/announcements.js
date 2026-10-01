import { collection, getDocs, query, where } from 'firebase/firestore';
import { APP_ANNOUNCEMENT_ID } from '../constants/announcements';
import { getAppAnnouncementsDb, getGlobalAnnouncementsDb } from './announcementsDb';

function asStringMap(value) {
  if (!value || typeof value !== 'object') {
    return {};
  }
  const out = {};
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry === 'string' && entry.trim()) {
      out[key] = entry;
    }
  }
  return out;
}

function toMillis(value) {
  if (!value) {
    return null;
  }
  if (
    typeof value === 'object' &&
    value !== null &&
    typeof value.toMillis === 'function'
  ) {
    return value.toMillis();
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const parsed = Date.parse(`${trimmed}T00:00:00+09:00`);
      return Number.isNaN(parsed) ? null : parsed;
    }
    const parsed = Date.parse(trimmed);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
}

function resolveStartMs(data) {
  return toMillis(data.startsAt) ?? toMillis(data.startsOn);
}

function resolveBlocksMs(data) {
  return toMillis(data.blocksAt) ?? toMillis(data.blocksOn);
}

function resolveEndMs(data) {
  return toMillis(data.endsAt) ?? toMillis(data.endsOn);
}

/**
 * Visible from startsOn; blocks from blocksOn (if set).
 * Without blocksOn, `blocking: true` means block as soon as visible.
 */
function resolveBlocking(data, now, blocksAtMs) {
  if (blocksAtMs != null) {
    return now >= blocksAtMs;
  }
  return data.blocking === true;
}

function compareSemver(a, b) {
  const pa = a.split('.').map((n) => Number.parseInt(n, 10) || 0);
  const pb = b.split('.').map((n) => Number.parseInt(n, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i += 1) {
    const da = pa[i] ?? 0;
    const db = pb[i] ?? 0;
    if (da !== db) {
      return da < db ? -1 : 1;
    }
  }
  return 0;
}

export function localizedAnnouncementText(map, locale, fallback = '') {
  return map?.[locale] || map?.en || map?.ja || Object.values(map || {})[0] || fallback;
}

function parseAnnouncementDocs(snapDocs, allowedScopes) {
  const now = Date.now();
  const rows = [];

  for (const docSnap of snapDocs) {
    const data = docSnap.data();
    const scope = data.scope === 'global' ? 'global' : data.scope === 'app' ? 'app' : null;
    const kind = data.kind === 'shutdown' ? 'shutdown' : data.kind === 'feature' ? 'feature' : null;
    if (!scope || !kind || !allowedScopes.includes(scope)) {
      continue;
    }

    const startsAtMs = resolveStartMs(data);
    const blocksAtMs = resolveBlocksMs(data);
    const endsAtMs = resolveEndMs(data);
    if (startsAtMs != null && now < startsAtMs) {
      continue;
    }
    if (endsAtMs != null && now > endsAtMs) {
      continue;
    }

    if (scope === 'app') {
      const appIds = Array.isArray(data.appIds)
        ? data.appIds.filter((id) => typeof id === 'string')
        : typeof data.appId === 'string'
          ? [data.appId]
          : [APP_ANNOUNCEMENT_ID];
      if (!appIds.includes(APP_ANNOUNCEMENT_ID)) {
        continue;
      }
    }

    rows.push({
      id: docSnap.id,
      scope,
      kind,
      blocking: resolveBlocking(data, now, blocksAtMs),
      active: true,
      titles: asStringMap(data.titles),
      bodies: asStringMap(data.bodies),
      targetAppVersion: typeof data.targetAppVersion === 'string' ? data.targetAppVersion : undefined,
      appIds: Array.isArray(data.appIds)
        ? data.appIds.filter((id) => typeof id === 'string')
        : undefined,
      priority: typeof data.priority === 'number' ? data.priority : kind === 'shutdown' ? 1000 : 10,
      startsAtMs,
      blocksAtMs,
      endsAtMs,
    });
  }

  return rows;
}

async function fetchActiveFrom(db, scopes) {
  const snap = await getDocs(query(collection(db, 'announcements'), where('active', '==', true)));
  return parseAnnouncementDocs(snap.docs, scopes);
}

/**
 * App feature notes → this product's Firebase.
 * Global shutdown → Annie Works hub when configured, else same project.
 */
export async function fetchActiveAnnouncements() {
  const appDb = getAppAnnouncementsDb();
  const globalDb = getGlobalAnnouncementsDb();
  const sameProject = appDb === globalDb;

  if (sameProject) {
    const rows = await fetchActiveFrom(appDb, ['app', 'global']);
    return rows.sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id));
  }

  const [appRows, globalRows] = await Promise.all([
    fetchActiveFrom(appDb, ['app']).catch((error) => {
      console.warn('[announcements] app feed failed', error);
      return [];
    }),
    fetchActiveFrom(globalDb, ['global']).catch((error) => {
      console.warn('[announcements] global hub feed failed', error);
      return [];
    }),
  ]);

  return [...globalRows, ...appRows].sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id));
}

export function filterFeatureAnnouncements(rows, appVersion, previousAppVersion) {
  return rows.filter((row) => {
    if (row.kind !== 'feature' || row.scope !== 'app') {
      return false;
    }
    if (!row.targetAppVersion) {
      return true;
    }
    if (row.targetAppVersion === appVersion) {
      return true;
    }
    if (
      previousAppVersion &&
      compareSemver(previousAppVersion, row.targetAppVersion) < 0 &&
      compareSemver(appVersion, row.targetAppVersion) >= 0
    ) {
      return true;
    }
    return false;
  });
}

export function filterShutdownAnnouncements(rows) {
  return rows.filter((row) => row.kind === 'shutdown');
}
