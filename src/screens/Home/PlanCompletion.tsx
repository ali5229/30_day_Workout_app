import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import firestore, { Timestamp } from '@react-native-firebase/firestore';
import { useAuth } from '../../context/Auth';
import asyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';

const PlanCompleteScreen = ({ navigation }: { navigation: any }) => {
  const { authData } = useAuth();
  const userId = authData?.userId;

  const handleRepeatPlan = async () => {
    firestore().collection('users').doc(userId).update({
      planGeneratedAt: Timestamp.now(),
    });

    const db = firestore();
    try {
      await db.collection('Workout_Logs').doc(userId).delete();
      await db.collection('weeklyCheckIns').doc(userId).delete();
    } catch (error) {
      console.error("Error deleting logs or check-ins:", error);
    }

    await asyncStorage.setItem('planGeneratedAt', new Date().toISOString());
    navigation.navigate('MainTabs');
  };

  const handleGenerateNew = () => {
    navigation.navigate('RegenerateScreen');
  };

  return (
    <View style={styles.container}>
      <LottieView
              source={require('../../assets/Animations/plan_complete.json')}
              autoPlay
              loop
              style={styles.lottie}
            />
      
      <Text style={styles.title}>🎉 Plan Complete!</Text>
      <Text style={styles.subtitle}>Your current plan is finished.</Text>

      <TouchableOpacity style={styles.buttonPrimary} onPress={handleRepeatPlan}>
        <Text style={styles.buttonText}>🔁 Repeat Same Plan</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonSecondary} onPress={handleGenerateNew}>
        <Text style={styles.buttonText}>✨ Generate New Plan</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PlanCompleteScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6fc',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2d2d2d',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 30,
  },
  buttonPrimary: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    marginBottom: 16,
    width: '80%',
    alignItems: 'center',
    elevation: 2,
  },
  buttonSecondary: {
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    width: '80%',
    alignItems: 'center',
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  lottie:{
    width: 200,
    height: 200,
    marginBottom: 80,
  },
});
