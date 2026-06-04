import { Platform, Linking } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';

export async function getWalkPermissionStatus() {
  const [notif, foreground, background] = await Promise.all([
    Notifications.getPermissionsAsync(),
    Location.getForegroundPermissionsAsync(),
    Location.getBackgroundPermissionsAsync(),
  ]);

  return {
    notification: notif.granted === true || notif.status === 'granted',
    foregroundLocation: foreground.status === 'granted',
    backgroundLocation: background.status === 'granted',
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
  const { status } = await Location.requestBackgroundPermissionsAsync();
  return status === 'granted';
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
