// screens/FeedbackScreen.tsx
import React from 'react';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ImageBackground, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/Auth';
import firestore from '@react-native-firebase/firestore';


export default function FeedbackScreen({ navigation }: {navigation: any }) {
  
  const { authData } = useAuth(); 
  const userId = authData?.userId;
  const [checkInAvailable, setCheckInAvailable] = useState(false);
  const [nextCheckInDate, setNextCheckInDate] = useState<string | null>(null);
  const [loadCheckin, setLoadCheckin] = useState(false)

  useEffect(()=>{
    
    const checkAvailability = async () => {
      setLoadCheckin(true);
  try {
    if (!userId) return;
    const userDoc = await firestore().collection('users').doc(userId).get();
    const checkinDoc = await firestore().collection('weeklyCheckIns').doc(userId).get();

    if (userDoc.exists) {
      const userData = userDoc.data();
      const joinDate = userData?.createdAt?.toDate();

      let lastCheckInDate = joinDate; // fallback if no check-ins exist

      if (checkinDoc.exists) {
        const checkinData = checkinDoc.data();
        const weeks = checkinData ? Object.keys(checkinData) : [];
        if (weeks.length > 0) {
          const lastWeek = weeks[weeks.length - 1];
          const lastEntries = checkinData?.[lastWeek] || [];
          const lastTimestamp = lastEntries[lastEntries.length - 1]?.timestamp?.toDate?.();
          if (lastTimestamp) {
            lastCheckInDate = lastTimestamp;
          }
        }
      }

      const now = new Date();
      const diffInMs = now.getTime() - lastCheckInDate.getTime();
      const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

      if (diffInDays >= 7) {
        setCheckInAvailable(true);
        setNextCheckInDate(null);
      } else {
        setCheckInAvailable(false);
        const nextDate = new Date(lastCheckInDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        setNextCheckInDate(nextDate.toDateString());
      }
    }
  } catch (error) {
    console.error('Error checking check-in availability:', error);
  } finally {
    setLoadCheckin(false);
  }
};


    checkAvailability();
  }, [userId])

  const goToRegenerate = () =>{
    navigation.navigate('RegenerateScreen');
  }

  const goToWeeklyCheckIn = () => {
    navigation.navigate('WeeklyCheckInScreen');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      
      <View  style={styles.headerCard}>
        <Text style={styles.headerTitle}>Feedback Page</Text>
        <Text style={styles.headerSubtitle}>Provide feedback to personalize plans</Text>
      </View>

          {loadCheckin ? (
                <View style={[styles.card, { backgroundColor: '#EDD892', justifyContent: 'center', alignItems: 'center' }]}>
                  <ActivityIndicator size="large" color="#000" />
                </View>
              ) : checkInAvailable ? (
                <TouchableOpacity style={[styles.card, { backgroundColor: '#EDD892' }]} onPress={goToWeeklyCheckIn}>
                  <View style={styles.cardTextContent}>
                    <Text style={styles.cardTitle}>Weekly Check-In</Text>
                    <Text style={styles.cardData}>Give feedback weekly to ensure progress tracking.</Text>
                  </View>
                  <Image source={require('../../assets/Images/weekly_check.png')} style={styles.cardIcon} />
                </TouchableOpacity>
              ) : (
                <View style={[styles.card, { backgroundColor: '#ddd' }]}>
                  <View style={styles.cardTextContent}>
                    <Text style={styles.cardTitle}>Weekly Check-In Locked</Text>
                    <Text style={styles.cardData}>
                      Your next check-in will be available on {nextCheckInDate}.
                    </Text>
                  </View>
                  <Image source={require('../../assets/Images/lock_icon.png')} style={styles.cardIcon} />
                </View>
              )}

              <TouchableOpacity style={[styles.card, { backgroundColor: '#BA2C73' }]} onPress={goToRegenerate}>
                  <View style={styles.cardTextContent}>
                    <Text style={[styles.cardTitle, {color:'#fff'}]}>Regenerate Workout</Text>
                    <Text style={[styles.cardData,{color:'#fff'}]}>Start a new Workout from today with modifications.</Text>
                  </View>
                  <Image source={require('../../assets/Images/regenerate.png')} style={styles.cardIcon} />
                </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    flexGrow: 1
  },
  headerCard: {
    backgroundColor: '#4A90E2',
    padding: 20,
    height: 130,
    elevation: 5,
    marginBottom:20,
  },
  headerTitle: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E6F0FF',
  },
  card: {
    backgroundColor: '#FAFAC6',
    borderRadius: 12,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    height: 150,
    overflow: 'hidden',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardIcon: {
    width: 120,
    height: 120,
    resizeMode:"contain"
  },
  cardTextContent:{
    flexDirection:'column',
     width:'50%', 
     padding: 10, 
     justifyContent:'space-between'

  },
  cardTitle: {
    fontSize: 25,
    color: '#7B6D8D',
    marginBottom: 4,
    fontWeight: 'bold',
  },
  cardData: {
    fontSize: 14,
    color: '#474350',
  },

});
