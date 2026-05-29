import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';

/**
 * 通知タップ時の処理（将来: 画面遷移などに data.screen を利用）
 */
export function useNotificationObserver() {
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      console.log('[push] notification tapped:', data);
    });

    return () => subscription.remove();
  }, []);
}
