import TailorSettingsScreen from './screens/TailorSettingsScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ClientHomeScreen from './screens/ClientHomeScreen';
import TailorDashboard from './screens/TailorDashboard';
import ChatScreen from './screens/ChatScreen';
import InboxScreen from './screens/InboxScreen';
import AdminDashboard from './screens/AdminDashboard';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import VerifyCodeScreen from './screens/VerifyCodeScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import MapScreen from './screens/MapScreen';
import TailorProfileScreen from './screens/TailorProfileScreen';
import ClientProfileScreen from './screens/ClientProfileScreen';
import { registerForPushNotificationsAsync } from './notifications';
import { useEffect } from 'react';

const Stack = createStackNavigator();

export default function App() {
 useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ClientHome" component={ClientHomeScreen} />
        <Stack.Screen name="TailorDashboard" component={TailorDashboard} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="Inbox" component={InboxScreen} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="VerifyCode" component={VerifyCodeScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="Map" component={MapScreen} />
        <Stack.Screen name="TailorProfile" component={TailorProfileScreen} />
        <Stack.Screen name="ClientProfile" component={ClientProfileScreen} />
        <Stack.Screen name="TailorSettings" component={TailorSettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}