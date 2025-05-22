// screens/WeeklyCheckInScreen.tsx
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Text, StyleSheet, TextInput, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from '../../context/Auth';
import { ScrollView } from 'react-native';

export default function WeeklyCheckInScreen({navigation}:{navigation:any}) {
  const [weight, setWeight] = useState('');
  const [feelAfterWorkout, setFeelAfterWorkout] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [weekNumber, setWeekNumber] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);


   const { authData } = useAuth(); 
  const userId = authData?.userId; 

  useEffect(() => {
    // Fetch last check-in to determine week number
    const fetchWeek = async () => {
      const doc = await firestore().collection('weeklyCheckIns').doc(userId).get();
      if (doc.exists) {
        const weeks = Object.keys(doc.data() || {});
        setWeekNumber(weeks.length + 1);
      }
    };
    fetchWeek();
  }, []);

  const handleSubmit = async () => {
    if (!weight || !feelAfterWorkout || !difficulty) {
      Alert.alert('Please complete all fields.');
      return;
    }
      setIsSubmitting(true);
    try {
      const weekKey = `week${weekNumber}`;
      const data = {
        weight,
        feelAfterWorkout,
        difficulty,
        timestamp: new Date(),
      };

      await firestore()
        .collection('weeklyCheckIns')
        .doc(userId)
        .set(
          {
            [weekKey]: firestore.FieldValue.arrayUnion(data),
          },
          { merge: true }
        );

      Alert.alert('Success', 'Check-in submitted!');
      navigation.navigate('MainTabs', {
              refresh: true,
            },{
              merge:true,
            });
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Could not submit check-in.');
    }finally{
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView>
    <ScrollView contentContainerStyle={ styles.container }
    keyboardShouldPersistTaps="handled"
    showsVerticalScrollIndicator={false}>
      <Text style={styles.weekHeader}>Week {weekNumber} Check-In</Text>

      <Text style={styles.label}>Current Weight (kg)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 55"
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
      />

      <Text style={styles.label}>How do you feel after workout?</Text>
      {['Tired', 'Just Right', 'Energetic'].map(option => (
        <TouchableOpacity
          key={option}
          style={[styles.option, feelAfterWorkout === option && styles.selected]}
          onPress={() => setFeelAfterWorkout(option)}
        >
          <Text>{option}</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.label}>How difficult was workout?</Text>
      {['Easy', 'Moderate', 'Hard'].map(option => (
        <TouchableOpacity
          key={option}
          style={[styles.option, difficulty === option && styles.selected]}
          onPress={() => setDifficulty(option)}
        >
          <Text>{option}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
          style={[styles.submitButton, isSubmitting && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Submit Check-In</Text>
          )}
        </TouchableOpacity>
    </ScrollView>
    </SafeAreaView> 
  );
}

const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: '#F3F4F6',
      padding: 20,
    },
    weekHeader: {
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 20,
      color: '#4A90E2',
    },
    label: {
      fontSize: 16,
      marginTop: 20,
      marginBottom: 10,
    },
    input: {
      backgroundColor: '#fff',
      borderRadius: 10,
      paddingHorizontal: 15,
      paddingVertical: 10,
      fontSize: 16,
      borderWidth: 1,
      borderColor: '#DDD',
    },
    option: {
      backgroundColor: '#fff',
      padding: 12,
      marginVertical: 5,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#ccc',
    },
    selected: {
      backgroundColor: '#D6EAF8',
      borderColor: '#4A90E2',
    },
    submitButton: {
      backgroundColor: '#4A90E2',
      paddingVertical: 14,
      borderRadius: 12,
      marginTop: 30,
      alignItems: 'center',
    },
    submitText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
  });
  