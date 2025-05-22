import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WorkoutDayScreen from '../screens/Home/WorkoutDay';
import ExerciseDetailScreen from '../screens/Home/ExerciseDetail';
import MainTabNavigator from '../routes/AppNavigator';
import WeeklyCheck from '../screens/Feedback/WeeklyCheck'
import PlanComplete from '../screens/Home/PlanCompletion';
import RestDay from '../screens/Home/RestDay'
import RegenerateScreen from '../screens/Feedback/Regenrate';
import FeedbackScreen from '../screens/Feedback/FeedbackScreen';

const Stack = createNativeStackNavigator();

export const  AppStack = () => {
    return (
        <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen name="WorkoutDayScreen" component={WorkoutDayScreen} />
            <Stack.Screen name="ExerciseDetailScreen" component={ExerciseDetailScreen} />
            <Stack.Screen name="RestDayScreen" component={RestDay}/>
            <Stack.Screen name='FeedbackScreen' component={FeedbackScreen}/>
            <Stack.Screen name="WeeklyCheckInScreen" component={WeeklyCheck} />
            <Stack.Screen name="RegenerateScreen" component={RegenerateScreen}/>
            <Stack.Screen name="PlanCompleteScreen" component={PlanComplete}/>

        </Stack.Navigator>
    )
}