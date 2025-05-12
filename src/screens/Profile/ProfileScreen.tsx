
import React from 'react';
import { View, Text, Image, StyleSheet,Platform, ActivityIndicator, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../context/Auth';
import firestore from '@react-native-firebase/firestore';
import { useEffect, useState } from 'react';
import ProgressChart from '../../components/progressChart';

export default function WorkoutScreen() {
  const { authData } = useAuth(); 
  const email = authData?.email;
  const userId = authData?.userId; 
  const [userWeight, setUserWeight] = useState(0);
  const [currentWeight, setCurrentWeight] = useState(0);
  const [workoutsCompleted, setWorkoutsCompleted] = useState(0);
  const [goal, setGoal] = useState('');
  const [joinedDate, setJoinedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const [weekCheckIns, setWeekCheckIns] =useState(0);
  
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleSignout = async () => {
    setLoading(true);
    try {
      await auth.signOut();
    } catch (error: any) {
      Alert.alert('Sign Out Failed', error.message);
    } finally {
      setLoading(false);
    }
  
  };
  
  useEffect(() => {
    setLoading(true);
    const fetchUserData = async () => {
      try {
        if (!userId) return;
        const userDoc = await firestore().collection('users').doc(userId).get();
        const checkinDoc = await firestore().collection('weeklyCheckIns').doc(userId).get();
        if (userDoc.exists) {
          const data = userDoc.data();
          setWorkoutsCompleted(data?.workoutsCompleted || 0);
          setGoal(data?.goal || '');
          setJoinedDate(data?.createdAt?.toDate?.() ?? new Date());
          setUserWeight(data?.weight || 0);
          if (checkinDoc.exists) {
              const checkData = checkinDoc.data();

              if (checkData) {

                const weeks = Object.keys(checkData);
                setWeekCheckIns(weeks.length);
                if (weeks.length > 0) {
                  const sortedWeeks = weeks.sort((a, b) => {
                    const aNum = parseInt(a.replace('week', ''), 10);
                    const bNum = parseInt(b.replace('week', ''), 10);
                    return bNum - aNum; // latest week first
                  });

                  const latestWeek = sortedWeeks[0];
                  const latestEntries = checkData[latestWeek];
                  const lastEntry = latestEntries?.[latestEntries.length - 1];

                  setCurrentWeight(lastEntry?.weight || data?.weight || 0);
                } else {
                  setCurrentWeight(data?.weight || 0);
                }
              } else {
                setCurrentWeight(data?.weight || 0);
              }
            }else {
                setCurrentWeight(data?.weight || 0);
              }


        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
      setLoading(false);
    };
  
    fetchUserData();
  }, [authData]);
  
  let rank = '';
  let progress = 0;
  if (workoutsCompleted < 30) {
    rank = 'Beginner';
    progress = workoutsCompleted / 30;
  } else if (workoutsCompleted < 60) {
    rank = 'Intermediate';
    progress = (workoutsCompleted - 30) / 30;
  } else {
    rank = 'Advanced';
    progress = 1;
  }
    if(loading){
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      );
    }
  
  return (
    <ScrollView contentContainerStyle={ styles.container }
    keyboardShouldPersistTaps="handled"
    showsVerticalScrollIndicator={false} >

      <View style={styles.headerContainer}>
        <Image source={require('../../assets/Images/profile_pic_male.png')} style={styles.profilepic} />
        <View style={{ flexDirection: 'column' }}>
          <Text style={styles.emailText}>{email}</Text>
          <View style={styles.rankContainer}>
            <Image source={require('../../assets/Images/rank.png')} style={styles.rankIcon} />
            <Text style={styles.rankText}>{rank}</Text>
          </View>
          <View style={styles.progressBarContainer}>
              <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>{Math.round(progress * 100)}% to next rank</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardTextContent}>
        <Text style={styles.cardTitle}>Workouts Completed</Text>
        <Text style={styles.cardData}>{workoutsCompleted}</Text>
        </View>
        <Image source={require('../../assets/Images/profile_workouts_completed.png')} style={styles.cardIcon}/>
      </View>

      <View style={[styles.card, {backgroundColor:'#EDD892'}]}>
        <View style={styles.cardTextContent}>
        <Text style={styles.cardTitle}>Goal</Text>
        <Text style={styles.cardData}>{goal}</Text>
        </View>
        <Image source={require('../../assets/Images/profile_goal.png')} style={styles.cardIcon} />
      </View>

      <View style={[styles.card, {backgroundColor:'#56E39F'}]}>
      <View style={styles.cardTextContent}>
        <Text style={styles.cardTitle}>Joined Date</Text>
        <Text style={styles.cardData}>{formatDate(joinedDate)}</Text>
        </View>
        <Image source={require('../../assets/Images/profile_calendar.png')} style={[styles.cardIcon,{height:130}]} />
        </View>

         <View style={[styles.card, {backgroundColor:'#DAE2DF'}]}>
      <View style={styles.cardTextContent}>
        <Text style={styles.cardTitle}>Weekly Check-Ins Completed</Text>
        <Text style={styles.cardData}>{weekCheckIns}</Text>
        </View>
        <Image source={require('../../assets/Images/weekly_check.png')} style={[styles.cardIcon,{height:130}]} />
        </View>

        <View style={{flexDirection:'row',justifyContent:'space-between',padding:10, borderTopWidth:1, borderBottomWidth:1, borderColor:'#E5E7EB'}}>
           <View style={[styles.weightComparison,{borderRightWidth:1}]}>
            <Text style={{fontWeight:'bold', color:'#028090'}}>STARTED</Text>
            <Text style={styles.weightComparisonText}>{userWeight}<Text style={{fontSize:15, fontWeight:'black'}}>kg</Text></Text>
           </View>
           <View style={[styles.weightComparison,{borderRightWidth:1}]}>
            <Text style={{fontWeight:'bold', color:'#9376E9'}}>CURRENT</Text>
            <Text style={styles.weightComparisonText}>{currentWeight}<Text style={{fontSize:15, fontWeight:'black'}}>kg</Text></Text>
           </View>
           <View style={styles.weightComparison}>
            <Text style={{fontWeight:'bold', color:'#F45B69'}}>LOSS/GAIN</Text>
            <Text style={styles.weightComparisonText}>{currentWeight-userWeight}<Text style={{fontSize:15, fontWeight:'black'}}>kg</Text></Text>
           </View>
        </View>
        <ProgressChart/>


        <TouchableOpacity onPress={handleSignout} style={styles.logoutButton}>
             <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    flexGrow: 1
  },logoutButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    alignItems: 'center',
    alignSelf: 'center',
    width: '80%',
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#fff',
  },
  profilepic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 20,
  },
  emailText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankIcon: {
    height: 24,
    width: 24,
    marginRight: 6,
  },
  rankText: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 10,
    width: '100%',
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    marginTop: 8,
    overflow: 'hidden',
  },
  
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 5,
  },
  
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
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
  },
  cardIcon: {
    width: 200,
    height: 200,
    resizeMode:"contain"
  },
  cardTextContent:{
    flexDirection:'column',
     width:'50%', 
     padding: 10, 
     justifyContent:'space-between'

  },
  cardTitle: {
    fontSize: 14,
    color: '#474350',
    marginBottom: 4,
  },
  cardData: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#7B6D8D',
  },
  weightComparison:{
    alignItems:'center',
    width:'33%',
    borderColor:'#E5E7EB'
  },
  weightComparisonText:{
    fontSize:30,
    fontWeight: 'bold',
  }
});
