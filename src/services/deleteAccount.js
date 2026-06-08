import { deleteUser } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { deleteFamilyStorageAssets } from './storageFamilyCleanup';
import {
  isAccountDeletionInProgress,
  setAccountDeletionInProgress,
} from '../utils/accountDeletionState';

async function deleteFamilyData(familyId) {
  try {
    await deleteFamilyStorageAssets(familyId);
  } catch (error) {
    console.warn('deleteFamilyStorageAssets failed:', error);
  }

  const walksSnap = await getDocs(
    query(collection(db, 'walks'), where('familyId', '==', familyId))
  );
  await Promise.all(walksSnap.docs.map((walkDoc) => deleteDoc(walkDoc.ref)));

  const petsSnap = await getDocs(
    query(collection(db, 'pets'), where('familyId', '==', familyId))
  );
  await Promise.all(petsSnap.docs.map((petDoc) => deleteDoc(petDoc.ref)));

  await deleteDoc(doc(db, 'families', familyId));
}

/**
 * ユーザー文書・家族メンバー文書を削除し、家族の最後の1人なら家族データも削除する。
 * users 文書は最後に削除し、削除中の merge 書き込みで幽霊ドキュメントが残らないようにする。
 * @param {string} uid
 * @param {string | null | undefined} activeFamilyId
 */
export async function purgeUserFamilyData(uid, activeFamilyId) {
  if (activeFamilyId) {
    const memberRef = doc(db, 'family_members', `${activeFamilyId}_${uid}`);
    const memberSnap = await getDoc(memberRef);
    if (memberSnap.exists()) {
      await deleteDoc(memberRef);
    }

    const remaining = await getDocs(
      query(collection(db, 'users'), where('activeFamilyId', '==', activeFamilyId))
    );
    const otherUsersRemain = remaining.docs.some((userDoc) => userDoc.id !== uid);

    if (!otherUsersRemain) {
      await deleteFamilyData(activeFamilyId);
    }
  }

  await deleteDoc(doc(db, 'users', uid));
}

async function runAccountDeletion(deleteAuthUser) {
  if (isAccountDeletionInProgress()) {
    throw new Error('auth/deletion-in-progress');
  }

  setAccountDeletionInProgress(true);
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('auth/no-current-user');
    }

    const uid = user.uid;
    const userSnap = await getDoc(doc(db, 'users', uid));
    const activeFamilyId = userSnap.exists() ? userSnap.data().activeFamilyId : null;

    await purgeUserFamilyData(uid, activeFamilyId);
    await deleteAuthUser(user);
  } finally {
    setAccountDeletionInProgress(false);
  }
}

/**
 * ゲスト（匿名）アカウントと紐づく Firestore / Storage データを削除する。
 */
export async function deleteGuestAccount() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('auth/no-current-user');
  }
  if (!user.isAnonymous) {
    const err = new Error('auth/not-guest');
    err.code = 'auth/not-guest';
    throw err;
  }

  await runAccountDeletion((currentUser) => deleteUser(currentUser));
}

/**
 * ログイン中ユーザーのアカウントと、家族の最後の1人なら家族データも削除する。
 */
export async function deleteCurrentUserAccount() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('auth/no-current-user');
  }

  const lastSignInTime = new Date(user.metadata.lastSignInTime || 0).getTime();
  if (Date.now() - lastSignInTime > 5 * 60 * 1000) {
    const err = new Error('auth/requires-recent-login');
    err.code = 'auth/requires-recent-login';
    throw err;
  }

  await runAccountDeletion((currentUser) => deleteUser(currentUser));
}
