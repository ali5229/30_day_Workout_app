import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/Auth';

const MESSAGES = [
  '',
  'Personalized Plans',
  'Now for Diabetes Type 1 patients',
  'Variety Of Exercises',
  'Weekly Inspections',
  'Progress Calculation',
  'Get In Shape Now!',
];

const screenHeight = Dimensions.get('window').height;

const Signin = ({ navigation }: { navigation: any }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [visibleMessages, setVisibleMessages] = useState<string[]>([]);

  const fadeAnims = useRef(MESSAGES.map(() => new Animated.Value(0))).current;
  const messageOffsets = useRef(MESSAGES.map(() => new Animated.Value(0))).current;

  const auth = useAuth();

  useEffect(() => {
    let index = 0;

    const showMessage = () => {
      if (index < MESSAGES.length) {
        setVisibleMessages((prev) => [...prev, MESSAGES[index]]);

        Animated.timing(fadeAnims[index], {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();

        for (let i = 0; i <= index; i++) {
          Animated.timing(messageOffsets[i], {
            toValue: -30 * (index - i),
            duration: 800,
            useNativeDriver: true,
          }).start();
        }

        index++;
        setTimeout(showMessage, 4000);
      }
    };

    showMessage();
  }, []);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      await auth.signIn(email, password);
    } catch (error: any) {
      Alert.alert('Sign In Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ImageBackground
        source={require('../../assets/Images/SignInScreen.jpg')}
        style={styles.background}
      >
        <SafeAreaView style={styles.container}>
          {/* Animated Messages */}
          <View style={styles.animatedTextContainer}>
            {visibleMessages.map((msg, i) => (
              <Animated.View
                key={i}
                style={{
                  opacity: fadeAnims[i],
                  transform: [{ translateY: messageOffsets[i] }],
                  position: 'absolute',
                  width: '100%',
                }}
              >
                <Text style={styles.animatedText}>{msg}</Text>
              </Animated.View>
            ))}
          </View>

          {/* Sign-In Form */}
          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#fff"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#fff"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            {loading ? (
              <TouchableOpacity style={styles.button} >
              <Text style={styles.buttonText}><ActivityIndicator size="large" color="#fff" /></Text>
            </TouchableOpacity>
              
            ) : (
              <TouchableOpacity style={styles.button} onPress={handleSignIn}>
                <Text style={styles.buttonText}>Sign In</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerText}>
                Don't have an account? Register
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  animatedTextContainer: {
    height: screenHeight / 3,
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
  },
  animatedText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  formContainer: {
    justifyContent: 'center',
  },
  input: {
    width: '100%',
    height: 45,
    borderColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
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
  registerText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});

export default Signin;
