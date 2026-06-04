import { doc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { deleteWalkPhotosFromStorage } from './walkPhotoUpload';

/**
 * Firestore のお散歩ドキュメントと Storage 上の写真を削除
 * @param {{ id: string, familyId?: string }} walk
 */
export async function deleteWalkRecord(walk) {
  const walkId = walk?.id;
  const familyId = walk?.familyId;
  if (!walkId) {
    throw new Error('deleteWalkRecord: walk id required');
  }

  if (familyId) {
    try {
      await deleteWalkPhotosFromStorage(familyId, walkId);
    } catch (error) {
      console.warn('deleteWalkPhotosFromStorage failed:', error);
      // 記録削除は続行（孤児ファイルは Storage 側で後から整理可能）
    }
  }

  await deleteDoc(doc(db, 'walks', walkId));
}
