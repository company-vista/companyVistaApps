import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingSlide from '../screens/OnboardingSlide';
import BusinessServicesScreen from '../screens/BusinessServicesScreen';
import TrustedWorldwideScreen from '../screens/TrustedWorldwideScreen';
import RegistrationLandingScreen from '../screens/RegistrationLandingScreen';
import CompanyNamingScreen from '../screens/CompanyNamingScreen';
import StructureSelectionScreen from '../screens/StructureSelectionScreen';
import WhatsIncludedScreen from '../screens/WhatsIncludedScreen';
import OptionalAddOnsScreen from '../screens/OptionalAddOnsScreen';
import ReviewAndConfirmScreen from '../screens/ReviewAndConfirmScreen';
import CompletePaymentScreen from '../screens/CompletePaymentScreen';
import FounderDetailsScreen from '../screens/FounderDetailsScreen';
import DetailsReceivedScreen from '../screens/DetailsReceivedScreen';
import EmailVerificationScreen from '../screens/EmailVerificationScreen';
import LoginScreen from '../screens/LoginScreen';
import VerifyNumberScreen from '../screens/VerifyNumberScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import OtpVerifyScreen from '../screens/OtpVerifyScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import PasswordUpdatedScreen from '../screens/PasswordUpdatedScreen';
import SetNewPasswordScreen from '../screens/SetNewPasswordScreen';
import StripeOneTimePayment from '../../../stripe_pament_section/StripeOneTimePayment';
import StatusScreen from '../screens/StatusScreen';
import ShareholdersScreen from '../screens/ShareholdersScreen';
import VerifyIdentityScreen from '../screens/VerifyIdentityScreen';
import RegistrationProgressScreen from '../screens/RegistrationProgressScreen';
import RegisterJurisdictionScreen from '../jurisdictionAdvisor/RegisterJurisdictionScreen';
import CompanyPurposeScreen from '../jurisdictionAdvisor/CompanyPurposeScreen';
import CustomerLocationScreen from '../jurisdictionAdvisor/CustomerLocationScreen';
import PrioritySelectionScreen from '../jurisdictionAdvisor/PrioritySelectionScreen';
import DayOneNeedsScreen from '../jurisdictionAdvisor/DayOneNeedsScreen';
import BestMatchesScreen from '../jurisdictionAdvisor/BestMatchesScreen';
import USStatePhysicalPresenceScreen from '../jurisdictionAdvisor/USStatePhysicalPresenceScreen';
import USStatePriorityScreen from '../jurisdictionAdvisor/USStatePriorityScreen';
import BestStatesForYouScreen from '../jurisdictionAdvisor/BestStatesForYouScreen';
import { useThemeColors } from '../../../theme/colors';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { setRedirectToLogin } from '../../../store/slices/authSlice';
import { useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
const Stack = createNativeStackNavigator();
export default function AuthStack() {
    const colors = useThemeColors();
    const dispatch = useAppDispatch();
    const navigation = useNavigation();
    // Optional chaining: Fast Refresh ke dauraan hook order shift hote hue ye values
    // undefined aa sakti hain - us dauraan AuthStack crash nahi karna chahiye.
    const redirectToLogin = useAppSelector(s => s?.auth?.redirectToLogin);
    const isAuthenticated = useAppSelector(s => s?.auth?.isAuthenticated);
    const didResetRef = useRef(false);
    useEffect(() => {
        if (!redirectToLogin) {
            didResetRef.current = false;
            return undefined;
        }
        // Logout/cold-start par Login hi khulna chahiye. AuthStack kabhi kabhi purane route
        // (Onboarding / beech ka signup step) par reuse ho jata hai, isliye current route
        // chahe kuch bhi ho - reset Login par kar do. isReady() guard early mount par
        // "RESET not handled by any navigator" warning rokta hai.
        if (!didResetRef.current && navigation?.isReady?.()) {
            didResetRef.current = true;
            navigation.reset({ routes: [{ name: 'Login' }] });
        }
        // Flag tabhi clear karo jab user authenticated ho (login successful).
        // Logout ke baad clear karne se RootStack ka key badal jata hai, AuthStack dobara
        // mount hota hai aur initialRouteName 'Onboarding' ban kar user wahi chala jata tha.
        if (!isAuthenticated) {
            return undefined;
        }
        const t = setTimeout(() => dispatch(setRedirectToLogin(false)), 500);
        return () => clearTimeout(t);
    }, [redirectToLogin, isAuthenticated, dispatch, navigation]);
    return (<Stack.Navigator initialRouteName={redirectToLogin ? 'Login' : 'Onboarding'} screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0a0f1e' } }}>
      <Stack.Screen name="Onboarding" component={OnboardingSlide}/>
      <Stack.Screen name="BusinessServices" component={BusinessServicesScreen}/>
      <Stack.Screen name="TrustedWorldwide" component={TrustedWorldwideScreen}/>
      <Stack.Screen name="RegistrationLanding" component={RegistrationLandingScreen}/>
      <Stack.Screen name="CompanyNaming" component={CompanyNamingScreen}/>
      <Stack.Screen name="StructureSelection" component={StructureSelectionScreen}/>
      <Stack.Screen name="WhatsIncluded" component={WhatsIncludedScreen}/>
      <Stack.Screen name="OptionalAddOns" component={OptionalAddOnsScreen}/>
      <Stack.Screen name="FounderDetails" component={FounderDetailsScreen}/>
      <Stack.Screen name="ReviewAndConfirm" component={ReviewAndConfirmScreen}/>
      <Stack.Screen name="CompletePayment" component={CompletePaymentScreen}/>
      <Stack.Screen name="DetailsReceived" component={DetailsReceivedScreen}/>
      <Stack.Screen name="EmailVerification" component={EmailVerificationScreen}/>
      <Stack.Screen name="Login" component={LoginScreen}/>
      <Stack.Screen name="VerifyNumber" component={VerifyNumberScreen}/>
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen}/>
      <Stack.Screen name="OtpVerify" component={OtpVerifyScreen}/>
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen}/>
      <Stack.Screen name="PasswordUpdated" component={PasswordUpdatedScreen}/>
      <Stack.Screen name="SetNewPassword" component={SetNewPasswordScreen}/>
      <Stack.Screen name="StripeOneTimePayment" component={StripeOneTimePayment}/>
      <Stack.Screen name="Status" component={StatusScreen}/>
      <Stack.Screen name="Shareholders" component={ShareholdersScreen}/>
      <Stack.Screen name="VerifyIdentity" component={VerifyIdentityScreen}/>
      <Stack.Screen name="RegistrationProgress" component={RegistrationProgressScreen}/>
      {/* Jurisdiction Advisor Flow */}
      <Stack.Screen name="RegisterJurisdiction" component={RegisterJurisdictionScreen}/>
      <Stack.Screen name="CompanyPurpose" component={CompanyPurposeScreen}/>
      <Stack.Screen name="CustomerLocation" component={CustomerLocationScreen}/>
      <Stack.Screen name="PrioritySelection" component={PrioritySelectionScreen}/>
      <Stack.Screen name="DayOneNeeds" component={DayOneNeedsScreen}/>
      <Stack.Screen name="BestMatches" component={BestMatchesScreen}/>
      <Stack.Screen name="USStatePhysicalPresence" component={USStatePhysicalPresenceScreen}/>
      <Stack.Screen name="USStatePriority" component={USStatePriorityScreen}/>
      <Stack.Screen name="BestStatesForYou" component={BestStatesForYouScreen}/>
    </Stack.Navigator>);
}
