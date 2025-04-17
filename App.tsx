//VN2305890305044
import React, { useState, useEffect } from 'react';
import SplashScreen from './src/screens/splash';
import { NavigationContainer } from '@react-navigation/native';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/firebase/firebaseConfig';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import Signin from './src/screens/auth/Signin';
import Register from './src/screens/auth/Register';
import HomeScreen from './src/screens/Home/HomeScreen';
import GoalSelection from './src/screens/auth/GoalSelection';

const stack = createNativeStackNavigator();
    
const App = () => {

    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [splashVisible, setSplashVisible] = useState(true);

    useEffect(() => {
        const splashTimer = setTimeout(() => {
          setSplashVisible(false);
        }, 2000);
    
        return () => clearTimeout(splashTimer);
      }, []);


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
            } else {
                setUser(null);
            }
            if (initializing) setInitializing(false);
        });
        return unsubscribe;
    }, [initializing]);

    if (splashVisible) {
        return <SplashScreen />;
      }
      
    if (initializing) {

        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <stack.Navigator>
                {user ? (
                    
                    <>
                    <stack.Screen 
                            name="GoalSelection" 
                            component={GoalSelection}
                            initialParams={{userId: null, bmi:null}} 
                            options={{headerShown: false}} />
                        <stack.Screen name="HomeScreen" component={HomeScreen}
                            initialParams={{userId:null}}
                            options={{headerShown: false}}/>
                    </>
                ) : (
                    <>
                        <stack.Screen name="SignInScreen" component={Signin} options={{headerShown: false}} />
                        <stack.Screen name="RegisterScreen" component={Register} options={{headerShown: false}} />
                        

                    </>
                    
                )}
            </stack.Navigator>
        </NavigationContainer>
    );
};

export default App;