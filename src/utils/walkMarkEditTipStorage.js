import AsyncStorage from '@react-native-async-storage/async-storage';

const WALK_MARK_EDIT_TIP_KEY = '@walk/mark_edit_tip_v2';

export async function hasSeenWalkMarkEditTip() {
  const value = await AsyncStorage.getItem(WALK_MARK_EDIT_TIP_KEY);
  return value === 'true';
}

export async function setWalkMarkEditTipSeen() {
  await AsyncStorage.setItem(WALK_MARK_EDIT_TIP_KEY, 'true');
}

export async function clearWalkMarkEditTipSeen() {
  await AsyncStorage.removeItem(WALK_MARK_EDIT_TIP_KEY);
}
