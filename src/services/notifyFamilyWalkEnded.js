import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';
import { sendPushNotification } from '../utils/pushUtils';
import { getNotificationSenderName } from '../utils/displayName';
import i18n from '../i18n';

/**
 * お散歩保存完了を、同じ家族の他メンバーにプッシュ通知（送信者本人は除く）
 * @param {{ familyId: string, senderUserId: string, senderDisplayName?: string, petNameLabel: string, walkId: string }} params
 */
export async function notifyFamilyMembersWalkEnded({
  familyId,
  senderUserId,
  senderDisplayName,
  petNameLabel,
  walkId,
}) {
  if (!familyId || !senderUserId || !walkId) {
    return { sent: 0 };
  }

  const snap = await getDocs(
    query(collection(db, 'users'), where('activeFamilyId', '==', familyId))
  );

  const senderName =
    getNotificationSenderName(senderDisplayName) ?? i18n.t('walk.pushWalkEndedSenderFallback');
  const petName = petNameLabel || i18n.t('walk.defaultPetName');

  const title = i18n.t('walk.pushWalkEndedTitle');
  const body = i18n.t('walk.pushWalkEndedBody', {
    senderName,
    petName,
  });

  const sends = [];
  snap.forEach((userDoc) => {
    if (userDoc.id === senderUserId) {
      return;
    }
    const token = userDoc.data()?.expoPushToken;
    if (!token) {
      return;
    }
    sends.push(
      sendPushNotification(token, title, body, {
        type: 'walk_ended',
        walkId,
        familyId,
      })
    );
  });

  await Promise.all(sends);
  return { sent: sends.length };
}
