import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
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
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Goal</Text>
      <Text style={styles.subtitle}>Your BMI: {bmi}</Text>
      <Text style={styles.subtitle}>Recomended Goal : {recommendedGoal}</Text>

      <RNPickerSelect
        onValueChange={(value) =>setGoal(value)}
        items= {goalOptions}
        value= {goal}
        placeholder={{ label:'Select A Goal', value: null}}
        style={pickerStyle}
      />
    {loading ? (
         <ActivityIndicator size="large" color="blue" />
    ):(

      <TouchableOpacity style= {styles.button} onPress={saveGoal}>
        <Text style={styles.buttonText}>Confirm Goal</Text>
      </TouchableOpacity>
    )}
    </View>
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
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    width: '100%',
    height: 40,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

});

const pickerStyle = StyleSheet.create({
  inputIOS: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#fff',
    marginBottom: 15,
    paddingHorizontal: 10,
    color: '#000',
  },
  inputAndroid:{
    
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#fff',
    marginBottom: 15,
    paddingHorizontal: 10,
    color: '#000',
  }

});

export default GoalSelection