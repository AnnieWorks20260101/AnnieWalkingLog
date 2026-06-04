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

  const uid = user.uid;
  const userSnap = await getDoc(doc(db, 'users', uid));
  const activeFamilyId = userSnap.exists() ? userSnap.data().activeFamilyId : null;

  await deleteDoc(doc(db, 'users', uid));

  if (activeFamilyId) {
    const memberRef = doc(db, 'family_members', `${activeFamilyId}_${uid}`);
    const memberSnap = await getDoc(memberRef);
    if (memberSnap.exists()) {
      await deleteDoc(memberRef);
    }

    const membersQuery = query(
      collection(db, 'users'),
      where('activeFamilyId', '==', activeFamilyId)
    );
    const remaining = await getDocs(membersQuery);

    if (remaining.empty) {
      await deleteDoc(doc(db, 'families', activeFamilyId));

      const petsSnap = await getDocs(
        query(collection(db, 'pets'), where('familyId', '==', activeFamilyId))
      );
      await Promise.all(petsSnap.docs.map((d) => deleteDoc(d.ref)));

      const walksSnap = await getDocs(
        query(collection(db, 'walks'), where('familyId', '==', activeFamilyId))
      );
      await Promise.all(walksSnap.docs.map((d) => deleteDoc(d.ref)));
    }
  }

  await deleteUser(user);
}
