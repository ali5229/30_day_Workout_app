import { View, Text, ImageBackground, StatusBar } from 'react-native'
import React from 'react'

const SplashScreen = ({navigation}:{navigation?:any}) => {
  
  return (
    <>
           <StatusBar 
        translucent 
        backgroundColor="transparent" 
        barStyle="dark-content" // or "light-content" as needed
      />
    <ImageBackground source={require('../../assets/Images/splash.png')} resizeMode={'cover'} style={{flex:1}}>

    </ImageBackground>
    </>
  )
}

export default SplashScreen