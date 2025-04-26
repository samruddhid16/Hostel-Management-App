import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import ChooseRoleScreen from './screens/ChooseRoleScreen';
import StudentAuth from './screens/auth/StudentAuth';
import FacultyAuth from './screens/auth/FacultyAuth';
import WardenAuth from './screens/auth/WardenAuth';
import StudentDashboard from './screens/StudentDashboard';
import FacultyDashboard from './screens/FacultyDashboard';
import WardenDashboard from './screens/WardenDashboard';
import LeaveApplication from './screens/LeaveApplication';
import EditProfile from './screens/EditProfile';
import FacultyProfile from './screens/FacultyProfile';


const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Welcome' }} />
        <Stack.Screen name="ChooseRole" component={ChooseRoleScreen} options={{ title: 'Choose Role' }} />
        <Stack.Screen name="StudentAuth" component={StudentAuth} options={{ title: 'Student Auth' }} />
        <Stack.Screen name="FacultyAuth" component={FacultyAuth} options={{ title: 'Faculty Auth' }} />
        <Stack.Screen name="WardenAuth" component={WardenAuth} options={{ title: 'Warden Auth' }} />  
        <Stack.Screen name="StudentDashboard" component={StudentDashboard} options={{ title: 'Dashboard' }} />
        <Stack.Screen name="FacultyDashboard" component={FacultyDashboard} options={{ title: 'Faculty Dashboard' }}/>
        <Stack.Screen name="WardenDashboard" component={WardenDashboard} options={{ title: 'Warden Dashboard' }}/>
        <Stack.Screen name="LeaveApplication" component={LeaveApplication} options={{ title: 'Leave Application' }} />
        <Stack.Screen name="EditProfile" component={EditProfile} options={{ title: 'Edit Profile' }} />
        <Stack.Screen name="FacultyProfile" component={FacultyProfile} options={{ title: 'Faculty Profile' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}