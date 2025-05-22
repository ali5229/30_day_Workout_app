import React, {createContext, useContext, useState, useEffect} from 'react';
import asyncStorage from '@react-native-async-storage/async-storage';
import {AuthData, authService} from '../services/authService';

type AuthContextData = {
    authData?: AuthData;
    loading: boolean;
    setAuthData: React.Dispatch<React.SetStateAction<AuthData | undefined>>;
    signIn(email: string, password: string): Promise<void>;
    signOut(): void;
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [authData, setAuthData] = useState<AuthData>();
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        loadStorageData();
    }, []);

    async function loadStorageData() : Promise<void> {
       try{
        const authDataSerialized = await asyncStorage.getItem('@AuthData');
        if (authDataSerialized) {
            const _authData: AuthData =  JSON.parse(authDataSerialized);
            setAuthData(_authData);
        }
       } catch (error){
        console.log('Failed to load auth data:', error);
       } finally {
        setLoading(false);
       }
    }

    const signIn = async (email: string, password: string) => {
        const _authData = await authService.signIn(email, password);
        setAuthData(_authData);
        await asyncStorage.setItem('@AuthData', JSON.stringify(_authData));
      };
    
    const signOut = async () => {
        setAuthData(undefined);
        await asyncStorage.multiRemove([
  '@AuthData',
  'workoutPlan',
  'planGeneratedAt',
]);
setAuthData(undefined);
      };

    return (
        <AuthContext.Provider value={{authData, loading,setAuthData, signIn, signOut}}>
            {children}
        </AuthContext.Provider>
    );
};

function useAuth(): AuthContextData {
    const context = useContext(AuthContext);
  
    if (!context) {
      throw new Error('useAuth must be used within an AuthProvider');
    }
  
    return context;
  }
  
  export {AuthContext, AuthProvider, useAuth};