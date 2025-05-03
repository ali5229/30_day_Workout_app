//VN2305890305044
import React, { useEffect, useState } from 'react';
import {Router} from './src/routes/Router';
import {AuthProvider} from './src/context/Auth';
import SplashScreen from './src/screens/splash';
import {SafeAreaProvider,SafeAreaView} from 'react-native-safe-area-context';


const App = () => {

    const [splashVisible, setSplashVisible] = useState(true);
    useEffect(() => {
        const splashTimer = setTimeout(() => {
          setSplashVisible(false);
        }, 2000);
    
        return () => clearTimeout(splashTimer);
      }, []);


    if (splashVisible) {
        return <SplashScreen />;
      }
  return (
       <>
        <SafeAreaProvider style={{ flex: 1, backgroundColor: '#ffffff' }}>
          <SafeAreaView  style={{ flex: 1, }}
              edges={['right', 'bottom', 'left']}>
                
          <AuthProvider>
              <Router />
          </AuthProvider>
         
          </SafeAreaView>
        </SafeAreaProvider>
        </>
  );
};


export default App;
