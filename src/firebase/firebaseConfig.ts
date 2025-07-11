import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'Your Api Key',
  authDomain: 'Your Auth Domain',
  projectId: 'Project ID',
  storageBucket: 'Storage Bucket',
  messagingSenderId: 'Message Sender ID',
  appId: 'app Id',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, app };
