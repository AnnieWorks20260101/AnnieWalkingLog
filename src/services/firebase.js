// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// ⚠️ さきほどFirebaseコンソールに表示されたご自身のキー情報に書き換えてください
const firebaseConfig = {
  apiKey: "AIzaSyDyMpJTaFkwigC4sZTNth-_TxKhX5S-9Do",
  authDomain: "anniewalkinglog.firebaseapp.com",
  projectId: "anniewalkinglog",
  storageBucket: "anniewalkinglog.firebasestorage.app",
  messagingSenderId: "468922569983",
  appId: "1:468922569983:web:e59b92d1922b38fbfb68ca",
};

// Firebaseの初期化
const app = initializeApp(firebaseConfig);

// データベース（Firestore）の準備
export const db = getFirestore(app);