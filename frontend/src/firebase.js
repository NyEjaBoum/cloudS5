// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBO-_s6-WnI4gJK_liORAJGK9VWmsJU5-k",
  authDomain: "clouds5-210ea.firebaseapp.com",
  projectId: "clouds5-210ea",
  storageBucket: "clouds5-210ea.firebasestorage.app",
  messagingSenderId: "232686176523",
  appId: "1:232686176523:web:f455c94a62cac710043a0e",
  measurementId: "G-38XFRC7366"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);