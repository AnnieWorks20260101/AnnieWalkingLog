import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  EmailAuthProvider,
  linkWithCredential,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../services/firebase';
import { deleteGuestAccount } from '../services/deleteAccount';
import { registerForPushNotificationsAsync } from '../services/pushNotifications';

const TEMP_ROUTE_KEY = 'temp_route';

/** ゲスト初回 setup の二重実行（onAuthStateChanged + signInAsGuest）を防ぐ */
const guestProfileEnsurePromises = new Map();

const AuthContext = createContext(null);

async function createFamilyForUser(uid, displayName = 'ユーザー') {
  const familyRef = await addDoc(collection(db, 'families'), {
    name: 'マイファミリー',
    createdBy: uid,
    createdAt: serverTimestamp(),
  });
  const newFamilyId = familyRef.id;

  await setDoc(doc(db, 'family_members', `${newFamilyId}_${uid}`), {
    familyId: newFamilyId,
    userId: uid,
    role: 'owner',
    joinedAt: serverTimestamp(),
  });

  await setDoc(
    doc(db, 'users', uid),
    {
      activeFamilyId: newFamilyId,
      displayName,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return newFamilyId;
}

async function ensureGuestProfileOnce(uid) {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists() && userSnap.data().activeFamilyId) {
    return userSnap.data().activeFamilyId;
  }

  await setDoc(
    userRef,
    {
      displayName: 'ゲスト',
      authProvider: 'guest',
      isGuest: true,
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );

  const recheckSnap = await getDoc(userRef);
  if (recheckSnap.exists() && recheckSnap.data().activeFamilyId) {
    return recheckSnap.data().activeFamilyId;
  }

  return createFamilyForUser(uid, 'ゲスト');
}

function ensureGuestProfile(uid) {
  if (guestProfileEnsurePromises.has(uid)) {
    return guestProfileEnsurePromises.get(uid);
  }

  const promise = ensureGuestProfileOnce(uid).finally(() => {
    guestProfileEnsurePromises.delete(uid);
  });
  guestProfileEnsurePromises.set(uid, promise);
  return promise;
}

export function AuthProvider({ children }) {
  const [userId, setUserId] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [familyId, setFamilyId] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [needsFamilySetup, setNeedsFamilySetup] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshUserProfile = useCallback(async (uid, anonymous) => {
    const userSnap = await getDoc(doc(db, 'users', uid));
    setDisplayName(userSnap.exists() ? userSnap.data().displayName ?? '' : '');

    if (anonymous) {
      const fid = await ensureGuestProfile(uid);
      setFamilyId(fid);
      setNeedsFamilySetup(false);
      const refreshedSnap = await getDoc(doc(db, 'users', uid));
      setDisplayName(refreshedSnap.exists() ? refreshedSnap.data().displayName ?? '' : '');
      return;
    }

    if (userSnap.exists() && userSnap.data().activeFamilyId) {
      setFamilyId(userSnap.data().activeFamilyId);
      setNeedsFamilySetup(false);
    } else {
      setFamilyId(null);
      setNeedsFamilySetup(true);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          setUserId(null);
          setIsGuest(false);
          setFamilyId(null);
          setDisplayName('');
          setNeedsFamilySetup(false);
          return;
        }

        setUserId(user.uid);
        setIsGuest(user.isAnonymous);
        await refreshUserProfile(user.uid, user.isAnonymous);
        registerForPushNotificationsAsync(user.uid);
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [refreshUserProfile]);

  const signInAsGuest = useCallback(async () => {
    const credential = await signInAnonymously(auth);
    return credential.user;
  }, []);

  const signInWithEmail = useCallback(async (email, password) => {
    const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
    return credential.user;
  }, []);

  const signUpWithEmail = useCallback(async (email, password, name) => {
    const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    await setDoc(doc(db, 'users', credential.user.uid), {
      email: email.trim(),
      displayName: name?.trim() || 'ユーザー',
      authProvider: 'email',
      isGuest: false,
      createdAt: serverTimestamp(),
    });
    setUserId(credential.user.uid);
    setIsGuest(false);
    setFamilyId(null);
    setDisplayName(name?.trim() || 'ユーザー');
    setNeedsFamilySetup(true);
    return credential.user;
  }, []);

  const sendPasswordReset = useCallback(async (email) => {
    await sendPasswordResetEmail(auth, email.trim());
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
  }, []);

  const discardGuestSession = useCallback(async () => {
    await deleteGuestAccount();
    try {
      await AsyncStorage.removeItem(TEMP_ROUTE_KEY);
    } catch (error) {
      console.warn('discardGuestSession: temp_route cleanup failed:', error);
    }
  }, []);

  const updateDisplayName = useCallback(async (name) => {
    if (!userId) {
      return { success: false, reason: 'invalid' };
    }

    const trimmed = name?.trim();
    if (!trimmed) {
      return { success: false, reason: 'empty' };
    }

    await setDoc(
      doc(db, 'users', userId),
      {
        displayName: trimmed,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    setDisplayName(trimmed);
    return { success: true };
  }, [userId]);

  const joinFamily = useCallback(
    async (targetFamilyId, name) => {
      const trimmed = targetFamilyId?.trim();
      if (!trimmed || !userId) {
        return { success: false, reason: 'invalid' };
      }

      const familySnap = await getDoc(doc(db, 'families', trimmed));
      if (!familySnap.exists()) {
        return { success: false, reason: 'notFound' };
      }

      const memberRef = doc(db, 'family_members', `${trimmed}_${userId}`);
      const memberSnap = await getDoc(memberRef);
      if (!memberSnap.exists()) {
        await setDoc(memberRef, {
          familyId: trimmed,
          userId,
          role: 'member',
          joinedAt: serverTimestamp(),
        });
      }

      const userPatch = {
        activeFamilyId: trimmed,
        isGuest: false,
        updatedAt: serverTimestamp(),
      };
      if (name?.trim()) {
        userPatch.displayName = name.trim();
      }

      await setDoc(doc(db, 'users', userId), userPatch, { merge: true });
      setFamilyId(trimmed);
      if (name?.trim()) {
        setDisplayName(name.trim());
      }
      setNeedsFamilySetup(false);
      return { success: true };
    },
    [userId]
  );

  const createNewFamily = useCallback(
    async (name) => {
      if (!userId) {
        return { success: false, reason: 'invalid' };
      }

      const userSnap = await getDoc(doc(db, 'users', userId));
      const resolvedName = name?.trim() || userSnap.data()?.displayName || 'ユーザー';
      const newFamilyId = await createFamilyForUser(userId, resolvedName);
      setFamilyId(newFamilyId);
      setDisplayName(resolvedName);
      setNeedsFamilySetup(false);
      return { success: true, familyId: newFamilyId };
    },
    [userId]
  );

  const completeFamilySetup = useCallback(
    async ({ familyIdInput, createNew, displayName: setupDisplayName }) => {
      if (createNew) {
        return createNewFamily(setupDisplayName);
      }
      return joinFamily(familyIdInput, setupDisplayName);
    },
    [createNewFamily, joinFamily]
  );

  const upgradeGuestWithEmail = useCallback(async (email, password, name) => {
    const user = auth.currentUser;
    if (!user?.isAnonymous) {
      return { success: false, reason: 'notGuest' };
    }

    const credential = EmailAuthProvider.credential(email.trim(), password);
    const linked = await linkWithCredential(user, credential);

    await setDoc(
      doc(db, 'users', linked.user.uid),
      {
        email: email.trim(),
        displayName: name?.trim() || 'ユーザー',
        authProvider: 'email',
        isGuest: false,
        upgradedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    setIsGuest(false);
    setDisplayName(name?.trim() || 'ユーザー');
    await refreshUserProfile(linked.user.uid, false);
    return { success: true };
  }, [refreshUserProfile]);

  return (
    <AuthContext.Provider
      value={{
        userId,
        isGuest,
        familyId,
        displayName,
        needsFamilySetup,
        loading,
        signInAsGuest,
        signInWithEmail,
        signUpWithEmail,
        sendPasswordReset,
        signOut,
        discardGuestSession,
        joinFamily,
        createNewFamily,
        completeFamilySetup,
        updateDisplayName,
        upgradeGuestWithEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
