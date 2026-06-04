import AsyncStorage from '@react-native-async-storage/async-storage';

export const BG_LOCATION_DISCLOSURE_KEY = '@walk/bg_location_disclosure_accepted_v1';

export async function hasAcceptedBgLocationDisclosure() {
  const value = await AsyncStorage.getItem(BG_LOCATION_DISCLOSURE_KEY);
  return value === 'true';
}

export async function setAcceptedBgLocationDisclosure() {
  await AsyncStorage.setItem(BG_LOCATION_DISCLOSURE_KEY, 'true');
}
