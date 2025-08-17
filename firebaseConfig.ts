import { initializeApp } from "firebase/app";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyAeB6iyqABbGiX4lK7OqPwoLbfw93RmxYA",
  authDomain: "magicmirror-3e2f7.firebaseapp.com",
  projectId: "magicmirror-3e2f7",
  storageBucket: "magicmirror-3e2f7.firebasestorage.app",
  messagingSenderId: "24586909644",
  appId: "1:24586909644:web:ff44c497059c42ba700f69",
  measurementId: "G-0360Q6RD6W",
};

export const app = initializeApp(firebaseConfig);
export const functions = getFunctions(app);
export default firebaseConfig;
