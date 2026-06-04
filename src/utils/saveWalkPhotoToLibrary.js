import { Alert } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import i18n from '../i18n';

/**
 * 撮影したお散歩写真を端末のフォトライブラリに保存
 * @returns {Promise<boolean>} 保存に成功したか
 */
export async function saveWalkPhotoToDeviceLibrary(localUri) {
  if (!localUri) {
    return false;
  }

  const permission = await MediaLibrary.requestPermissionsAsync();
  if (!permission.granted) {
    Alert.alert(i18n.t('common.error'), i18n.t('walk.photoLibraryPermissionDenied'));
    return false;
  }

  try {
    await MediaLibrary.saveToLibraryAsync(localUri);
    return true;
  } catch (error) {
    console.warn('saveWalkPhotoToDeviceLibrary failed:', error);
    Alert.alert(i18n.t('common.error'), i18n.t('walk.photoLibrarySaveError'));
    return false;
  }
}
