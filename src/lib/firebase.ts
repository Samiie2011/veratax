import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// App Check initialization
if (typeof window !== 'undefined') {
  // In a real production environment, you would use a real site key.
  // For AI Studio, we can initialize it to show intent, but it might require console setup.
  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider('SITE_KEY_IF_AVAILABLE'),
    isTokenAutoRefreshEnabled: true
  });
}

export const logout = () => signOut(auth);
