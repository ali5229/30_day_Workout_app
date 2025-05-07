import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WorkoutDayScreen from '../screens/Home/WorkoutDay';
import ExerciseDetailScreen from '../screens/Home/ExerciseDetail';
import MainTabNavigator from '../routes/AppNavigator';
const Stack = createNativeStackNavigator();

export const  AppStack = () => {
    return (
        <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen name="WorkoutDayScreen" component={WorkoutDayScreen} />
            <Stack.Screen name="ExerciseDetailScreen" component={ExerciseDetailScreen} />

        </Stack.Navigator>
    )
}