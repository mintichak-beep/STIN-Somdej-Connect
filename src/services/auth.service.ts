import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signOut as firebaseSignOut
} from "firebase/auth";
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { getAuthInstance, getDb } from '../firebase/firebase';
import { UserProfile } from '../types/auth';

const STIN_DOMAIN = "@stin.ac.th";

export const authService = {
  // 1. Continue with Google
  signInWithGoogle: async (): Promise<UserProfile> => {
    const auth = getAuthInstance();
    const googleProvider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (!user.email?.endsWith(STIN_DOMAIN)) {
        await firebaseSignOut(auth);
        throw new Error("Please use your @stin.ac.th email address.");
      }

      return await syncUserProfile(user);
    } catch (error) {
      throw error;
    }
  },

  // 2. STIN Email Login
  signInWithEmail: async (email: string, password: string): Promise<UserProfile> => {
    const auth = getAuthInstance();
    if (!email.endsWith(STIN_DOMAIN)) {
      throw new Error("Only @stin.ac.th email addresses are permitted.");
    }
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return await syncUserProfile(result.user);
    } catch (error) {
      throw error;
    }
  },

  // 3. Reset Password
  resetPassword: async (email: string): Promise<void> => {
    const auth = getAuthInstance();
    if (!email.endsWith(STIN_DOMAIN)) {
      throw new Error("Please enter a valid @stin.ac.th email.");
    }
    await sendPasswordResetEmail(auth, email);
  },

  signOut: () => firebaseSignOut(getAuthInstance()),

  getCurrentUser: async (): Promise<UserProfile | null> => {
    const auth = getAuthInstance();
    const user = auth.currentUser;
    if (!user) return null;
    const userDoc = await getDoc(doc(getDb(), "users", user.uid));
    return userDoc.exists() ? (userDoc.data() as UserProfile) : null;
  },
};

// Helper: Sync Firestore Profile
async function syncUserProfile(user: any): Promise<UserProfile> {
  const db = getDb();
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const newUser: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName: user.displayName || "STIN User",
      photoURL: user.photoURL || "",
      role: "student", // Default role
      status: "active", 
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    await setDoc(userRef, newUser);
    return newUser;
  } else {
    await updateDoc(userRef, { lastLogin: serverTimestamp() });
    return userSnap.data() as UserProfile;
  }
}
