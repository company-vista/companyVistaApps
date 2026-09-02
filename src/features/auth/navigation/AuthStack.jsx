import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingSlide from '../screens/OnboardingSlide';
import BusinessServicesScreen from '../screens/BusinessServicesScreen';
import TrustedWorldwideScreen from '../screens/TrustedWorldwideScreen';
import RegistrationLandingScreen from '../screens/RegistrationLandingScreen';
import CountrySelectionScreen from '../screens/CountrySelectionScreen';
import CompanyNamingScreen from '../screens/CompanyNamingScreen';
import StructureSelectionScreen from '../screens/StructureSelectionScreen';
import FounderDetailsScreen from '../screens/FounderDetailsScreen';
import EmailVerificationScreen from '../screens/EmailVerificationScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import OtpVerifyScreen from '../screens/OtpVerifyScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import PasswordUpdatedScreen from '../screens/PasswordUpdatedScreen';
import SetNewPasswordScreen from '../screens/SetNewPasswordScreen';
import { useThemeColors } from '../../../theme/colors';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { setRedirectToLogin } from '../../../store/slices/authSlice';
import { useEffect } from 'react';
const Stack = createNativeStackNavigator();
export default function AuthStack() {
    const colors = useThemeColors();
    const dispatch = useAppDispatch();
    const redirectToLogin = useAppSelector(s => s.auth.redirectToLogin);
    useEffect(() => {
        if (redirectToLogin) {
            const t = setTimeout(() => dispatch(setRedirectToLogin(false)), 500);
            return () => clearTimeout(t);
        }
    }, [redirectToLogin, dispatch]);
    return (<Stack.Navigator initialRouteName={redirectToLogin ? 'Login' : 'Onboarding'} screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0a0f1e' } }}>
      <Stack.Screen name="Onboarding" component={OnboardingSlide}/>
      <Stack.Screen name="BusinessServices" component={BusinessServicesScreen}/>
      <Stack.Screen name="TrustedWorldwide" component={TrustedWorldwideScreen}/>
      <Stack.Screen name="RegistrationLanding" component={RegistrationLandingScreen}/>
      <Stack.Screen name="CountrySelection" component={CountrySelectionScreen}/>
      <Stack.Screen name="CompanyNaming" component={CompanyNamingScreen}/>
      <Stack.Screen name="StructureSelection" component={StructureSelectionScreen}/>
      <Stack.Screen name="FounderDetails" component={FounderDetailsScreen}/>
      <Stack.Screen name="EmailVerification" component={EmailVerificationScreen}/>
      <Stack.Screen name="Login" component={LoginScreen}/>
      <Stack.Screen name="Signup" component={SignupScreen}/>
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen}/>
      <Stack.Screen name="OtpVerify" component={OtpVerifyScreen}/>
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen}/>
      <Stack.Screen name="PasswordUpdated" component={PasswordUpdatedScreen}/>
      <Stack.Screen name="SetNewPassword" component={SetNewPasswordScreen}/>
    </Stack.Navigator>);
}
