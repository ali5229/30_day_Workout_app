//VN2305890305044
import React, { useEffect, useState } from 'react';
import {Router} from './src/routes/Router';
import {AuthProvider} from './src/context/Auth';
import SplashScreen from './src/screens/splash';
import {SafeAreaProvider,SafeAreaView} from 'react-native-safe-area-context';
import { View,Platform, StatusBar } from 'react-native';

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
                <StatusBar 
                translucent 
                backgroundColor="transparent" 
                barStyle="dark-content" 
              />
              <View style={{flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}}>
          <AuthProvider>
              <Router />
          </AuthProvider>
          </View>
          </SafeAreaView>
        </SafeAreaProvider>
        </>
  );
};


export default App;
