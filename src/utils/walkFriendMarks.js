import { getPetPhotoUrl } from '../services/petPhotoUpload';

/**
 * 遭遇ピンの表示用。friendPetId でマスタがあれば名前・写真を優先し、
 * 無ければ記録に残ったスナップショットを使う。
 *
 * @param {{ friendPetId?: unknown, name?: unknown, photoUrl?: unknown } | null | undefined} mark
 * @param {{ id: string, name?: string, photoUrl?: string | null }[]} [friends]
 */
export function resolveFriendMarkForDisplay(mark, friends = []) {
  if (!mark || typeof mark !== 'object') {
    return { friendPetId: '', name: '', photoUrl: '' };
  }

  const friendPetId = typeof mark.friendPetId === 'string' ? mark.friendPetId : '';
  const snapshotName = typeof mark.name === 'string' ? mark.name : '';
  const snapshotPhoto = typeof mark.photoUrl === 'string' ? mark.photoUrl : '';

  const master =
    friendPetId.length > 0 ? friends.find((friend) => friend.id === friendPetId) : null;

  if (master) {
    const masterPhoto = getPetPhotoUrl(master) || '';
    return {
      ...mark,
      friendPetId,
      name: (master.name && String(master.name).trim()) || snapshotName,
      photoUrl: masterPhoto || snapshotPhoto,
    };
  }

  return {
    ...mark,
    friendPetId,
    name: snapshotName,
    photoUrl: snapshotPhoto,
  };
}

/**
 * @param {Array<Record<string, unknown>> | null | undefined} marks
 * @param {{ id: string, name?: string, photoUrl?: string | null }[]} [friends]
 */
export function resolveFriendMarksForDisplay(marks, friends = []) {
  if (!Array.isArray(marks)) {
    return [];
  }
  return marks.map((mark) => resolveFriendMarkForDisplay(mark, friends));
}
