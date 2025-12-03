// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAHoRoT187BCKrC302w99zGS8WGotQ84jQ",
  authDomain: "helpchain-5ee68.firebaseapp.com",
  projectId: "helpchain-5ee68",
  storageBucket: "helpchain-5ee68.appspot.com",
  messagingSenderId: "298731812994",
  appId: "1:298731812994:web:3098582eaccceee6ea9c9b"
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
