import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCN2tA-GfaOXu8D75hunVXW1tYBO2q-Zdg',
  authDomain: 'personalized-fitness-app.firebaseapp.com',
  projectId: 'personalized-fitness-app',
  storageBucket: 'personalized-fitness-app.firebasestorage.app',
  messagingSenderId: '169179603999',
  appId: '1:169179603999:android:392e109aec5160b620a12a',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
