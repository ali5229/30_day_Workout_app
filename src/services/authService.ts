
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth,db } from '../firebase/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import asyncStorage from '@react-native-async-storage/async-storage';


export type AuthData = {
    token?: string;
    userId:string;
    email?: string;
    name?: string;
    
};

const signIn = async (email: string, password: string): Promise<AuthData> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();
    const user = userCredential.user;
    return {
      token,
      email: userCredential.user.email ?? '',
      userId: user.uid,
      name: userCredential.user.displayName ?? 'Unknown User',
    };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign in');
  }
};

const signUp = async({
  email,
  password,
  age,
  height,
  weight,
  diabetes,
  experience,
  gym_equipment,
  workoutdays,
}:{
  email: string;
  password: string;
  age: number;
  height: number;
  weight: number;
  diabetes: string;
  experience: string;
  gym_equipment: string;
  workoutdays: string | null;
}): Promise<AuthData> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  const token = await user.getIdToken();

  await setDoc(doc(db, 'users', user.uid), {
    email,
    age,
    height,
    weight,
    diabetes,
    experience,
    workoutdays,
    gym_equipment,
    createdAt: new Date(),
  });
  const authData: AuthData = {
    token,
    userId: user.uid,
    email: userCredential.user.email ?? '',
    name: user.displayName ?? 'Unknown User',
  };

  await asyncStorage.setItem('@AuthData', JSON.stringify(authData));
  return authData;
};

export const authService = {
    signIn,
    signUp,
  };