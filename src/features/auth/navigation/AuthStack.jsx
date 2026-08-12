import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import OtpVerifyScreen from '../screens/OtpVerifyScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import { useThemeColors } from '../../../theme/colors';
const Stack = createNativeStackNavigator();
export default function AuthStack() {
    const colors = useThemeColors();
    return (<Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#ffffff' } }}>
      <Stack.Screen name="Login" component={LoginScreen}/>
      <Stack.Screen name="Signup" component={SignupScreen}/>
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen}/>
      <Stack.Screen name="OtpVerify" component={OtpVerifyScreen}/>
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen}/>
    </Stack.Navigator>);
}
