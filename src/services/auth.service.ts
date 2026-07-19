import { UserProfile } from '../types/auth';
import { getAuthInstance, getDb } from '../firebase/firebase';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  GoogleAuthProvider,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';

export const AuthService = {
  login: async (email: string, password: string, _rememberMe: boolean): Promise<UserProfile> => {
    const auth = getAuthInstance();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('User logged in:', userCredential.user.uid);
    const userDoc = await getDoc(doc(getDb(), 'users', userCredential.user.uid));
    
    if (!userDoc.exists()) {
      console.log('User doc not found:', userCredential.user.uid);
      throw new Error('User profile not found.');
    }

    const userData = userDoc.data() as UserProfile;
    
    if (userData.status === 'inactive') {
      await signOut(auth);
      throw new Error('Your account has been deactivated. Contact administration.');
    }

    await updateDoc(doc(getDb(), 'users', userCredential.user.uid), {
      lastLogin: serverTimestamp()
    });

    return userData;
  },

  googleLogin: async (): Promise<UserProfile> => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(getAuthInstance(), provider);
    const db = getDb();
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      const newUser: UserProfile = {
        uid: userCredential.user.uid,
        email: userCredential.user.email!,
        displayName: userCredential.user.displayName || 'New User',
        photoURL: userCredential.user.photoURL || '',
        role: 'student',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      await setDoc(userDocRef, newUser);
      return newUser;
    }

    const userData = userDoc.data() as UserProfile;
    
    await updateDoc(userDocRef, {
      lastLogin: serverTimestamp()
    });

    return userData;
  },

  logout: async (): Promise<void> => {
    await signOut(getAuthInstance());
  },

  forgotPassword: async (email: string): Promise<string> => {
    await sendPasswordResetEmail(getAuthInstance(), email);
    return `Reset link successfully sent to ${email}`;
  },

  resetPassword: async (_email: string, _password: string): Promise<void> => {
    // Note: Firebase Auth handles password resets differently.
    throw new Error('Please use the password reset email link.');
  },

  getCurrentUser: async (): Promise<UserProfile | null> => {
    const auth = getAuthInstance();
    const user = auth.currentUser;
    if (!user) return null;

    const userDoc = await getDoc(doc(getDb(), 'users', user.uid));
    return userDoc.exists() ? (userDoc.data() as UserProfile) : null;
  }
};
