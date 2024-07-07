// app/_layout.js
import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './screen/HomeScreen';
import CardScreen from './screen/CardScreen';
import { Ionicons, AntDesign } from '@expo/vector-icons';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStack(){
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name='HomeScreen' component={HomeScreen}/>
    </Stack.Navigator>
  );
}

function CardStack()
{
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name='CardsScreen' component={CardScreen}/>
    </Stack.Navigator>
  );
}

export default function Layout() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName;
          if(route.name === 'Home'){
            iconName =  'home'
          } else if (route.name === 'Cards') {
            iconName = 'folderopen';
          }
          return <AntDesign name={iconName} size={size} color={focused ? color : 'gray'} />;
        },
      })}
    >
      <Tab.Screen name='Home' component={HomeStack}  />
      <Tab.Screen name='Cards' component={CardStack}  />
      
    </Tab.Navigator>
  );
}
