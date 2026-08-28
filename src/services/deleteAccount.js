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

  const familyRef = doc(db, 'families', familyId);
  const familySnap = await getDoc(familyRef);
  if (familySnap.exists()) {
    await deleteDoc(familyRef);
  }
}

/**
 * 当該ユーザー削除後に家族を消してよいか（他メンバー・他ユーザーの activeFamilyId が無い）
 * @param {string} familyId
 * @param {string} uid
 */
async function shouldDeleteFamilyAfterUserLeaves(familyId, uid) {
  const [usersSnap, membersSnap] = await Promise.all([
    getDocs(query(collection(db, 'users'), where('activeFamilyId', '==', familyId))),
    getDocs(query(collection(db, 'family_members'), where('familyId', '==', familyId))),
  ]);

  const otherUsers = usersSnap.docs.filter((userDoc) => userDoc.id !== uid);
  if (otherUsers.length > 0) {
    return false;
  }

  const otherMembers = membersSnap.docs.filter((memberDoc) => memberDoc.data().userId !== uid);
  return otherMembers.length === 0;
}

/**
 * ユーザーに紐づく family_members / families をすべて走査し、孤立した家族も削除する。
 * users 文書は最後に削除する。
 * @param {string} uid
 * @param {string | null | undefined} activeFamilyId
 */
export async function purgeUserFamilyData(uid, activeFamilyId) {
  const familyIds = new Set();
  if (activeFamilyId) {
    familyIds.add(activeFamilyId);
  }

  const memberSnap = await getDocs(
    query(collection(db, 'family_members'), where('userId', '==', uid))
  );
  memberSnap.docs.forEach((memberDoc) => {
    const familyId = memberDoc.data().familyId;
    if (familyId) {
      familyIds.add(familyId);
    }
  });

  const createdFamiliesSnap = await getDocs(
    query(collection(db, 'families'), where('createdBy', '==', uid))
  );
  createdFamiliesSnap.docs.forEach((familyDoc) => {
    familyIds.add(familyDoc.id);
  });

  // メンバーである間に、最後の1人なら家族データ（walks / pets / family）を消す。
  // membership を先に消すと、家族単位のルール下では一覧削除ができなくなる。
  for (const familyId of familyIds) {
    const shouldDelete = await shouldDeleteFamilyAfterUserLeaves(familyId, uid);
    if (shouldDelete) {
      await deleteFamilyData(familyId);
    }
  }

  await Promise.all(memberSnap.docs.map((memberDoc) => deleteDoc(memberDoc.ref)));

  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    await deleteDoc(userRef);
  }
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
