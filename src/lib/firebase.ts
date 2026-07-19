import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCrpew32eVzYnehIQWbNaTrzGdPo_7-QN0",
  authDomain: "gen-lang-client-0891300546.firebaseapp.com",
  projectId: "gen-lang-client-0891300546",
  storageBucket: "gen-lang-client-0891300546.firebasestorage.app",
  messagingSenderId: "262414565660",
  appId: "1:262414565660:web:9cf18616eeac813a5a3ad9"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
