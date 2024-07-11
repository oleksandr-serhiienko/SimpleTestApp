import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './screen/HomeScreen';
import CardScreen from './screen/CardScreen';
import { AntDesign } from '@expo/vector-icons';
import { RouteProp, ParamListBase } from '@react-navigation/native';
import { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import BookScreen from './screen/BookScreen';
import PageScreen from './screen/Page';
import { Tabs } from 'expo-router';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

type AntDesignIconName = 'home' | 'folderopen' | 'questioncircle' | 'book' | 'filetext1';

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name='HomeScreen' component={HomeScreen}/>
    </Stack.Navigator>
  );
}

function CardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name='CardsScreen' component={CardScreen}/>
    </Stack.Navigator>
  );
}

function BookStack(){
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name = 'BookScreen' component={BookScreen}/>
    </Stack.Navigator>
  );
}

function PageStack(){
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name = 'PageScreen' component={PageScreen}/>
    </Stack.Navigator>
  );
}

export default function Layout() {
  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: RouteProp<ParamListBase, string> }): BottomTabNavigationOptions => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: AntDesignIconName = 'questioncircle';
          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Cards') {
            iconName = 'folderopen';
          }
          else if (route.name === 'Books'){
            iconName = 'book';
          }
          else if (route.name === 'Page'){
            iconName = 'filetext1'
          }
          return <AntDesign name={iconName} size={size} color={focused ? color : 'gray'} />;
        },
      })}
    >
      <Tab.Screen name='Home' component={HomeStack} />
      <Tab.Screen name='Cards' component={CardStack} />
      <Tab.Screen name='Books' component={BookStack}/>
      <Tab.Screen name='Page' component={PageStack}/>
    </Tab.Navigator>
  );
}