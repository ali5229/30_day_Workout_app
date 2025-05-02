import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ImageBackground } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { useAuth } from '../../context/Auth';


const GoalSelection = ({route , navigation}:{route:any, navigation:any}) => {
  const { userData, bmi } = route.params || {};
  const { userId } = userData || {};
  const [goal,setGoal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { setAuthData } = useAuth();
  const recommendGoal = (bmi:number) => {
    if(bmi < 18.5) return 'Gain Muscle';  
    else if (bmi >=18.5 && bmi <=24.9 ) return 'Remain Fit';
    else return 'Lose Weight';
  }

  const recommendedGoal = bmi ? recommendGoal(parseFloat(bmi)) : 'N/A';

  const goalOptions = [
    { label: 'Lose Weight', value: 'Lose Weight' },
    { label: 'Gain Muscle', value: 'Gain Muscle'},
    { label: 'Remain Fit',  value: 'Remain Fit'},
  ]

  const saveGoal = async() =>{
    setLoading(true);
    if(!goal){
      Alert.alert('Error', 'Please Select a Goal');
      setLoading(false);
      return;
    }
     try{
      await updateDoc(doc(db, 'users', userId),{
        goal, bmi
      });

      setAuthData({
        userId,
      });
       
     } catch(error:any){
        Alert.alert('Error', error.message);
     } finally{
        setLoading(false);
     }
  };


  return (
    <ImageBackground source={require('../../assets/Images/RegisterScreen.jpg')} style={styles.container}>
      <Text style={styles.title}>Select Your Goal</Text>
      <Text style={styles.subtitle}>Your BMI: {bmi}</Text>
      <Text style={styles.subtitle}>Recomended Goal : {recommendedGoal}</Text>

      <RNPickerSelect
        onValueChange={(value) =>setGoal(value)}
        items= {goalOptions}
        value= {goal}
        placeholder={{ label:'Select A Goal', value: null}}
        style={pickerSelectStyles}
      />
    {loading ? (
      <TouchableOpacity style= {styles.button}>
      <Text style={styles.buttonText}><ActivityIndicator size="large" color="#fff" /></Text>
    </TouchableOpacity>
         
    ):(

      <TouchableOpacity style= {styles.button} onPress={saveGoal}>
        <Text style={styles.buttonText}>Confirm Goal</Text>
      </TouchableOpacity>
    )}
    </ImageBackground>
  )

};

const styles = StyleSheet.create({
 
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 10,
    color: '#fff',
  },
  button: {
    width: '100%',
    height: 45,
    backgroundColor: 'transparent',
    borderColor: '#fff',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },

});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    width: '100%',
    height: 40,
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: 'transparent',
    marginBottom: 15,
    paddingHorizontal: 10,
    color: '#fff',
  },
  inputAndroid: {
    width: '100%',
    height: 50,
    borderColor: '#fff',
    borderWidth: 5,
    borderRadius: 5,
    backgroundColor: 'transparent',
    marginBottom: 15,
    paddingHorizontal: 10,
    color: '#fff',
  },

});

export default GoalSelection