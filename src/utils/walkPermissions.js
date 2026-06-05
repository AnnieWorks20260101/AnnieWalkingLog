import { Platform, Linking } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';

/**
 * iOS では設定で「常に許可」でも getBackgroundPermissionsAsync() が granted 以外を返すことがある。
 * foreground.ios.scope === 'always' を併せて判定する。
 */
export function isBackgroundLocationGranted(foreground, background) {
  if (foreground?.status !== 'granted') {
    return false;
  }
  if (Platform.OS === 'ios') {
    return foreground.ios?.scope === 'always' || background?.status === 'granted';
  }
  return background?.status === 'granted';
}

export async function fetchLocationPermissionSnapshot() {
  const [foreground, background] = await Promise.all([
    Location.getForegroundPermissionsAsync(),
    Location.getBackgroundPermissionsAsync(),
  ]);
  return { foreground, background };
}

/** お散歩のバックグラウンド記録に必要な位置許可が揃っているか */
export async function isWalkBackgroundLocationReady() {
  const { foreground, background } = await fetchLocationPermissionSnapshot();
  return isBackgroundLocationGranted(foreground, background);
}

export async function getWalkPermissionStatus() {
  const [notif, foreground, background] = await Promise.all([
    Notifications.getPermissionsAsync(),
    Location.getForegroundPermissionsAsync(),
    Location.getBackgroundPermissionsAsync(),
  ]);

  return {
    notification: notif.granted === true || notif.status === 'granted',
    foregroundLocation: foreground.status === 'granted',
    backgroundLocation: isBackgroundLocationGranted(foreground, background),
  };
}

export async function requestWalkNotificationPermission() {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted || current.status === 'granted') {
    return true;
  }
  const result = await Notifications.requestPermissionsAsync();
  return result.granted === true || result.status === 'granted';
}

export async function requestWalkForegroundLocationPermission() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

export async function requestWalkBackgroundLocationPermission() {
  const snapshot = await fetchLocationPermissionSnapshot();
  if (isBackgroundLocationGranted(snapshot.foreground, snapshot.background)) {
    return true;
  }

  const backgroundResult = await Location.requestBackgroundPermissionsAsync();
  const foreground = await Location.getForegroundPermissionsAsync();
  return isBackgroundLocationGranted(foreground, backgroundResult);
}

export async function openAppSettings() {
  try {
    if (Platform.OS === 'ios') {
      await Linking.openURL('app-settings:');
    } else {
      await Linking.openSettings();
    }
    return true;
  } catch (error) {
    console.warn('openAppSettings failed:', error);
    return false;
  }
}
