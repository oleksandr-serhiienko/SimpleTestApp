// app/_layout.js
import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screen/HomeScreen';
import CardScreen from './screen/CardScreen';

const Stack = createStackNavigator();

export default function Layout() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Cards" component={CardScreen} />
    </Stack.Navigator>
  );
}
