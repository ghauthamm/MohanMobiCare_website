import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyD528k1IVASYrjQDsceV4RNbNsEnnhuQ6U",
  authDomain: "moham-mobicare.firebaseapp.com",
  databaseURL: "https://moham-mobicare-default-rtdb.firebaseio.com",
  projectId: "moham-mobicare",
  storageBucket: "moham-mobicare.firebasestorage.app",
  messagingSenderId: "523552730088",
  appId: "1:523552730088:web:a775682e0b73d8b7ddd25d",
  measurementId: "G-B47Y1TT248"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const googleProvider = new GoogleAuthProvider();

export default app;
