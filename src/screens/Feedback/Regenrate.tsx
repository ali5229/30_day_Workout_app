import React, { useState } from 'react';
import { Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { useAuth } from '../../context/Auth';
import firestore, { Timestamp } from '@react-native-firebase/firestore';
import asyncStorage from '@react-native-async-storage/async-storage';
import LottieAnimation from "../../components/lottieAnimation";

 interface Exercise {
        name: string;
        instruction: string;
    }
    interface WorkoutDay {
        day: number;
        exercises: Array<{
            name: string;
            sets: number;
            reps: number;
        }>;
    }

const CalculateBmi = (weight: string, height: string): string | null => {
  const weightNum = parseFloat(weight);
  const heightNum = (parseFloat(height))/100;
  if (isNaN(weightNum) || isNaN(heightNum) || heightNum === 0) return null;
  const final_bmi = (weightNum/Math.pow(heightNum,2)).toFixed(2);
  return final_bmi;
};

const Regenerate = ({navigation}:{navigation:any}) => {
  const [difficulty, setDifficulty] = useState('');
  const [goal, setGoal] = useState('');
  const [weight, setWeight] = useState('');
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutDay[]>([]);
  const [experience, setExperience] = useState('');
  const [days, setDays] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gym_equipment, setGym_equipment] = useState<string | null>(null);
  const { authData } = useAuth();
  const [loading, setLoading] = useState(false);
  const userId = authData?.userId; 
   const [exercises, setExercises] = useState<Exercise[]>([]);


const handleSubmit = async() =>{
       if (!goal || !weight || !experience || !days || !gym_equipment || !difficulty) {
    Alert.alert("Please fill all fields.");
    return;
       }   
       
       setIsSubmitting(true);
       try{
        
       const userDoc = await firestore().collection('users').doc(userId).get();
       const data= userDoc.data();
       const height = data?.height;
       const bodyMi = CalculateBmi(weight, height);
        await firestore().collection('users').doc(userId).update({
                      bmi: bodyMi,
                      goal: goal,
                      weight: weight,
                      experience: experience,
                      workoutdays: days,
                      gym_equipment: gym_equipment,
                    });
       const localData = await asyncStorage.getItem('workoutPlan');
       setWorkoutPlan(localData ? JSON.parse(localData) : null);
       const db = firestore();
       
              try {
                  await db.collection('Workout_Logs').doc(userId).delete();
                  await db.collection('weeklyCheckIns').doc(userId).delete();
                } catch (error) {
                  console.error("Error deleting logs or check-ins:", error);
                }


       console.log("Going for regeneration");
       const userDataObj = userDoc.data();
          const exerciseList = await fetchExercises();
       const monthPlan = await regeneratePlan(exerciseList,userDataObj);     
       await asyncStorage.setItem('workoutPlan', JSON.stringify(monthPlan));
            await asyncStorage.setItem('planGeneratedAt', new Date().toISOString());
                        await firestore().collection('users').doc(userId).update({
                            workoutPlan: monthPlan,
                            planGeneratedAt: Timestamp.now()
                        });
      navigation.navigate('MainTabs', { refresh: true });
       

       }catch(error){
           console.error("Regenerate Error:", error);
       } finally{
          setIsSubmitting(false);
       }

 }

   const fetchExercises = async () => {
                 try {
                     const exercisesSnapshot = await firestore().collection('Exercise_Database').get();
                     const exercisesList: Exercise[] = [];
                     
                     for (const doc of exercisesSnapshot.docs) {
                         const exercise = doc.data() as Exercise;
                         exercisesList.push({ ...exercise});
                     }
                     
                     setExercises(exercisesList);
                     return exercisesList;
                 } catch (error: any) {
                     Alert.alert('Error', 'Failed to fetch exercises');
                     return [];
                 }
             };






 const regeneratePlan = async( exerciseList: Exercise[],userData: any)=>{
   setLoading(true)
   console.log('trying regenration')
  try {
               const exerciseNames = exerciseList.map(e => e.name).join(', ');
              const restDaysPerWeek = 7-userData.workoutdays;
              const prompt = `
      Regenerate the following 28 day workout plan for a user with the following profile:
      
      - Age: ${userData.age}
      - BMI: ${userData.bmi}
      - Experience: ${userData.experience}
      - Gym Equipment Availability: ${userData.gym_equipment} 
      - Has Type 2 Diabetes?: ${userData.diabetes}
      - Goal: ${userData.goal}
      - Workout Days per Week: ${userData.workoutdays}
      - Desired Rest Days per Week: ${restDaysPerWeek}
  
      Guidelines:
      - IMPORTANT! Ensure that each group of 7 days (i.e., each week) includes exactly ${userData.workoutdays} workout days and ${restDaysPerWeek} rest days. These should be clearly spread across the week, not consecutive.
    - Ensure for each week, workout days are not more than ${userData.workoutdays} days.
     - Use ONLY these exercises: ${exerciseNames} .
      - If Gym Equipment Availability: No , Don't give exercises requiring any equipments.
      - Format the response as a valid JSON array with 28 objects.
      - Each day format: {"day": number, "exercises": [{"name": string, "sets": number, "reps": number}]}
      - For rest days: {"day": number, "exercises": []}
      - Ensure each day has atleast 6 different exercises.
      Respond ONLY with the JSON array without any additional text, title, comment, explanation, greeting, or closing remark. Your response must begin directly with the '[' character.
      `.trim();
  
              const res = await fetch('https://api.openai.com/v1/chat/completions', {
                  method: 'POST',
                  headers: {
                      'Authorization': `Bearer ${'API KEY'}`,
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                      model: 'gpt-4o',
                      messages: [{ role: 'system', content: "The model will respond like a workout generating algorithm which previously gave user a workout plan, and now user wants to change it given various variables of an individual's health. Such as BMI, if the individual has type 1 diabetes, and what's the goal of the individual. Then model will generated a 28 day workout with strict json response so that the response can be integerated with an app that accepts the json responses then effectively handles responses to be able to display them in proper UI" },{ role: 'user', content: prompt }],
                      temperature: 0.2,
                      max_tokens: 4096,
                  }),
              });
              
              const data = await res.json();
              console.log('Full OpenAI API Response:', data);
              if (!data.choices?.[0]?.message?.content) throw new Error('Empty response');
  
              let content = data.choices[0].message.content.trim();
  
              content = content.replace(/```json\n?|```\n?/g, '');
  
              const jsonMatch = content.match(/\[[\s\S]*\]/);
              if (!jsonMatch) throw new Error('No valid JSON array found');
  
              const monthPlan = JSON.parse(jsonMatch[0]);
              console.log('Month Plan:', JSON.stringify(monthPlan));
  
              if (!Array.isArray(monthPlan)) throw new Error('Response is not an array');
  
              return monthPlan.map((day: any, index: number) => ({
                  ...day,
                  day: index + 1,
                  exercises: Array.isArray(day.exercises) ? day.exercises : []
              }));
          } catch (error) {
              console.error('Error generating monthly plan:', error);
              Alert.alert('Error', 'Failed to generate monthly workout plan');
              return Array.from({ length: 30 }, (_, i) => ({
                  day: i + 1,
                  exercises: [],
              }));
          }finally{
            setLoading(false);
          }
 };




       if (loading) {
                          return (
                              <LottieAnimation/>
                      );
                  }



  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>1. Current Plan Difficulty</Text>
      <RNPickerSelect
        onValueChange={value => setDifficulty(value)}
        items={[
          { label: 'Too Easy', value: 'too_easy' },
          { label: 'Balanced', value: 'balanced' },
          { label: 'Too Hard', value: 'too_hard' },
        ]}
        placeholder={{ label: 'Select difficulty...', value: null }}
        style={pickerSelectStyles}
        value={difficulty}
      />

      <Text style={styles.label}>2. New Goal</Text>
      <RNPickerSelect
        onValueChange={value => setGoal(value)}
        items={[
          { label: 'Lose Weight', value: 'Lose Weight' },
           { label: 'Gain Muscle', value: 'Gain Muscle'},
          { label: 'Remain Fit',  value: 'Remain Fit'},
        ]}
        placeholder={{ label: 'Select goal...', value: null }}
        style={pickerSelectStyles}
        value={goal}
      />

      <Text style={styles.label}>3. Enter Your Current Weight (kg)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="e.g. 54"
        value={weight}
        onChangeText={setWeight}
      />

      <Text style={styles.label}>4. Experience Level</Text>
      <RNPickerSelect
        onValueChange={value => setExperience(value)}
        items={[
          { label: 'Beginner', value: 'Beginner' },
          { label: 'Intermediate', value: 'Intermediate' },
          { label: 'Advanced', value: 'Advanced' },
        ]}
        placeholder={{ label: 'Select level...', value: null }}
        style={pickerSelectStyles}
        value={experience}
      />

      <Text style={styles.label}>5. Workout Days per Week</Text>
      <RNPickerSelect
        onValueChange={value => setDays(value)}
        items={[
          { label: 'Three', value: '3' },
          { label: 'Four', value: '4' },
          { label: 'Five', value: '5' },
          { label: 'Six', value: '6' },
        ]}
        placeholder={{ label: 'Select days...', value: null }}
        style={pickerSelectStyles}
        value={days}
      />

      <Text style={styles.label}>Do you have access to a Gym?</Text>
      <RNPickerSelect
        onValueChange={(value) => setGym_equipment(value)}
        items={[
              { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
        ]}
        value={gym_equipment}
        placeholder={{ label: 'Select an option', value: null }}
        style={pickerSelectStyles}
      />
      <TouchableOpacity
                style={[styles.submitButton, isSubmitting && { opacity: 0.7 }]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitText}>Regenerate</Text>
                )}
              </TouchableOpacity>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  label: {
    fontSize: 16,
    marginTop: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
  },
    submitButton: {
      backgroundColor: '#4A90E2',
      paddingVertical: 14,
      borderRadius: 12,
      marginTop: 50,
      alignItems: 'center',
    },
    submitText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
});

const pickerSelectStyles = {
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30,
    marginTop: 8,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30,
    marginTop: 8,
  },
};

export default Regenerate;
