 import { ImageBackground, StyleSheet } from "react-native";
 import React from "react";
 import LottieView from "lottie-react-native";
 import { View, Text } from "react-native";
 
 export const LottieAnimation = ()=> {
     return (
                            <ImageBackground source={require('../assets/Images/splash.png')} style={styles.container}>
                              
                            <Text style={styles.loadingText}>Creating Personalized Plan For You...</Text>
                            <LottieView
                              source={require('../assets/Animations/Animation - 1746220172278.json')}
                              autoPlay
                              loop
                              style={styles.animation}
                            />
                          </ImageBackground>
                    );

 }


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    animation: {
        width: 200,
        height: 200,
        marginTop: 400,

      },
     loadingText: {
        marginLeft: 60,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        fontStyle: 'italic',
      },
})