//VN2305890305044
import React, { useEffect, useState } from 'react';
import {Router} from './src/routes/Router';
import {AuthProvider} from './src/context/Auth';
import SplashScreen from './src/screens/splash';

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
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
};

export default App;
