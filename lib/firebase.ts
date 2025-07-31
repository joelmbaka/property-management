import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

import { getFirestore } from "firebase/firestore";



const firebaseConfig = {
  apiKey: "AIzaSyDdQJrws49JUJaKj20nPFz5jngrotruCIY",
  authDomain: "property-management-app-fc397.firebaseapp.com",
  projectId: "property-management-app-fc397",
  storageBucket: "property-management-app-fc397.firebasestorage.app",
  messagingSenderId: "1028908888678",
  appId: "1:1028908888678:web:758a5ce032a3074d63b3a7",
  measurementId: "G-MMTW1MFW4E",
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);


