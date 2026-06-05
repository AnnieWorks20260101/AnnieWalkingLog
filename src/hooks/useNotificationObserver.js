import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { navigateToWalkDetailFromRoot } from '../navigation/walkNavigation';

function parseWalkEndedNotificationData(raw) {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const type = raw.type ?? raw.data?.type;
  const walkId = raw.walkId ?? raw.data?.walkId;
  if (type !== 'walk_ended' || !walkId) {
    return null;
  }

  return { walkId: String(walkId) };
}

async function openWalkDetailFromNotificationData(navigationRef, data) {
  const parsed = parseWalkEndedNotificationData(data);
  if (!parsed) {
    console.warn('[push] notification data missing walk_ended payload:', data);
    return;
  }

  const snap = await getDoc(doc(db, 'walks', parsed.walkId));
  if (!snap.exists()) {
    console.warn('[push] walk not found for notification:', parsed.walkId);
    return;
  }

  const walk = { id: snap.id, ...snap.data() };
  navigateToWalkDetailFromRoot(navigationRef, walk);
}

/**
 * 通知タップ時にお散歩記録詳細へ遷移
 * @param {import('@react-navigation/native').NavigationContainerRef<ReactNavigation.RootParamList> | null} navigationRef
 */
export function useNotificationObserver(navigationRef) {
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
