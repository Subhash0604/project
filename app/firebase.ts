// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
const firebaseConfig = {
    apiKey:  process.env.NEXT_PUBLIC__API_KEY,
    authDomain: " process.env.NEXT_PUBLIC__AUTH_DOMAIN",
    projectId: " process.env.NEXT_PUBLIC__PROJECT_ID",
    storageBucket: " process.env.NEXT_PUBLIC__STORAGE_BUCKET",
    messagingSenderId: " process.env.NEXT_PUBLIC__MESSAGING_SENDER_ID",
    appId: " process.env.NEXT_PUBLIC__APP_ID"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();