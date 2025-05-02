import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image,ImageBackground } from 'react-native';

export default function WorkoutDayScreen({ route, navigation }: { route: any, navigation: any }) {
  const { day } = route.params;

  return (
    <ScrollView style={styles.container}>
      <View style={{flex:1, flexDirection:'row'}}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Image source={require('../../assets/Images/Back.png')} style={styles.previousBtn} ></Image>
      </TouchableOpacity>
      <Text style={styles.header}>Day {day.day}</Text>
      </View>

      {day.exercises.length ? (
        day.exercises.map((exercise: {
          name: string;
          sets: number;
          reps: number;
          instruction: string;
          videoUrl?: string; // optional if not all have video
        }, index: number) => (
          <TouchableOpacity
            activeOpacity={0.7}
            key={index}
            style={styles.exerciseCard}
            onPress={() => navigation.navigate('ExerciseDetailScreen', {
              exercise,
              index,
              day,
            })}
          > <ImageBackground
            source={require('../../assets/Images/exerciseCard.jpg')} 
            style={styles.exerciseCardImg} 
            imageStyle={styles.exerciseCardImgImage}>
            <Text style={styles.exerciseTitle}>{exercise.name}</Text>
            <Text style={styles.exerciseNum}>Sets: {exercise.sets} | Reps: {exercise.reps}</Text>
            <Text style={styles.instructions}>{exercise.instruction}</Text>
            </ImageBackground>
          </TouchableOpacity>
        ))
      ) : (
        <Text style={styles.restText}>This is a Rest Day</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    padding: 16, backgroundColor: '#fff', flex: 1, },
  backButton: { marginBottom: 12 , flexDirection: 'row', alignItems: 'center' },
  previousBtn: { width: 30, height: 30, marginRight: 8 , transform: [{ rotateY: '180deg' }] },
  backText: { fontSize: 16, color: '#007AFF' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  exerciseCard: {
    backgroundColor: '#e0f7fa',
    marginBottom: 10,
    borderRadius: 8,
    height: 150,
  },
  exerciseCardImg: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  exerciseCardImgImage:{
    opacity: 0.8,
    backgroundColor:'#000',
  },
  exerciseTitle: { fontSize: 20, fontWeight: 'bold', color: 'white',marginLeft: 10, marginTop: 10 },
  instructions: { marginTop: 4, color: 'white' },
  restText: { fontSize: 16, fontStyle: 'italic', color: 'white' },
  exerciseNum:{
    fontSize: 14,
    color: 'white',
    marginTop: 80,
    marginLeft: 220,
  }
});
