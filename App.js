import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import Profile from './screens/profile';
import DepartamentScreen from './screens/DepartamentScreen';
import Notificaciones from './screens/notificaction';
import LocationScreen from './screens/LocationScreen';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();


function DrawerNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: '#4A96BD', 
        drawerActiveBackgroundColor: '#FFF7A3', 
        drawerInactiveTintColor: 'black', 
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Cerrar sesion" component={WelcomeScreen} />
      <Drawer.Screen name="Profile" component={Profile} />
      <Drawer.Screen name="Humanidades" component={DepartamentScreen} />
    </Drawer.Navigator>
  );
}
export default function App() {
   return (
    <>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Home" component={DrawerNavigator} />
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="DepartamentScreen" component={DepartamentScreen} />
          <Stack.Screen name="Notificaciones" component={Notificaciones} />
          <Stack.Screen name="LocationScreen" component={LocationScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      
      <Toast />
    </>
  );
}
