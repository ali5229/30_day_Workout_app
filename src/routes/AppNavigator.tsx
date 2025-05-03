import React from 'react';
import { Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/Home/HomeScreen';
import FeedbackScreen from '../screens/Feedback/FeedbackScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: '#fff' },
        tabBarLabelStyle: { fontSize: 12 },
        tabBarIcon: ({ focused, size }) => {
          let iconSource;

          switch (route.name) {
            case 'Workout':
              iconSource = focused
                ? require('../assets/Images/plan3.png')
                : require('../assets/Images/plan-inactive.png');
              break;
            case 'Feedback':
              iconSource = focused
                ? require('../assets/Images/feedback2-active.png')
                : require('../assets/Images/feedback2-inactive.png');
              break;
            case 'Profile':
              iconSource = focused
                ? require('../assets/Images/user-active2.png')
                : require('../assets/Images/user-inactive.png');
              break;
          }

          return (
            <Image
              source={iconSource}
              style={{
                width: focused ? size + 6 : size,
                height: focused ? size + 6 : size,
                resizeMode: 'contain',
              }}
            />
          );
        },
        tabBarActiveTintColor: 'black',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Workout" component={HomeScreen} />
      <Tab.Screen name="Feedback" component={FeedbackScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
