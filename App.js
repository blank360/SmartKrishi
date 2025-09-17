import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Home from './Screens/Home';
import Login from './Screens/Login';

export default function App() {
  const Stack = createStackNavigator();
  return (
   <NavigationContainer>
    <Stack.Navigator
      initialRouteName='Login'
    >
      <Stack.Screen name="Home" component={Home} options={{headerShown:false}}/>
      <Stack.Screen name="Login" component={Login} options={{headerShown:false}}/>
    </Stack.Navigator>
   </NavigationContainer>
  );
}

