import { Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import i18n from '../i18n';

export async function getNetworkUploadContext() {
  const state = await NetInfo.fetch();
  const connected = state.isConnected === true;
  const type = state.type;
  const isWifi = type === 'wifi' || type === 'ethernet';
  const isCellular = type === 'cellular';
  return { connected, isWifi, isCellular, type };
}

/**
 * @param {number} count
 * @returns {Promise<boolean>}
 */
export function confirmCellularPhotoUpload(count) {
  return new Promise((resolve) => {
    Alert.alert(
      i18n.t('walk.photoCellularConfirmTitle'),
      i18n.t('walk.photoCellularConfirmMsg', { count }),
      [
        { text: i18n.t('walk.cancel'), style: 'cancel', onPress: () => resolve(false) },
        { text: i18n.t('walk.photoCellularConfirmOk'), onPress: () => resolve(true) },
      ]
    );
  });
}

/**
 * 写真をクラウドに上げず記録だけ保存する前の確認
 * @param {number} count
 * @returns {Promise<boolean>}
 */
export function confirmSkipPhotosUpload(count) {
  return new Promise((resolve) => {
    Alert.alert(
      i18n.t('walk.photoSkipConfirmTitle'),
      i18n.t('walk.photoSkipConfirmMsg', { count }),
      [
        { text: i18n.t('walk.photoSkipConfirmNo'), style: 'cancel', onPress: () => resolve(false) },
        { text: i18n.t('walk.photoSkipConfirmYes'), onPress: () => resolve(true) },
      ]
    );
  });
}

/**
 * @returns {Promise<{ upload: boolean, skippedReason: 'no_network' | 'cellular_disabled' | 'user_cancelled' | 'user_declined_skip' | null }>}
 */
export async function resolveWalkPhotoUploadPolicy(uploadOnCellular, photoCount) {
  if (photoCount <= 0) {
    return { upload: false, skippedReason: null };
  }

  const { connected, isWifi, isCellular } = await getNetworkUploadContext();
  if (!connected) {
    const proceed = await confirmSkipPhotosUpload(photoCount);
    if (!proceed) {
      return { upload: false, skippedReason: 'user_declined_skip' };
    }
    return { upload: false, skippedReason: 'no_network' };
  }
  if (isWifi) {
    return { upload: true, skippedReason: null };
  }
  if (isCellular) {
    if (uploadOnCellular) {
      const ok = await confirmCellularPhotoUpload(photoCount);
      return { upload: ok, skippedReason: ok ? null : 'user_cancelled' };
    }
    const proceed = await confirmSkipPhotosUpload(photoCount);
    if (!proceed) {
      return { upload: false, skippedReason: 'user_declined_skip' };
    }
    return { upload: false, skippedReason: 'cellular_disabled' };
  }
  return { upload: true, skippedReason: null };
}
