// src/services/firebase.js
import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDyMpJTaFkwigC4sZTNth-_TxKhX5S-9Do',
  authDomain: 'anniewalkinglog.firebaseapp.com',
  projectId: 'anniewalkinglog',
  storageBucket: 'anniewalkinglog.firebasestorage.app',
  messagingSenderId: '468922569983',
  appId: '1:468922569983:web:e59b92d1922b38fbfb68ca',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

function initAuth() {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    if (error?.code === 'auth/already-initialized') {
      return getAuth(app);
    }
    throw error;
  }
}

// React Native では永続化を明示しないと再起動のたびに新しい匿名ユーザーになる
export const auth = initAuth();

export const db = getFirestore(app);
export const storage = getStorage(app);
