// src/config/firebase.config.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBO-_s6-WnI4gJK_liORAJGK9VWmsJU5-k",
  authDomain: "clouds5-210ea.firebaseapp.com",
  projectId: "clouds5-210ea",
  storageBucket: "clouds5-210ea.firebasestorage.app",
  messagingSenderId: "232686176523",
  appId: "1:232686176523:web:f455c94a62cac710043a0e",
  measurementId: "G-38XFRC7366"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Exporter les instances
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
