/**
 * Annie Works 共有のお知らせハブ（開発停止・死亡時など全体向け）。
 * EXPO_PUBLIC_ANNOUNCEMENTS_* が無い場合は自アプリの Firebase にフォールバック。
 */
import { getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import Constants from 'expo-constants';
import { db as appDb } from './firebase';

const HUB_APP_NAME = 'annieworks-announcements';

function hubConfigFromEnv() {
  const extra = Constants.expoConfig?.extra ?? {};
  const apiKey =
    process.env.EXPO_PUBLIC_ANNOUNCEMENTS_API_KEY?.trim() ||
    extra.announcementsApiKey?.trim() ||
    '';
  const projectId =
    process.env.EXPO_PUBLIC_ANNOUNCEMENTS_PROJECT_ID?.trim() ||
    extra.announcementsProjectId?.trim() ||
    '';
  const appId =
    process.env.EXPO_PUBLIC_ANNOUNCEMENTS_APP_ID?.trim() ||
    extra.announcementsAppId?.trim() ||
    '';
  const authDomain =
    process.env.EXPO_PUBLIC_ANNOUNCEMENTS_AUTH_DOMAIN?.trim() ||
    extra.announcementsAuthDomain?.trim() ||
    (projectId ? `${projectId}.firebaseapp.com` : '');
  const storageBucket =
    process.env.EXPO_PUBLIC_ANNOUNCEMENTS_STORAGE_BUCKET?.trim() ||
    extra.announcementsStorageBucket?.trim() ||
    '';
  const messagingSenderId =
    process.env.EXPO_PUBLIC_ANNOUNCEMENTS_MESSAGING_SENDER_ID?.trim() ||
    extra.announcementsMessagingSenderId?.trim() ||
    '';

  if (!apiKey || !projectId || !appId) {
    return null;
  }

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket: storageBucket || undefined,
    messagingSenderId: messagingSenderId || undefined,
    appId,
  };
}

let hubDb;

/** `scope: "global"` 用 */
export function getGlobalAnnouncementsDb() {
  if (hubDb !== undefined) {
    return hubDb ?? appDb;
  }

  const config = hubConfigFromEnv();
  if (!config) {
    hubDb = null;
    return appDb;
  }

  try {
    const existing = getApps().find((entry) => entry.name === HUB_APP_NAME);
    const app = existing ?? initializeApp(config, HUB_APP_NAME);
    hubDb = getFirestore(app);
    return hubDb;
  } catch (error) {
    console.warn('[announcements] hub Firebase init failed; using app project', error);
    hubDb = null;
    return appDb;
  }
}

export function isAnnouncementsHubConfigured() {
  return hubConfigFromEnv() != null;
}

/** `scope: "app"` 用（このアプリの Firebase） */
export function getAppAnnouncementsDb() {
  return appDb;
}
