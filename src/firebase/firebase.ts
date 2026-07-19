import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

let app: FirebaseApp | null = null;
let _db: Firestore | null = null;
let _auth: Auth | null = null;

function getFirebaseApp() {
  if (!app) {
    app = initializeApp(firebaseConfig);
  }
  return app;
}

export const getDb = (): Firestore => {
  if (!_db) {
    _db = getFirestore(getFirebaseApp(), firebaseConfig.firestoreDatabaseId);
  }
  return _db;
};

export const getAuthInstance = (): Auth => {
  if (!_auth) {
    _auth = getAuth(getFirebaseApp());
  }
  return _auth;
};
