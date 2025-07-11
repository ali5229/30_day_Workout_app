    import { Alert, Text, View, ImageBackground,ScrollView, TouchableOpacity, StyleSheet } from "react-native";
    import firestore, { Timestamp } from '@react-native-firebase/firestore';
    import React, { useState, useEffect, useLayoutEffect } from 'react';
    import { useAuth } from "../../context/Auth";
    import asyncStorage from "@react-native-async-storage/async-storage";
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

    const Dashboard = ({route , navigation}:{route:any, navigation:any}) => {
            const { authData } = useAuth();
            const userId = authData?.userId;
            const [user, setUser] = useState<any>(null);
            const [loading, setLoading] = useState(true);
            const [exercises, setExercises] = useState<Exercise[]>([]);
            const [workoutPlan, setWorkoutPlan] = useState<WorkoutDay[]>([]);
            const [planGeneratedAt, setPlanGeneratedAt] = useState<Date | null>(null);
            const [todayWorkoutDay, setTodayWorkoutDay] = useState<number | null>(null);
            const [currentWeek, setCurrentWeek] = useState(1);
            const [weeksInMonth] = useState(4);
            
            useLayoutEffect(() => {
                navigation.setOptions({
                  tabBarStyle: loading ? { display: 'none' } : undefined,
                });
              }, [loading]);

              
            useEffect(() => {
                const fetchPlan = async()=>{

                    if (!userId) {
                        Alert.alert('Error', 'User ID missing');
                        setLoading(false);
                        return;
                    }try{
                        const localData = await asyncStorage.getItem('workoutPlan');
                        const dateString = await asyncStorage.getItem('planGeneratedAt');
                        if(localData && dateString){
                            console.log('Loaded from local storage:', localData);
                            const parsedDate = new Date(dateString);
                            setPlanGeneratedAt(parsedDate);
                            const today = new Date();
                            const diffInTime = today.getTime() - parsedDate.getTime();
                            const dayNumber = Math.min(30, Math.max(1, Math.floor(diffInTime / (1000 * 3600 * 24)) + 1));

                            if (dayNumber > 28) {
                                navigation.navigate('PlanCompleteScreen'); 
                                return;
                                }

                            setTodayWorkoutDay(dayNumber);
                            setWorkoutPlan(JSON.parse(localData));
                            setLoading(false);
                            return;
                        }
                        const userDoc = await firestore().collection('users').doc(userId).get();
                        if(userDoc.exists){
                            const userDataObj = userDoc.data();
                            setUser(userDataObj);
                            const firestoreData = userDoc.data()?.workoutPlan;
                            const planGeneratedAt = userDoc.data()?.planGeneratedAt?.toDate?.() ?? new Date();
                            if(firestoreData){
                                console.log('Loaded from Firestore:');
                                setWorkoutPlan(firestoreData);
                                setPlanGeneratedAt(planGeneratedAt);
                                const today = new Date();
                                const diffInTime = today.getTime() - planGeneratedAt.getTime();
                                const dayNumber = Math.min(30, Math.max(1, Math.floor(diffInTime / (1000 * 3600 * 24)) + 1));

                                if (dayNumber > 28) {
                                navigation.navigate('PlanCompleteScreen');
                                return;
                                }

                                setTodayWorkoutDay(dayNumber);
                                await asyncStorage.setItem('workoutPlan', JSON.stringify(firestoreData));
                                await asyncStorage.setItem('planGeneratedAt', planGeneratedAt.toISOString());
                                
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
            await asyncStorage.setItem('planGeneratedAt', new Date().toISOString());
                        await firestore().collection('users').doc(userId).set({
                            workoutPlan: monthPlan,
                            planGeneratedAt: Timestamp.now()
                        }, { merge: true });
                        setTodayWorkoutDay(1);

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
    - Equipment Availability: ${userData.gym_equipment} 
    - Has Type 2 Diabetes?: ${userData.diabetes}
    - Goal: ${userData.goal}
    - Workout Days per Week: ${userData.workoutdays}
    - Desired Rest Days per Week: ${restDaysPerWeek}

    Guidelines:
    - IMPORTANT! Ensure that each group of 7 days (i.e., each week) includes exactly ${userData.workoutdays} workout days and ${restDaysPerWeek} rest days. These should be clearly spread across the week, not consecutive.
    - Ensure for each week, workout days are not more than ${userData.workoutdays} days.
    - Use ONLY these exercises: ${exerciseNames} .
    - Format the response as a valid JSON array with 28 objects.
    - Each day format: {"day": number, "exercises": [{"name": string, "sets": number, "reps": number}]}
    - For rest days: {"day": number, "exercises": []}
    - Ensure each day has atleast 6 different exercises.
    Respond ONLY with the JSON array without any additional text, title, comment, explanation, greeting, or closing remark. Your response must begin directly with the '[' character.
    `.trim();

            const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${'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'}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    messages: [{ role: 'system', content: "The model will respond like a workout generating algorithm which is given various variables of an individual's health. Such as BMI, if the individual has type 1 diabetes, and what's the goal of the individual. Then model will generated a 28 day workout with strict json response so that the response can be integerated with an app that accepts the json responses then effectively handles responses to be able to display them in proper UI" },{ role: 'user', content: prompt }],
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
            
                if (loading) {
                    return (
                        <LottieAnimation/>
                );
            }

    return (
    <ScrollView style={styles.container}>
                <View style={styles.content}>           

            {todayWorkoutDay && (
                <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.todayCard}
                    onPress={() => {
                        const todayWorkout = workoutPlan.find(d => d.day === todayWorkoutDay);
                        if (todayWorkout) {
                                if (todayWorkout.exercises.length === 0) {
                                navigation.navigate('RestDayScreen');
                                } else {
                                navigation.navigate('WorkoutDayScreen', { day: todayWorkout, todayWorkoutDay });
                                }
                            }
                      }}
                >   <ImageBackground
                    source={require('../../assets/Images/todayWorkout.jpg')}
                    style={styles.todayBackground}
                    imageStyle={styles.backgroundImage}
                     >
                    <Text style={styles.todayTitle}>Workout of Today</Text>
                    <Text style={styles.todayText}>Day {todayWorkoutDay}</Text>
                    </ImageBackground>
                </TouchableOpacity>
            )}
            <View style={styles.weekSelector}>
                {Array.from({ length: weeksInMonth }, (_, i) => (
                    <TouchableOpacity 
                    activeOpacity={0.8}
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

            <View style={styles.weekDaysContainer}>
                    {workoutPlan
                        
                        .filter(day => Math.ceil(day.day / 7) === currentWeek)
                        .reduce((rows: any[][], day, index) => {
                             
                        if (index % 2 === 0) {
                            rows.push([day]);
                        } else {
                            rows[rows.length - 1].push(day);
                        }
                        return rows;
                        }, [])
                        .map((row, rowIndex) => (
                        <View key={rowIndex} style={styles.row}>
                            {row.map(day => ( 
                            <TouchableOpacity
                                activeOpacity={0.8}
                                key={day.day}
                                style={styles.dayCard}
                                onPress={() => 
                                    day.exercises.length === 0
                                   ? navigation.navigate('RestDayScreen')
                                   : navigation.navigate('WorkoutDayScreen', { day, todayWorkoutDay })}
                            > 
                            
                             
                             <ImageBackground
                                source={ day.exercises.length ? require('../../assets/Images/workoutDay.jpg') : require('../../assets/Images/restDay.jpg')}
                                style={styles.dayCardBackgroud}
                                imageStyle={styles.backgroundImage}>
                                <Text style={styles.dayCardTitle}>Day {day.day}</Text>
                                <Text style={styles.dayCardSubtitle}>
                                {day.exercises.length ? `${day.exercises.length} Exercises` : 'Rest Day'}
                                </Text>
                                </ImageBackground>
                            </TouchableOpacity>
                            ) )}
                        </View>
                        ))}
                    </View>

        </View>  
               
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
     header: {
         fontSize: 24,
         fontWeight: 'bold',
         marginBottom: 20,
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
    todayCard: {
        backgroundColor: '#d4f4dd',
        borderRadius: 12,
        marginBottom: 12,
        elevation: 4,
        height: 200,
        boxShadow: '10 14px 18px rgba(10, 19, 23, 0.4)',
    },
    todayBackground: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
        overflow: 'hidden',

    },
    backgroundImage:{
        opacity: 0.8,
        backgroundColor:'#000',
    },
    todayTitle: {
        fontSize: 25,
        fontWeight: 'bold',
        color: 'white',
        marginLeft: 16,
        marginTop: 16,
    },
    todayText: {
        fontSize: 20,
        marginTop: 120,
        marginLeft: 27,
        color: 'white',
    },
    weekDaysContainer: {
        marginTop: 16,
      },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
      },
    dayCard: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        marginHorizontal: 4,
        borderRadius: 12,
        elevation: 2,
        height: 300,
      },
    dayCardBackgroud:{
        width: '100%',
        height: '100%',
        borderRadius: 12,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
      },  
    dayCardTitle: {
        fontSize: 30,
        fontWeight: 'bold',
        color:'white',
      },
      
      dayCardSubtitle: {
        fontSize: 14,
        color: 'white',
        marginTop: 4,
      },
 });
 
 export default Dashboard;
