import React from 'react'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native'
import { useTheme, TouchableRipple } from 'react-native-paper'

import ArtistScreen from '../screens/Artist'
import AlbumScreen from '../screens/Album'
import BookScreen from '../screens/Book'

export default function AppContainer() {
  const Tab = createBottomTabNavigator()
  const { colors } = useTheme()

  const renderIcon = (iconSource) => ({ focused, size }) => (
    <TouchableRipple rippleColor={colors.primary}>
      <Icon name={iconSource} size={size} color={focused ? colors.primary : colors.divider} />
    </TouchableRipple>
  )

  return (
    <NavigationContainer>
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
            tabBarLabel: 'Auteurs'
          }}
          component={ArtistScreen}
        />
        <Tab.Screen
          name="Book"
          options={{
            tabBarIcon: renderIcon('book-open-page-variant'),
            tabBarLabel: 'Titles'
          }}
          component={BookScreen}
        />
        <Tab.Screen
          name="Album"
          options={{
            tabBarIcon: renderIcon('book-open-page-variant'),
            tabBarLabel: 'Album'
          }}
          component={AlbumScreen}
        />
      </Tab.Navigator>
    </NavigationContainer>
  )
}
