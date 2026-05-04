import { auth, db } from './firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const STAFF_ACCOUNTS = Array.from({ length: 10 }, (_, i) => {
  const num = (i + 1).toString().padStart(3, '0');
  return {
    email: `user${num}@veratax.vn`,
    password: `User${num}@@`,
    fullName: `Nhân viên Veratax ${num}`,
    role: 'staff' as const
  };
});

const ACCOUNTS = [
  {
    email: 'veratax.ad@gmail.com',
    password: 'Vera123@@',
    fullName: 'Quản trị viên Veratax',
    role: 'admin' as const
  },
  ...STAFF_ACCOUNTS
];

export async function seedUsers() {
  const results = [];
  for (const account of ACCOUNTS) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, account.email, account.password);
      const { user } = userCredential;
      
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: account.email,
        fullName: account.fullName,
        role: account.role,
        createdAt: serverTimestamp()
      });
      results.push({ email: account.email, status: 'success' });
    } catch (error: any) {
      results.push({ email: account.email, status: 'error', message: error.message });
    }
  }
  return results;
}
