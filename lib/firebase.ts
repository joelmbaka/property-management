import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, Persistence } from "firebase/auth";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

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

// Custom persistence for React Native using AsyncStorage
const reactNativePersistence = {
  type: 'LOCAL' as const,
  async _isAvailable() { return true; },
  async _set(key: string, value: string) { await AsyncStorage.setItem(key, value); },
  _get: (key: string) => AsyncStorage.getItem(key),
  async _remove(key: string) { await AsyncStorage.removeItem(key); },
} as unknown as Persistence;

export const auth = Platform.OS === 'web'
  ? getAuth(firebaseApp)
  : initializeAuth(firebaseApp, { persistence: reactNativePersistence });
export const db = getFirestore(firebaseApp);


