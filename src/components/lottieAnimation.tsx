import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, Animated, Easing, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';

const steps = [
  'Analyzing your data...',
  'Matching your fitness level...',
  'Finalizing your plan...',
];

const screenHeight = Dimensions.get('window').height;

export default function LoadingScreen() {
  const [stepIndex, setStepIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
  const interval = setInterval(() => {
    setStepIndex((prev) => {
      if (prev < steps.length - 1) {
        return prev + 1;
      } else {
        clearInterval(interval); // stop updating once final step is reached
        return prev;
      }
    });
  }, 7000);

  return () => clearInterval(interval);
}, []);

  // Animate opacity loop
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 5000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 5000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);


  return (
    <View style={styles.container}>
      {/* Gradient 1 */}
      <LinearGradient
        colors={['#3a1c71', '#d76d77']}
        style={StyleSheet.absoluteFill}
      />

      {/* Gradient 2 with animated opacity */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}>
        <LinearGradient
          colors={['#0099F7', '#F11712']}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <Text style={styles.stepText}>{steps[stepIndex]}</Text>

      <LottieView
        source={require('../assets/Animations/generating.json')}
        autoPlay
        loop
        style={styles.logo}
        resizeMode="contain"
      />

      <LottieView
        source={require('../assets/Animations/Animation - 1746220172278.json')}
        autoPlay
        loop
        style={styles.lottie}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  stepText: {
    color: '#fff',
    fontSize: 18,
    fontStyle:'italic',
    marginTop: 60,
  },
  logo: {
    width: 300,
    height: 300,
  },
  lottie: {
    width: 100,
    height: 100,
    marginBottom: 80,
  },
});
