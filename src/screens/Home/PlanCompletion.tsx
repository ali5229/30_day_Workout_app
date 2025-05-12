import { Button, Text, View } from "react-native";
import firestore from '@react-native-firebase/firestore';
import {useAuth} from '../../context/Auth'

const PlanCompleteScreen = ({ navigation}:{navigation:any}) => {
  
  const { authData } = useAuth(); 
    const userId = authData?.userId; 

  const handleRepeatPlan = () => {
    const today = new Date().toISOString();
    firestore().collection('users').doc(userId).update({
      planStartDate: today
    });
    navigation.replace('HomeScreen'); // restart flow
  };

  const handleGenerateNew = () => {
    navigation.navigate('PlanGenerationScreen'); // go to your plan generation flow
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Your 28-day plan is complete!</Text>
      <Button title="Repeat Same Plan" onPress={handleRepeatPlan} />
      <Button title="Generate New Plan" onPress={handleGenerateNew} />
    </View>
  );
};

export default PlanCompleteScreen;