import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";

// 🔥 Your Firebase web config
const firebaseConfig = {
  apiKey: "AIzaSyAeB6iyqABbGiX4lK7OqPwoLbfw93RmxYA",
  authDomain: "magicmirror-3e2f7.firebaseapp.com",
  projectId: "magicmirror-3e2f7",
  storageBucket: "magicmirror-3e2f7.firebasestorage.app",
  messagingSenderId: "24586909644",
  appId: "1:24586909644:web:ff44c497059c42ba700f69",
  measurementId: "G-0360Q6RD6W",
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const functions = getFunctions(app);

export default app;
