import React, { useState, useEffect } from 'react'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native'
import { useTheme, TouchableRipple } from 'react-native-paper'

import ArtistScreen from '../screens/Artist'
import AlbumScreen from '../screens/Album'
import TitlesScreen from '../screens/Titles'
import FavorisScreen from '../screens/Favoris'
import Authentification from '../screens/Authentification'
import SignupScreen from '../screens/Signup'
import PlaylistScreen from '../screens/Playlist'
import PlaylistTitleScreen from '../screens/PlaylistTitleScreen'
import AccueilScreen from '../screens/Accueil'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createStackNavigator } from '@react-navigation/stack';
import { render } from 'react-dom'


export default function AppContainerScreen({ navigation }) {

  const Tab = createBottomTabNavigator()
  const Stack = createStackNavigator();
  const { colors } = useTheme()
  const [token, setToken] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)


  const renderIcon = (iconSource) => ({ focused, size }) => (
    <TouchableRipple rippleColor={colors.primary}>
      <Icon name={iconSource} size={size} color={focused ? colors.primary : colors.divider} />
    </TouchableRipple>
  )

  useEffect(() => {
    getToken()
  }, [])

  const getToken = async () => {
    
    try {
      const value = await AsyncStorage.getItem('@bearerToken')
      setToken(value);
      const isAdmin = await AsyncStorage.getItem('@isAdmin')
      setIsAdmin((isAdmin === 'true'))
      if (value !== null) {
      }
    } catch (e) {
      console.log(e)
    }
  }



  const navigator = () => {
    return (


      <Tab.Navigator
        tabBarOptions={{
          activeTintColor: colors.primary,
          activeBackgroundColor: colors.background,
          inactiveBackgroundColor: colors.background,
          style: { borderTopWidth: 0 }
        }}>
        <Tab.Screen
          name="Author"
          options={{
            tabBarIcon: renderIcon('face'),
            tabBarLabel: 'Artiste'
          }}
          component={ArtistScreen}
        />
        <Tab.Screen
          name="Book"
          options={{
            tabBarIcon: renderIcon('music'),
            tabBarLabel: 'Titres'
          }}
          component={TitlesScreen}
        />
        <Tab.Screen
          name="Album"
          options={{
            tabBarIcon: renderIcon('bookmark-music'),
            tabBarLabel: 'Album'
          }}
          component={AlbumScreen}
        />
        { !isAdmin && (<Tab.Screen
          name="Favoris"
          options={{
            tabBarIcon: renderIcon('account-heart'),
            tabBarLabel: 'Favoris'
          }}
          component={FavorisScreen}
        />)}
        { !isAdmin && (<Tab.Screen
          name="Playlist"
          options={{
            tabBarIcon: renderIcon('playlist-music'),
            tabBarLabel: 'Playlist'
          }}
          component={PlaylistScreen}
        />)}
      </Tab.Navigator>
    )
  }

  const deconnexion = () => {

    useEffect(() => {

      const deleteToken = async () => {
        try {
          await AsyncStorage.removeItem('@bearerToken')
          navigation.navigate('Accueil');
        } catch (e) {
          // remove error
        }
      }
      deleteToken()
    }, [])
  }

  const stack = (
    <NavigationContainer>
      <Stack.Navigator headerMode="none">
        <Stack.Screen
          name="Accueil"
          component={AccueilScreen}
        />
        <Stack.Screen
          name="Login"
          component={Authentification}
        />
        <Stack.Screen
          name="Signup"
          component={SignupScreen}
        />
        <Stack.Screen
          name="Deco"
          component={deconnexion}
        />
        <Stack.Screen
          name="ShowTitlePlaylist"
          component={PlaylistTitleScreen}
        />
        <Stack.Screen 
        listeners={{
          focus:e=>{getToken()}
        }}
        name="Bottom" component={navigator}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )

  return stack
}
