import { Alert, Text, View, ActivityIndicator,ScrollView, TouchableOpacity, Modal, Image, StyleSheet } from "react-native";
import firestore from '@react-native-firebase/firestore';
import React, { useState, useEffect } from 'react';

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



const Dashboard = ({route}:{route:any}) => {
     const userId = route.params.userId;
        const [user, setUser] = useState<any>(null);
        const [loading, setLoading] = useState(true);
        const [exercises, setExercises] = useState<Exercise[]>([]);
        const [workoutPlan, setWorkoutPlan] = useState<WorkoutDay[]>([]);
        const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
        const [modalVisible, setModalVisible] = useState(false);
        const [currentWeek, setCurrentWeek] = useState(1);
    const [weeksInMonth] = useState(4);

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

        const generateWorkoutPlan = async (userData: any, exerciseList: Exercise[]) => {
    try {
        setLoading(true);
        const monthPlan = await generateMonthlyPlan(userData, exerciseList);
        setWorkoutPlan(monthPlan);
    } catch (error) {
        console.error('Error in generateWorkoutPlan:', error);
        Alert.alert('Error', 'Failed to generate workout plan');
    } finally {
        setLoading(false);
    }
};

        const generateMonthlyPlan = async (userData: any, exerciseList: Exercise[]) => {
    try {
        const exerciseNames = exerciseList.map(e => e.name).join(', ');
        const totalDays = 30;
        const restDaysPerWeek = 7-userData.workoutdays;
    

        const prompt = `
Generate a 30-day workout plan for a user with the following profile:

- Age: ${userData.age}
- Experience: ${userData.experience}
- Equipment: ${userData.gym_equipment}
- Has Type 1 Diabetes: ${userData.diabetes}
- Goal: ${userData.goal}
- Workout Days per Week: ${userData.workoutdays}
- Desired Rest Days per Week: ${restDaysPerWeek}

Guidelines:
- Spread the ${restDaysPerWeek} rest days evenly across the each week in multiple weeks.
- Ensure that ${restDaysPerWeek} are not consecutive.
- Use ONLY these exercises: ${exerciseNames}
- Format the response as a valid JSON array with 30 objects.
- Each day format: {"day": number, "exercises": [{"name": string, "sets": number, "reps": number}]}
- For rest days: {"day": number, "exercises": []}
- Ensure each day has atleast 6 different exercises.
- Return ONLY the JSON array. DO NOT add code blocks, explanations, or markdown formatting.
`.trim();

        const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${'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'}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 4000,
            }),
        });

        const data = await res.json();
        if (!data.choices?.[0]?.message?.content) throw new Error('Empty response');

        let content = data.choices[0].message.content.trim();

        // Clean extra formatting
        content = content.replace(/```json\n?|```\n?/g, '');

        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error('No valid JSON array found');

        const monthPlan = JSON.parse(jsonMatch[0]);

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
    }
};
 
        

        useEffect(() => {
            const initialize = async () => {
                if (!userId) {
                    Alert.alert('Error', 'User ID missing');
                    setLoading(false);
                    return;
                }
        
                try {
                    setWorkoutPlan([]); // Clear existing plan
                    const userData = await firestore().collection('users').doc(userId).get();
                    if (userData.exists) {
                        const userDataObj = userData.data();
                        setUser(userDataObj);
                        
                        const exerciseList = await fetchExercises();
                        await generateWorkoutPlan(userDataObj, exerciseList);
                    } else {
                        Alert.alert('Error', 'User Not Found');
                    }
                } catch (error: any) {
                    Alert.alert('Error', error.message);
                }
            };
        
            initialize();
        }, [userId]);
        
            const handleExercisePress = (exerciseName: string) => {
                const exercise = exercises.find(e => e.name === exerciseName);
                if (exercise) {
                    setSelectedExercise(exercise);
                    setModalVisible(true);
                }
            };
        
            if (loading) {
                return (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#0000ff" />
                    </View>
                );
            }

  return (
<ScrollView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.header}>30-Day Workout Plan</Text>
                
                {/* Week selector */}
                <View style={styles.weekSelector}>
                    {Array.from({length: weeksInMonth}, (_, i) => (
                        <TouchableOpacity 
                            key={i}
                            style={[
                                styles.weekButton,
                                currentWeek === i + 1 && styles.selectedWeek
                            ]}
                            onPress={() => setCurrentWeek(i + 1)}
                        >
                            <Text style={styles.weekButtonText}>Week {i + 1}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Display workout days for current week */}
                {workoutPlan
                    .filter(day => 
                        Math.ceil(day.day / 7) === currentWeek
                    )
                    .map((day) => (
                        <View key={day.day} style={styles.dayContainer}>
                            <Text style={styles.dayHeader}>Day {day.day}</Text>
                            {day.exercises && day.exercises.length > 0 ? (
                                day.exercises.map((exercise, index) => (
                                    <TouchableOpacity 
                                        key={index}
                                        style={styles.exerciseItem}
                                        onPress={() => handleExercisePress(exercise.name)}
                                    >
                                        <Text style={styles.exerciseName}>{exercise.name}</Text>
                                        <Text>Sets: {exercise.sets} | Reps: {exercise.reps}</Text>
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <Text style={styles.restDay}>Rest Day</Text>
                            )}
                        </View>
                    ))
                }
            </View> 
             <Modal
                 visible={modalVisible}
                 transparent={true}
                 animationType="slide"
                 onRequestClose={() => setModalVisible(false)}
             >
                 <View style={styles.modalContainer}>
                     <View style={styles.modalContent}>
                         <TouchableOpacity 
                             style={styles.closeButton}
                             onPress={() => setModalVisible(false)}
                         >
                             <Text style={styles.closeButtonText}>×</Text>
                         </TouchableOpacity>
                         {selectedExercise && (
                             <>
                                 <Text style={styles.modalTitle}>{selectedExercise.name}</Text>
                                 <Text style={styles.description}>
                                     {selectedExercise.instruction}
                                 </Text>
                             </>
                         )}
                     </View>
                 </View>
             </Modal>
         </ScrollView>
     );
 };
 
 const styles = StyleSheet.create({
     container: {
         flex: 1,
         backgroundColor: '#f5f5f5',
     },
     content: {
         padding: 16,
     },
     loadingContainer: {
         flex: 1,
         justifyContent: 'center',
         alignItems: 'center',
     },
     header: {
         fontSize: 24,
         fontWeight: 'bold',
         marginBottom: 20,
     },
     dayContainer: {
         marginBottom: 20,
         backgroundColor: 'white',
         padding: 16,
         borderRadius: 8,
         elevation: 2,
     },
     dayHeader: {
         fontSize: 18,
         fontWeight: 'bold',
         marginBottom: 10,
     },
     exerciseItem: {
         padding: 12,
         borderBottomWidth: 1,
         borderBottomColor: '#eee',
     },
     exerciseName: {
         fontSize: 16,
         fontWeight: '500',
     },
     modalContainer: {
         flex: 1,
         justifyContent: 'center',
         alignItems: 'center',
         backgroundColor: 'rgba(0,0,0,0.5)',
     },
     modalContent: {
         width: '90%',
         backgroundColor: 'white',
         borderRadius: 10,
         padding: 20,
         maxHeight: '80%',
     },
     modalTitle: {
         fontSize: 20,
         fontWeight: 'bold',
         marginBottom: 15,
     },
     exerciseGif: {
         width: '100%',
         height: 200,
         marginBottom: 15,
     },
     description: {
         fontSize: 16,
         lineHeight: 24,
     },
     closeButton: {
         position: 'absolute',
         right: 10,
         top: 10,
         zIndex: 1,
     },
     closeButtonText: {
         fontSize: 24,
         fontWeight: 'bold',
     },
     weekSelector: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
        flexWrap: 'wrap',
    },
    weekButton: {
        padding: 10,
        borderRadius: 8,
        backgroundColor: '#e0e0e0',
        marginVertical: 5,
    },
    selectedWeek: {
        backgroundColor: '#007AFF',
    },
    weekButtonText: {
        color: '#333',
        fontWeight: '500',
    },
    restDay: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        padding: 20,
        fontStyle: 'italic',
    },
 });
 
 export default Dashboard;
