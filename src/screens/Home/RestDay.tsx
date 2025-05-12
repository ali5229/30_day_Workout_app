import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native'
import React from 'react';
import LottieView from "lottie-react-native";

export default function RestDay({navigation}:{navigation:any}) {


  return (
    <ScrollView contentContainerStyle={styles.container}>
  {/* Header */}
  <View style={styles.headerContainer}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Image source={require('../../assets/Images/Back.png')} style={{ width: 24, height: 24, transform: [{ rotateY: '180deg' }] }} />
      </TouchableOpacity>
      <Text style={styles.headerText}>Rest Day</Text>
    </View>
  {/* Video Section */}
    <View style={styles.videoCard}>
     <LottieView
                                  source={require('../../assets/Animations/rest_day.json')}
                                  autoPlay
                                  loop
                                  style={styles.animation}
                                />
    </View>

  <View style={styles.instructionCard}>
    <Text style={styles.sectionTitle}>Rest Days Are Important!</Text>
    <Text style={styles.instructionText}>💤 Rest Day: Why It Matters{'\n\n'}
Rest days are just as important as workout days. They allow your muscles to repair, rebuild, and grow stronger.{'\n\n'} Overtraining without recovery can lead to fatigue, injury, and stalled progress.{'\n\n'}

Benefits of Rest Days:{'\n\n'}

🧠 Boost mental focus and motivation{'\n\n'}

💪 Repair and strengthen muscle tissue{'\n\n'}

❤️ Prevent injury and burnout{'\n\n'}

🛌 Improve sleep and hormonal balance{'\n\n'}

Use this time to hydrate, eat well, and maybe do light stretching or walking. You've earned it!</Text>
  </View>

  
  
</ScrollView>

  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 12,
  },
  headerText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
  },
    animation: {
        width: 300,
        height: 300,

      },
  videoCard: {
    marginBottom: 20,
    alignItems:'center'
  },
  instructionCard: {
    backgroundColor: '#087E8B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  instructionText: {
    color: '#E0F7FA',
    fontSize: 16,
    lineHeight: 24,
  },
});
