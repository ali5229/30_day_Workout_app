import { View, Text, ImageBackground } from 'react-native'
import React from 'react'

const SplashScreen = ({navigation}:{navigation?:any}) => {
  
  return (
    <ImageBackground source={require('../../assets/Images/splash.png')} resizeMode={'cover'} style={{flex:1}}>

    </ImageBackground>
  )
}

export default SplashScreen