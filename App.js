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
import Notificaciones from './screens/NotificationScreen';
import LocationScreen from './screens/LocationScreen';
import EventScreen from './screens/EventScreen';
import EventDetailScreen from './screens/EventDetailScreen';
import CommentsScreen from './screens/commentsScreen';


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
     <Drawer.Screen
     name="Home"
     component={HomeScreen}
     options={{
     drawerItemStyle: { height: 0 }, 
      }}
    />

      <Drawer.Screen
        name="Agronomía"
        component={DepartamentScreen}
        initialParams={{ nombreDepartamento: 'Agronomía' }}
      />
      <Drawer.Screen
        name="Ciencia animal y conservación del hábitat"
        component={DepartamentScreen}
        initialParams={{ nombreDepartamento: 'Ciencia animal y conservación del hábitat' }}
      />
      <Drawer.Screen
        name="Ciencias de la tierra"
        component={DepartamentScreen}
        initialParams={{ nombreDepartamento: 'Ciencias de la tierra' }}
      />
      <Drawer.Screen
        name="Ciencias marinas y costeras"
        component={DepartamentScreen}
        initialParams={{ nombreDepartamento: 'Ciencias marinas y costeras' }}
      />
      <Drawer.Screen
        name="Ciencias sociales y jurídicas"
        component={DepartamentScreen}
        initialParams={{ nombreDepartamento: 'Ciencias sociales y jurídicas' }}
      />
      <Drawer.Screen
        name="Economía"
        component={DepartamentScreen}
        initialParams={{ nombreDepartamento: 'Economía' }}
      />
      <Drawer.Screen
        name="Humanidades"
        component={DepartamentScreen}
        initialParams={{ nombreDepartamento: 'Humanidades' }}
      />
      <Drawer.Screen
        name="Ingeniería en pesquerías"
        component={DepartamentScreen}
        initialParams={{ nombreDepartamento: 'Ingeniería en pesquerías' }}
      />
      <Drawer.Screen
        name="Sistemas computacionales"
        component={DepartamentScreen}
        initialParams={{ nombreDepartamento: 'Sistemas computacionales' }}
      />

      <Drawer.Screen name="Cerrar sesión" component={WelcomeScreen} />
      <Drawer.Screen name="Comentarios" component={CommentsScreen} />
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
          <Stack.Screen name="EventScreen" component={EventScreen} />
          <Stack.Screen name="EventDetailScreen" component={EventDetailScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      
      <Toast />
    </>
  );
}
