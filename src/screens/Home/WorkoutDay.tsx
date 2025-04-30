import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

export default function WorkoutDayScreen({route , navigation}:{route:any, navigation:any}) {
  const { day } = route.params;

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Day {day.day}</Text>

      {day.exercises.length ? (
        day.exercises.map((exercise: {
            name: string;
            sets: number;
            reps: number;
            instruction: string;
          }, index: number) => (
          <View key={index} style={styles.exerciseCard}>
            <Text style={styles.exerciseTitle}>{exercise.name}</Text>
            <Text>Sets: {exercise.sets} | Reps: {exercise.reps}</Text>
            <Text style={styles.instructions}>{exercise.instruction}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.restText}>This is a Rest Day</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff', flex: 1 },
  backButton: { marginBottom: 12 },
  backText: { fontSize: 16, color: '#007AFF' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  exerciseCard: {
    backgroundColor: '#e0f7fa',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
  },
  exerciseTitle: { fontSize: 16, fontWeight: 'bold' },
  instructions: { marginTop: 4, color: '#555' },
  restText: { fontSize: 16, fontStyle: 'italic', color: '#999' },
});
