    import { Alert, Text, View, ActivityIndicator,ScrollView, TouchableOpacity, Modal, Image, StyleSheet } from "react-native";
    import firestore from '@react-native-firebase/firestore';
    import React, { useState, useEffect } from 'react';
    import { useAuth } from "../../context/Auth";
    import asyncStorage from "@react-native-async-storage/async-storage";


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
            const { authData } = useAuth();
            const userId = authData?.userId;
            console.log('The User ID is ',userId);
            const [user, setUser] = useState<any>(null);
            const [loading, setLoading] = useState(true);
            const [exercises, setExercises] = useState<Exercise[]>([]);
            const [workoutPlan, setWorkoutPlan] = useState<WorkoutDay[]>([]);
            const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
            const [modalVisible, setModalVisible] = useState(false);
            const [currentWeek, setCurrentWeek] = useState(1);
            const [weeksInMonth] = useState(4);
            
            // useEffect(() => {
            //     const initialize = async () => {
            //         if (!userId) {
            //             Alert.alert('Error', 'User ID missing');
            //             setLoading(false);
            //             return;
            //         }
            
            //         try {
            //             setWorkoutPlan([]); 
            //             const userData = await firestore().collection('users').doc(userId).get();
            //             if (userData.exists) {
            //                 const userDataObj = userData.data();
            //                 setUser(userDataObj);
                            
            //                 const exerciseList = await fetchExercises();
            //                 await generateWorkoutPlan(userDataObj, exerciseList);
            //             } else {
            //                 Alert.alert('Error', 'User Not Found');
            //             }
            //         } catch (error: any) {
            //             Alert.alert('Error', error.message);
            //         }
            //     };
            
            //     initialize();
            // }, [userId]);



            useEffect(() => {
                const fetchPlan = async()=>{

                    if (!userId) {
                        Alert.alert('Error', 'User ID missing');
                        setLoading(false);
                        return;
                    }

                    try{

                        const localData = await asyncStorage.getItem('workoutPlan');
                        if(localData){
                            console.log('Loaded from local storage:', localData);
                            setWorkoutPlan(JSON.parse(localData));
                            setLoading(false);
                            return;
                        }

                        const userDoc = await firestore().collection('users').doc(userId).get();
                        if(userDoc.exists){
                            const userDataObj = userDoc.data();
                            setUser(userDataObj);
                            const firestoreData = userDoc.data()?.workoutPlan;
                            if(firestoreData){
                                console.log('Loaded from Firestore:');
                                setWorkoutPlan(firestoreData);
                                await asyncStorage.setItem('workoutPlan', JSON.stringify(firestoreData));
                                setLoading(false);
                                return;
                            } else{
                                console.log('No workout plan found in Firestore.');
                                const exerciseList = await fetchExercises();
                                await generateWorkoutPlan(userDataObj, exerciseList);
                                setLoading(false);
                            }
                        } else{
                            Alert.alert('Error', 'User Not Found');
                        }
                        
                        setLoading(false);
                     } catch(error:any){
                        console.error('Error fetching plan:', error);
                        setLoading(false);
                    }
                };
                fetchPlan();
            }, [authData]);


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
            await asyncStorage.setItem('workoutPlan', JSON.stringify(monthPlan));
                        await firestore().collection('users').doc(userId).set({
                            workoutPlan: monthPlan
                        }, { merge: true });


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
    Generate a 28 day workout plan for a user with the following profile:

    - Age: ${userData.age}
    - BMI: ${userData.bmi}
    - Experience: ${userData.experience}
    - Equipment: ${userData.gym_equipment} 
    - Has Type 1 Diabetes: ${userData.diabetes}
    - Goal: ${userData.goal}
    - Workout Days per Week: ${userData.workoutdays}
    - Desired Rest Days per Week: ${restDaysPerWeek}

    Guidelines:
    - IMPORTANT! Ensure that each group of 7 days (i.e., each week) includes exactly ${userData.workoutdays} workout days and ${restDaysPerWeek} rest days. These should be clearly spread across the week, not consecutive.
    - Ensure for each week, workout days are not more than ${userData.workoutdays} days.
    - Use ONLY these exercises: Lateral Neck Flexion, Neck Retraction Stretch, Lying Triceps Extension, Close Grid Pushups, Judo Pushups, Overhead Tricep Stretch, Tricep Kickbacks, Tricep Extension, Overhead Tricep Extension, Dips Machine, Skull Crushers, Tricep Extension With Rope, Suspended Neck Flexion, Weighted Bench Dip, Barbell Reverse Curls, Cable Hammer Curl, Cable Reverse Curls, Barbell Wrist Curl, Dumbbell Wrist Curl, Seated Wrist Flexor Stretch, Kneeling Wrist Flexor Stretch, Seated Wrist Extensor Stretch, Kneeling Wrist Extensor Stretch, Suspended Lateral Neck Flexion, Dumbbell Reverse Wrist Curl, Barbell Reverse Wrist Curl, 90 Lat Stretch, Bent Over Row, Glute Bridge Single Leg Progression, High Row, Incline Reverse Fly, Reverse Fly, Seated High Back Row, Seated Lat Pulldown, Cable Neck Extension, Seated Row, Single Arm Row, Upward Facing Dog, Dumbbell Bentover Row, Smith Bentover Row, Deadlift, T Bar Bentover Row, Russian Twist, Mountain Climber, Abdominal Crunches, Lever Neck Extension, Plank, Heel Touch, Leg Raises, Cobra Stretch, Supine Lumber Twist Left and Right, Butt Bridge, Bicycle Crunches, Flutter Kicks, Toe Touches, Side Plank Left and Right, Weighted Seated Neck Extension, Sit Ups, Cable Woodchoppers, Skill Row, Abdominal Crunch Machine, Crunch Bench, Decline Bench Situp and Twist, Hanging Leg Raises, Bodyweight Squat, Side Lying Leg Lift Left and Right, Backward Lunge, Band Resistive Neck Retraction, Donkey Kicks, Jump Squats, Calf Raises, Fire Hydrants, Pistol Squats, Sealed Leg Curl, Lying Leg Curl, Rear Leg Extension, Leg Press, Dumbbell Squats, Wall Rear Neck Bridge, Dumbbell Jump Squats, Dumbbell Plie Squat, Barbell Back Squat, Alternate Leg Push Off, Box Jumps, Forward Lunge, Goblet Squat, Kneeling Hip Flexor Stretch, Leg Crossover Stretch, Supine Hamstring Stretch, Isometric Lying Neck Bridge, Neck Extensor Stretch, Neck Flexion and Extension, Suspended Neck Extension, Arm Raises, Side Arm Raise, Rhomboid Pulls, Knee Pushup, Arm Scissors, Prone Tricep Pushup, Childs Pose, Reclined Rhomboid Squeezes, Incline Pushups, Cable Neck Flexion, Hover Pushups, Swimmer and Superman, Hyperextension, Pike Pushup, Supine Pushup, Floor Y Raises, Chin Ups, Pull Ups, Barbell Bent Over Rows, Seated Rows, Lever Neck Flexion, Shrugs, Dumbbell Lateral Raise, Dumbbell Front Raise, Reverse Snow Angels, Barbell Front Raise, Cable Seated Front Raise, Cable Standing  Shoulder Press, Dumbbell Shoulder Press, Lever Reclined Shoulder Press, Lever Shoulder Press, Weighted Neck Flexion, Smith Shoulder Press, Suspended Front Raise, Doorway Front Deltoid Stretch, Wall Front Deltoid Stretch, Cable Lateral Raise, Stretch Side Deltoid, Barbell Rear Delt Row, Cable Reverse Fly, Rear Deltoid Stretch, Pushups, Weighted Lateral Neck Flexion, Wide Arm Pushup, Hindu Pushup, Rotation Pushups, Decline Pushup, Burpees, Staggered Pushups, Box Pushup, Plyometric Pushup, Bench Press, Close Grip Bench Press, Lever Lateral Neck Flexion, Incline Bench Press, Cable Press, Decline Cable Press, Incline Cable Press, Chest Cable Fly, Incline Chest Cable Fly, Decline Chest Cable Fly, Supine Snow Angel, Dumbbell Chest Press, Dumbbell Incline Chest Press, Wall Front Neck Bridge, Dumbbell Decline Chest Press, Chest Fly, Arm Circles, Diamond Pushup, Diagonal Plank, Wide Lifted Bicep Curl, Shoulder Tap Bicep Curl, Shoulder Tap To Reach Overhead, Plank Shoulder Tap, Wall Handstand, Wall Side Neck Bridge, Dumbbell Concentration Curls, Hammer Curls, EZ Bar Curls, Preacher Curls, High Cable Bicep Curl, Reverse Grip Barbell Row, Incline Curls, Barbell Concentration Curls, Dumbbell Curl, Tricep Dips.
    - Format the response as a valid JSON array with 28 objects.
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
                    messages: [{ role: 'system', content: "The model will respond like a workout generating algorithem who is given various variables of an individual's health. Such as BMI, if the individual has type 1 diabetes, and what's the goal of the individual. Then model will generated a 30 day workout with strict json response so that the response can be integerated with an app that accepts the json responses then effectively handles responses to be able to display them in proper UI" },{ role: 'user', content: prompt }],
                    temperature: 0.7,
                    max_tokens: 4000,
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
            console.log('Month Plan:', monthPlan);

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
