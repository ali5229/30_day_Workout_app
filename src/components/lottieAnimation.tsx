 import { StyleSheet } from "react-native";
 import React from "react";
 import LottieView from "lottie-react-native";
 import { View, Text } from "react-native";
 
 export const LottieAnimation = ()=> {
     return (
                            <View style={styles.container}>
                            <LottieView
                              source={require('../assets/Animations/Animation - 1745750144301.json')}
                              autoPlay
                              loop
                              style={styles.animation}
                            />
                            <Text style={styles.loadingText}>Workout Generating... Please Wait</Text>
                          </View>
                    );

 }


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    animation: {
        marginTop: 150,
        width: 370,
        height: 370,
      },
     loadingText: {
        marginLeft: 60,
        fontSize: 18,
        fontWeight: 'bold',
      },
})