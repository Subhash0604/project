// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
const firebaseConfig = {
    apiKey: "AIzaSyDW6A25vqoWuxJpm5mpArTC5CutecKEk4A",
    authDomain: "carpooling-e337a.firebaseapp.com",
    projectId: "carpooling-e337a",
    storageBucket: "carpooling-e337a.firebasestorage.app",
    messagingSenderId: "708715504337",
    appId: "1:708715504337:web:8876d8ba056b89df941bf0"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();