// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getRemoteConfig } from "firebase/remote-config";
import { initializeAuth,getReactNativePersistence } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyCd9KZc-3Cvyk-YLSlvgOeRDrxop5NzvAc",
  authDomain: "smartkrishi-1a900.firebaseapp.com",
  projectId: "smartkrishi-1a900",
  storageBucket: "smartkrishi-1a900.firebasestorage.app",
  messagingSenderId: "550077541642",
  appId: "1:550077541642:web:87d00aef6a7a99b8609ef3",
  measurementId: "G-67C16NWTZ3"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_DB = getFirestore(FIREBASE_APP);
export const FIREBASE_DB_REALTIME = getDatabase(FIREBASE_APP);
export const REMOTE_CONFIG = getRemoteConfig(FIREBASE_APP);
export const CONFIG = firebaseConfig;
export const FIREBASE_Auth = initializeAuth(FIREBASE_APP, {
  persistence: getReactNativePersistence(AsyncStorage),
});