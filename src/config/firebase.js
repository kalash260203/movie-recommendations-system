// src/config/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCC7ug4GqiFv6axrmXO1ZATJrlkNYOxgao",
  authDomain: "popcornpicks-b1a75.firebaseapp.com",
  projectId: "popcornpicks-b1a75",
  storageBucket: "popcornpicks-b1a75.firebasestorage.app",
  messagingSenderId: "294001899925",
  appId: "1:294001899925:web:ba6b816b537d451139de9c",
  measurementId: "G-XQCNMXQB8T"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export { auth, analytics };