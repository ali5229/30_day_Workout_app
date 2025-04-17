import React, { useState, useEffect } from 'react';
import { ActivityIndicator,View, Text, Image, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../firebase/firebaseConfig'


const Signin = ({ navigation }: { navigation: any }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {

    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }
     setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.navigate('HomeScreen');
    } catch (error: any) {
      Alert.alert('Sign In Failed', error.message);
    }
     setLoading(false);
  };
  return (
    <View style={styles.container}>
      {/* Image Container */}
      <View style={styles.imageContainer}>
        <Image
          style={styles.image}
          resizeMode="contain"
          source={require('../../assets/Images/Signin.png')}
        />
      </View>

      <Text style={styles.title}>Sign In To PWFA</Text>

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
     {loading ?(
      <ActivityIndicator size="large" color="blue" />
     ):(
      
      <TouchableOpacity style={styles.button} onPress={handleSignIn}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>
     )
    }

      <TouchableOpacity onPress={() => navigation.navigate('RegisterScreen')}>
        <Text style={styles.registerText}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  imageContainer: {
    flex: .7,
    width: '100%', 
    height: '100%', 
    marginBottom: 5,
  },
  image: {
    width: '100%',
    height: '100%',
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

export default Signin;