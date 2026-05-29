import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { registerForPushNotificationsAsync } from '../services/pushNotifications';

const AuthContext = createContext(null);

async function createFamilyForUser(uid) {
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

  await setDoc(doc(db, 'users', uid), {
    activeFamilyId: newFamilyId,
    displayName: 'ユーザー',
    createdAt: serverTimestamp(),
  });

  return newFamilyId;
}

export function AuthProvider({ children }) {
  const [userId, setUserId] = useState(null);
  const [familyId, setFamilyId] = useState(null);
  const [loading, setLoading] = useState(true);

  const ensureUserProfile = useCallback(async (uid) => {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const activeFamilyId = userSnap.data().activeFamilyId;
      setFamilyId(activeFamilyId);
      return activeFamilyId;
    }

    const newFamilyId = await createFamilyForUser(uid);
    setFamilyId(newFamilyId);
    return newFamilyId;
  }, []);

  const isSigningIn = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          isSigningIn.current = false;
          setUserId(user.uid);
          await ensureUserProfile(user.uid);
        } else if (!isSigningIn.current) {
          isSigningIn.current = true;
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        isSigningIn.current = false;
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [ensureUserProfile]);

  useEffect(() => {
    if (!userId) return;
    registerForPushNotificationsAsync(userId);
  }, [userId]);

  const joinFamily = useCallback(
    async (targetFamilyId) => {
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

      await setDoc(
        doc(db, 'users', userId),
        { activeFamilyId: trimmed },
        { merge: true }
      );
      setFamilyId(trimmed);
      return { success: true };
    },
    [userId]
  );

  return (
    <AuthContext.Provider value={{ userId, familyId, loading, joinFamily }}>
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
