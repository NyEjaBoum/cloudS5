// src/config/firebase.config.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD2ZWSrx8W7SklEO2DaSgMWQVSnmD27zX8",
  authDomain: "mapeo-23bbc.firebaseapp.com",
  projectId: "mapeo-23bbc",
  storageBucket: "mapeo-23bbc.firebasestorage.app",
  messagingSenderId: "422703868234",
  appId: "1:422703868234:web:2f00c78a273c29df3df9b3",
  measurementId: "G-5FJGQTJ6V5"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Exporter les instances
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
