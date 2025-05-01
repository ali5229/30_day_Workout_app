import React, { useEffect, useState } from 'react';
import { View, Text,Image, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Video } from 'react-native-video';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import {app} from '../../firebase/firebaseConfig';

export default function ExerciseDetailScreen({ route, navigation }: { route: any, navigation: any }) {
  
  const { exercise, index, day } = route.params as any;

  const isFirst = index === 0;
  const isLast = index === day.exercises.length - 1;

  const [instruction, setInstruction] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const db = getFirestore(app);

  useEffect(() => {
    const fetchExerciseDetails = async () => {
      try {
        const q = query(
          collection(db, 'Exercise_Database'),
          where('name', '==', exercise.name)
        );

        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data();
          setInstruction(data.instruction);
          setVideoUrl(data.videoUrl);
        } else {
          console.warn(`Exercise not found in Firestore: ${exercise.name}`);
        }
      } catch (err) {
        console.error('Error fetching exercise details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExerciseDetails();
  }, [exercise.name]);

  const goToExercise = (direction: 'next' | 'previous') => {
    const newIndex = direction === 'next' ? index + 1 : index - 1;
    const newExercise = day.exercises[newIndex];
    navigation.replace('ExerciseDetailScreen', {
      exercise: newExercise,
      index: newIndex,
      day,
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Image source={require('../../assets/Images/previous.png')} style={styles.previousBtn} ></Image>
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>

      {/* Video */}
      <View style={styles.videoView}>
      {videoUrl ? (
        <Video
          source={{ uri: videoUrl }}
          style={styles.video}
          resizeMode="cover"
          repeat
          muted={false}
          controls={false}
        />
      ) : (
        <Text style={{ color: '#000' }}>No video available</Text>
      )}

      </View>

      {/* Exercise Name */}
      {/* Sets, Reps */}
      <Text style={styles.setsReps}>{exercise.sets} Sets × {exercise.reps} Reps</Text>

      {/* Instructions */}
      <View style={styles.instructionView}>
      <Text style={styles.instruction}>{instruction}</Text>
      </View>
      {/* Navigation Buttons */}
      <View style={styles.navButtonsContainer}>
      <View style={styles.navButtons}>
        {!isFirst && (
          <TouchableOpacity onPress={() => goToExercise('previous')} style={styles.navButton}>
            <Image source={require('../../assets/Images/previous.png')} style={styles.previousBtn} ></Image>
            <Text style={styles.navButtonText}> Previous</Text>
          </TouchableOpacity>
        )}
        {!isLast ? (
          <TouchableOpacity onPress={() => goToExercise('next')} style={styles.navButton}>
            <Image source={require('../../assets/Images/previous.png')} style={styles.nextBtn} ></Image>
            <Text style={styles.navButtonText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navButton}>
            <Image source={require('../../assets/Images/previous.png')} style={styles.nextBtn} ></Image>
            <Text style={styles.navButtonText}>End</Text>
          </TouchableOpacity>
        )}
      </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flexGrow: 1,
    flexDirection: 'column',
  }, 
  backButton: { marginBottom: 12 , flexDirection: 'row', alignItems: 'center' },
  previousBtn: { width: 20, height: 20, marginRight: 8 , transform: [{ rotateY: '180deg' }] },
  nextBtn: { width: 20, height: 20, marginRight: 8 },
  backText: { fontSize: 16, color: '#007AFF' },
  videoView:{
    width: '100%',
    height: 320,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: 320,
    borderRadius: 12,
    backgroundColor: '#000',
  },
  setsReps: {
    fontSize: 25,
    marginVertical: 12,
    textAlign: 'center',
  },
  instruction: {
    fontSize: 16,
    marginBottom: 24,
    color: 'white',
  },
  instructionView: {
    backgroundColor: '#087E8B',
    padding: 10,
    height: 200,
    borderRadius: 12,
    boxShadow: '0 4px 8px rgba(10, 10, 10, 0.5)',
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navButtonsContainer: {
    height: 130,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    
  },
  navButton: {
    padding: 12,
    width: '35%',
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  navButtonText: {
    color: '#fff',
  },
  endText: {
    color: '#0f0',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
});
