import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Signin from '../screens/auth/Signin';
import Register from '../screens/auth/Register';
import GoalSelection from '../screens/auth/GoalSelection';

const Stack = createNativeStackNavigator();

export const AuthStack = () => {
    return (
        <Stack.Navigator>
           <Stack.Screen name="Signin" component={Signin} options={{headerShown: false}} />
           <Stack.Screen name="Register" component={Register} options={{headerShown: false}} />
           <Stack.Screen name="GoalSelection" component={GoalSelection} options={{headerShown: false}} />
        </Stack.Navigator>
    )

}