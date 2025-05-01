import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/Home/HomeScreen';
import WorkoutDayScreen from '../screens/Home/WorkoutDay';
import ExerciseDetailScreen from '../screens/Home/ExerciseDetail';

const Stack = createNativeStackNavigator();

export const  AppStack = () => {
    return (
        <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen name="HomeScreen" component={HomeScreen} />
            <Stack.Screen name="WorkoutDayScreen" component={WorkoutDayScreen} />
            <Stack.Screen name="ExerciseDetailScreen" component={ExerciseDetailScreen} />
        </Stack.Navigator>
    )
}