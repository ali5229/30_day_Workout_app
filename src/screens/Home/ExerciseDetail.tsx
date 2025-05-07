import React, { useEffect, useState } from 'react';
import { View, Text,Image, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Video } from 'react-native-video';
import { getFirestore, collection, query, where, getDocs,doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import {app} from '../../firebase/firebaseConfig';
import { useAuth } from '../../context/Auth';

export default function ExerciseDetailScreen({ route, navigation }: { route: any, navigation: any }) {

  const { exercise, index, day, todayWorkoutDay } = route.params as any;
  const isFirst = index === 0;
  const isLast = index === day.exercises.length - 1;
  const { authData } = useAuth();
  const userId = authData?.userId;
  const [instruction, setInstruction] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [markStatus, setMarkStatus] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
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
        if(!userId) return;
        const logRef = doc(db, 'Workout_Logs', userId);
        const logSnap = await getDoc(logRef);
        const dayKey = `day${day.day}`;
        if (logSnap.exists()) {
          const logData = logSnap.data();
          if (logData[dayKey] === 'Completed') {
            setMarkStatus(true);
          }
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
      todayWorkoutDay
    });
  };

  const addWorkout = async ()=>{
    setSaving(true);
      if(!userId) return;
      try{
        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);

        if(userDocSnap.exists()){
            const userData = userDocSnap.data();
            const currentCount = userData.workoutsCompleted || 0;
            await updateDoc(userDocRef,{
              workoutsCompleted: currentCount + 1 
            });
        } else{
          await setDoc(userDocRef, {
            workoutsCompleted : 1
          }, {merge:true})
        }
        const logRef = doc(db, 'Workout_Logs', userId);
        const logSnap = await getDoc(logRef);
        const dayKey = `day${day.day}`;
        if(logSnap.exists()){
          await updateDoc(logRef,{
              [dayKey]:'Completed'
          });
        } else{
          await setDoc(logRef,{
            userId,
            [dayKey]: 'Completed'
          });
        }
        Alert.alert("Success","Workout marked as completed.")
        
      } catch(error){
        console.error("Unable to save workout", error);
        Alert.alert("Error","Failed To mark workout as done")
      }
      setMarkStatus(true);
      setSaving(false);
  }


  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="blue"  />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
  {/* Header */}
  <View style={styles.headerContainer}>
    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
      <Image source={require('../../assets/Images/Back.png')} style={{ width: 24, height: 24, transform: [{ rotateY: '180deg' }] }} />
    </TouchableOpacity>
    <Text style={styles.headerText}>{exercise.name}</Text>
  </View>

  {/* Video Section */}
  <View style={styles.videoCard}>
    {videoUrl ? (
      <Video
        source={{ uri: videoUrl }}
        style={styles.video}
        resizeMode="cover"
        repeat
        muted
      />
    ) : (
      <Text style={styles.noVideoText}>No video available</Text>
    )}
  </View>

  {/* Info Section */}
  <View style={ { flex:1, flexDirection: 'row', justifyContent:'space-evenly'}}>
  <View style={styles.statsCard}>
    <Image source={require('../../assets/Images/sets.png')} style={{ width: 40, height: 40, marginRight: 8 }} />
    <Text style={styles.statsText}>{exercise.sets} Sets</Text>
  </View>
  <View style={styles.statsCard}>
    <Image source={require('../../assets/Images/reps.png')} style={{ width: 40, height: 40, marginRight: 8 }} />
    <Text style={styles.statsText}>{exercise.reps} Reps</Text>
  </View>
  </View>
  {/* Instructions */}
  <View style={styles.instructionCard}>
    <Text style={styles.sectionTitle}>How to Perform</Text>
    <Text style={styles.instructionText}>{instruction}</Text>
  </View>

  {/* Navigation */}
  <View style={styles.navContainer}>
    {!isFirst && (
      <TouchableOpacity onPress={() => goToExercise('previous')} style={styles.navButton}>
        <Image source={require('../../assets/Images/Next.png')} style={{ width: 20, height: 20, transform: [{ rotateY: '180deg' }] }} />
        <Text style={styles.navButtonText}>Previous</Text>
      </TouchableOpacity>
    )}
    {!isLast ? (
  <TouchableOpacity onPress={() => goToExercise('next')} style={styles.navButton}>
    <Text style={styles.navButtonText}>Next</Text>
    <Image source={require('../../assets/Images/Next.png')} style={{ width: 20, height: 20 }} />
      </TouchableOpacity>
        ) : todayWorkoutDay==day.day ? (
          markStatus ? (
            <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.navButtonDone, { backgroundColor: 'blue', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}>
              <Text style={[styles.navButtonText, { color: 'white', marginRight: 8 }]}>Completed</Text>
              <Image source={require('../../assets/Images/tick2.png')} style={{ width: 30, height: 30 }} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => addWorkout()} style={styles.navButtonDone} disabled={saving}>{saving ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text style={styles.navButtonText}>Mark Done</Text>
                <Image source={require('../../assets/Images/tick2.png')} style={{ width: 30, height: 30 }} />
              </>
            )}
            </TouchableOpacity>
          )
) : null}
  </View>
</ScrollView>

  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F7F9FC',
    flexGrow: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 12,
  },
  headerText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
  },
  videoCard: {
    overflow: 'hidden',
    elevation: 3,
    marginBottom: 20,
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: 260,
  },
  noVideoText: {
    color: '#fff',
    padding: 20,
    textAlign: 'center',
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    
    alignSelf: 'center',
    marginBottom: 20,
  },
  statsText: {
    color: '#fff',
    padding: 15,
    backgroundColor: '#3C91E6',
    fontSize: 18,
    elevation: 5,
    fontWeight: 'bold',
  },
  instructionCard: {
    backgroundColor: '#087E8B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  instructionText: {
    color: '#E0F7FA',
    fontSize: 16,
    lineHeight: 24,
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#087E8B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    width: '45%',
    justifyContent: 'space-evenly',
    elevation: 2,
  },
  navButtonDone: {

    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#86CD82',
    paddingHorizontal: 20,
    borderRadius: 30,
    width: '45%',
    justifyContent: 'space-evenly',
    elevation: 2,
  },

  navButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
