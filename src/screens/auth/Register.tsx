import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import RNPickerSelect from 'react-native-picker-select'; 
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/firebaseConfig';

const CalculateBmi = (weight: string, height: string): string | null => {
  const weightNum = parseFloat(weight);
  const heightNum = (parseFloat(height))/100;
  if (isNaN(weightNum) || isNaN(heightNum) || heightNum === 0) return null;
  const final_bmi = (weightNum/Math.pow(heightNum,2)).toFixed(2);
  return final_bmi;
};

const RegisterPage = ({ navigation }: { navigation: any }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [diabetes, setDiabetes] = useState<string | null>(null);
  const [experience, setExperience] = useState<string | null>(null);
  const [workoutdays, setWorkoutdays] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [gym_equipment, setGym_equipment] = useState<string | null>(null);

  const diabetesOptions = [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
  ];
  
  const gym_equipment_options = [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
  ];
  
  const experienceOptions = [
    { label: 'Beginner', value: 'Beginner' },
    { label: 'Intermediate', value: 'Intermediate' },
    { label: 'Advanced', value: 'Advanced' },
  ];

  const workoutdaysOptions = [
    { label: 'Three', value: '3' },
    { label: 'Four', value: '4' },
    { label: 'Five', value: '5' },
    { label: 'Six', value: '6' },
  ];
 
  const bmi = CalculateBmi(weight, height);

  const handleRegister = async () => {
    if (!email || !password || !age || !height || !weight || !diabetes || !experience || !gym_equipment) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
     setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        email,
        age,
        height,
        weight,
        diabetes,
        experience,
        gym_equipment,
        workoutdays,
      });

      navigation.navigate('GoalSelection', {
        userId:user.uid,
        bmi: bmi
      });
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message);
    }
    setLoading(false);
  };

  return (
    <ScrollView>
    <View style={styles.container}>
      <Text style={styles.title}>Register for PWFA</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#999"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Age"
        placeholderTextColor="#999"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Height (cm)"
        placeholderTextColor="#999"
        value={height}
        onChangeText={setHeight}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Weight (kg)"
        placeholderTextColor="#999"
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Do you have Type 1 Diabetes?</Text>
      <RNPickerSelect
        onValueChange={(value) => setDiabetes(value)}
        items={diabetesOptions}
        value={diabetes}
        placeholder={{ label: 'Select an option', value: null }}
        style={pickerSelectStyles}
      />

      <Text style={styles.label}>Experience Level</Text>
      <RNPickerSelect
        onValueChange={(value) => setExperience(value)}
        items={experienceOptions}
        value={experience}
        placeholder={{ label: 'Select an option', value: null }}
        style={pickerSelectStyles}
      />
      <Text style={styles.label}>Workout Days/Week</Text>
      <RNPickerSelect
        onValueChange={(value) => setWorkoutdays(value)}
        items={workoutdaysOptions}
        value={workoutdays}
        placeholder={{ label: 'Select an option', value: null }}
        style={pickerSelectStyles}
      />

      
      <Text style={styles.label}>Do you have access to a Gym?</Text>
      <RNPickerSelect
        onValueChange={(value) => setGym_equipment(value)}
        items={gym_equipment_options}
        value={gym_equipment}
        placeholder={{ label: 'Select an option', value: null }}
        style={pickerSelectStyles}
      />

{loading ? (
        <ActivityIndicator size="large" color="blue" /> 
      ) : (
        
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
      <Text style={styles.buttonText}>Register</Text>
    </TouchableOpacity>
      )}

      <TouchableOpacity onPress={() => navigation.navigate('SignInScreen')}>
        <Text style={styles.registerText}>Already have an account? Sign In</Text>
      </TouchableOpacity>
    </View>
    </ScrollView>
  );
};

const pickerSelectStyles = StyleSheet.create({
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
  inputAndroid: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#fff',
    marginBottom: 15,
    paddingHorizontal: 10,
    color: '#000',
  },
});

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
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
    color: '#000',
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: 14,
    marginBottom: 5,
    color: '#333',
  },
  button: {
    width: '100%',
    height: 40,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerText: {
    color: '#007bff',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default RegisterPage;