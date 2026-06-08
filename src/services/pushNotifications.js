import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { isAccountDeletionInProgress } from '../utils/accountDeletionState';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * AnnieEndingNote と同様: 権限取得 → Expo Push Token → users/{uid} に保存
 * 失敗してもアプリは止めない（ログのみ）
 */
export async function registerForPushNotificationsAsync(userId) {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[push] 通知が許可されませんでした');
      return null;
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

    if (!projectId) {
      console.error('[push] projectId が見つかりません');
      return null;
    }

    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;

    if (userId && !isAccountDeletionInProgress()) {
      // merge: ゲスト初回など users ドキュメント未作成時もエラーにしない
      await setDoc(doc(db, 'users', userId), { expoPushToken: token }, { merge: true });
      console.log('[push] トークンを保存しました');
    } else {
      console.log('[push] ログイン前のためトークンの保存を保留しました');
    }

    return token;
  } catch (error) {
    console.error('[push] 通知取得エラー:', error);
    return null;
  }
}
