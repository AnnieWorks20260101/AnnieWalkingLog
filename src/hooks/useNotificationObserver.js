import { useContext, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { NavigationRefContext } from '../navigation/NavigationRefContext';
import { navigateToWalkDetailFromRoot } from '../navigation/walkNavigation';

async function openWalkDetailFromNotificationData(navigationRef, data) {
  if (data?.type !== 'walk_ended' || !data?.walkId) {
    return;
  }

  const snap = await getDoc(doc(db, 'walks', data.walkId));
  if (!snap.exists()) {
    console.warn('[push] walk not found for notification:', data.walkId);
    return;
  }

  const walk = { id: snap.id, ...snap.data() };
  navigateToWalkDetailFromRoot(navigationRef, walk);
}

/**
 * 通知タップ時にお散歩記録詳細へ遷移
 */
export function useNotificationObserver() {
  const navigationRef = useContext(NavigationRefContext);
  const handledResponseIds = useRef(new Set());

  useEffect(() => {
    const processResponse = async (response) => {
      if (!response || !navigationRef) {
        return;
      }

      const responseId = response.notification.request.identifier;
      if (handledResponseIds.current.has(responseId)) {
        return;
      }
      handledResponseIds.current.add(responseId);

      try {
        const data = response.notification.request.content.data;
        await openWalkDetailFromNotificationData(navigationRef, data);
      } catch (error) {
        console.error('[push] notification navigation failed:', error);
      }
    };

    const subscription = Notifications.addNotificationResponseReceivedListener(processResponse);

    Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (response) {
          return processResponse(response);
        }
        return undefined;
      })
      .catch((error) => {
        console.error('[push] getLastNotificationResponseAsync failed:', error);
      });

    return () => subscription.remove();
  }, [navigationRef]);
}
