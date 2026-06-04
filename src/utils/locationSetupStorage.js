import AsyncStorage from '@react-native-async-storage/async-storage';

export const LOCATION_SETUP_COMPLETED_KEY = '@walk/location_setup_completed_v1';

export async function hasCompletedLocationSetup() {
  const value = await AsyncStorage.getItem(LOCATION_SETUP_COMPLETED_KEY);
  return value === 'true';
}

export async function setCompletedLocationSetup() {
  await AsyncStorage.setItem(LOCATION_SETUP_COMPLETED_KEY, 'true');
}
