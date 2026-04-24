import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAv3iQly3v_s-IzRbxwuB10kINSvx71y1Y",
  authDomain: "ragto-rich-e0qytv.firebaseapp.com",
  projectId: "ragto-rich-e0qytv",
  storageBucket: "ragto-rich-e0qytv.firebasestorage.app",
  messagingSenderId: "1043474283049",
  appId: "1:1043474283049:web:bda408c3becd613bbd7a38",
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const googleProvider = new GoogleAuthProvider();
