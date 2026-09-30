import { createNativeStackNavigator } from '@react-navigation/native-stack';

// ─────────────────────────────────────────────────────────────────────────────
// RegistrationStack — company formation wizard for ALREADY authenticated users.
//
// AuthStack (pre-login) registers the same screens, but RootStack only mounts
// AuthStack when `isAuthenticated === false`. That left a signed-in client with
// no reachable path to create a second company.
//
// This stack deliberately omits the account/credential screens that only make
// sense for a brand new user:
//   Onboarding, BusinessServices, TrustedWorldwide  → marketing funnel
//   EmailVerification, VerifyNumber, OtpVerify       → email/phone verification
//   Login, ForgotPassword, ResetPassword, PasswordUpdated, SetNewPassword
//
// A returning client already has a verified email and a password, so the flow
// starts straight at RegistrationLanding.
//
// Every screen here renders its own BackButton + logo header, hence
// `headerShown: false`.
//
// NOTE: imports below are EAGER (same as AuthStack). That is intentional —
// MainStack lazy-loads this whole file, so the wizard's ~24 screens are only
// pulled in when the user actually opens Add Company. Keeping them eager means
// no per-screen Suspense flash while stepping through the wizard.
// ─────────────────────────────────────────────────────────────────────────────

import RegistrationLandingScreen from '../screens/RegistrationLandingScreen';
import CompanyNamingScreen from '../screens/CompanyNamingScreen';
import StructureSelectionScreen from '../screens/StructureSelectionScreen';
import WhatsIncludedScreen from '../screens/WhatsIncludedScreen';
import OptionalAddOnsScreen from '../screens/OptionalAddOnsScreen';
import FounderDetailsScreen from '../screens/FounderDetailsScreen';
import ReviewAndConfirmScreen from '../screens/ReviewAndConfirmScreen';
import CompletePaymentScreen from '../screens/CompletePaymentScreen';
import DetailsReceivedScreen from '../screens/DetailsReceivedScreen';
import StatusScreen from '../screens/StatusScreen';
import ShareholdersScreen from '../screens/ShareholdersScreen';
import VerifyIdentityScreen from '../screens/VerifyIdentityScreen';
import RegistrationProgressScreen from '../screens/RegistrationProgressScreen';
import StripeOneTimePayment from '../../../stripe_pament_section/StripeOneTimePayment';
import RegisterJurisdictionScreen from '../jurisdictionAdvisor/RegisterJurisdictionScreen';
import CompanyPurposeScreen from '../jurisdictionAdvisor/CompanyPurposeScreen';
import CustomerLocationScreen from '../jurisdictionAdvisor/CustomerLocationScreen';
import PrioritySelectionScreen from '../jurisdictionAdvisor/PrioritySelectionScreen';
import DayOneNeedsScreen from '../jurisdictionAdvisor/DayOneNeedsScreen';
import BestMatchesScreen from '../jurisdictionAdvisor/BestMatchesScreen';
import USStatePhysicalPresenceScreen from '../jurisdictionAdvisor/USStatePhysicalPresenceScreen';
import USStatePriorityScreen from '../jurisdictionAdvisor/USStatePriorityScreen';
import BestStatesForYouScreen from '../jurisdictionAdvisor/BestStatesForYouScreen';

const Stack = createNativeStackNavigator();

export default function RegistrationStack() {
    return (
        <Stack.Navigator
            initialRouteName="RegistrationLanding"
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#0a0f1e' },
            }}
        >
            {/* Entry */}
            <Stack.Screen name="RegistrationLanding" component={RegistrationLandingScreen} />

            {/* Jurisdiction Advisor flow — order matters, this is a linear chain
                that spreads its answers forward through route.params */}
            <Stack.Screen name="RegisterJurisdiction" component={RegisterJurisdictionScreen} />
            <Stack.Screen name="CompanyPurpose" component={CompanyPurposeScreen} />
            <Stack.Screen name="CustomerLocation" component={CustomerLocationScreen} />
            <Stack.Screen name="PrioritySelection" component={PrioritySelectionScreen} />
            <Stack.Screen name="DayOneNeeds" component={DayOneNeedsScreen} />
            <Stack.Screen name="BestMatches" component={BestMatchesScreen} />
            <Stack.Screen name="USStatePhysicalPresence" component={USStatePhysicalPresenceScreen} />
            <Stack.Screen name="USStatePriority" component={USStatePriorityScreen} />
            <Stack.Screen name="BestStatesForYou" component={BestStatesForYouScreen} />

            {/* Company formation wizard */}
            <Stack.Screen name="CompanyNaming" component={CompanyNamingScreen} />
            <Stack.Screen name="StructureSelection" component={StructureSelectionScreen} />
            <Stack.Screen name="WhatsIncluded" component={WhatsIncludedScreen} />
            <Stack.Screen name="OptionalAddOns" component={OptionalAddOnsScreen} />
            <Stack.Screen name="FounderDetails" component={FounderDetailsScreen} />
            <Stack.Screen name="ReviewAndConfirm" component={ReviewAndConfirmScreen} />
            <Stack.Screen name="CompletePayment" component={CompletePaymentScreen} />
            <Stack.Screen name="StripeOneTimePayment" component={StripeOneTimePayment} />
            <Stack.Screen name="DetailsReceived" component={DetailsReceivedScreen} />

            {/* Post-payment / KYC — these shadow the same-named MainStack routes
                so the whole tail of the flow stays inside the modal */}
            <Stack.Screen name="Status" component={StatusScreen} />
            <Stack.Screen name="Shareholders" component={ShareholdersScreen} />
            <Stack.Screen name="VerifyIdentity" component={VerifyIdentityScreen} />
            <Stack.Screen name="RegistrationProgress" component={RegistrationProgressScreen} />
        </Stack.Navigator>
    );
}
