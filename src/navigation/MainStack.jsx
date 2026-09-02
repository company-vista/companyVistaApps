import React, { lazy, Suspense } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, Pressable, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useThemeColors } from '../theme/colors';
import { font } from '../theme/typography';

const HomeScreen = lazy(() => import('../features/home/screens/HomeScreen'));
const ProfileScreen = lazy(() => import('../features/profile/screens/ProfileScreen'));
const ProfileAddressScreen = lazy(() => import('../features/profile/screens/ProfileAddressScreen'));
const EditProfileScreen = lazy(() => import('../features/profile/screens/EditProfileScreen'));
const NotificationScreen = lazy(() => import('../features/notifications/screens/NotificationScreen'));
const NotificationDetailScreen = lazy(() => import('../features/notifications/screens/NotificationDetailScreen'));
const SearchScreen = lazy(() => import('../features/home/screens/SearchScreen'));
const HelpFeedbackScreen = lazy(() => import('../features/help/screens/HelpFeedbackScreen'));
const SupportScreen = lazy(() => import('../features/support/screens/SupportScreen'));
const FollowUsScreen = lazy(() => import('../features/home/screens/FollowUsScreen'));
const SettingsScreen = lazy(() => import('../features/settings/screens/SettingsScreen'));
const QuickAccessScreen = lazy(() => import('../features/home/screens/QuickAccessScreen'));
const CompanyProfileScreen = lazy(() => import('../features/home/screens/quickAccess/CompanyProfileScreen'));
const InvoiceCenterScreen = lazy(() => import('../features/home/screens/quickAccess/InvoiceCenterScreen'));
const BusinessReportsScreen = lazy(() => import('../features/home/screens/quickAccess/BusinessReportsScreen'));
const HelpDeskScreen = lazy(() => import('../features/home/screens/quickAccess/HelpDeskScreen'));
const FederalFilingScreen = lazy(() => import('../features/home/screens/compliances/FederalFilingScreen'));
const AnnualStateFilingScreen = lazy(() => import('../features/home/screens/compliances/AnnualFilingScreen'));
const ComplianceHistoryScreen = lazy(() => import('../features/home/screens/compliances/ComplianceHistoryScreen'));
const RenewComplianceScreen = lazy(() => import('../features/home/screens/compliances/RenewComplianceScreen'));
const AddressRenewalScreen = lazy(() => import('../features/home/screens/compliances/AddressRenewalScreen'));
const InvoiceDetailScreen = lazy(() => import('../features/home/screens/invoices/InvoiceDetailScreen'));
const TransactionsScreen = lazy(() => import('../features/home/screens/transactions/TransactionsScreen'));
const TaxAccountingScreen = lazy(() => import('../features/home/screens/exploreServices/TaxAccountingScreen'));
const BusinessComplianceScreen = lazy(() => import('../features/home/screens/exploreServices/BusinessComplianceScreen'));
const BankingOwnerScreen = lazy(() => import('../features/home/screens/exploreServices/BankingOwnerScreen'));
const CorporateChangesScreen = lazy(() => import('../features/home/screens/exploreServices/CorporateChangesScreen'));
const BookkeepingScreen = lazy(() => import('../features/home/screens/exploreServices/BookkeepingScreen'));
const ComplianceCheckScreen = lazy(() => import('../features/home/screens/exploreServices/ComplianceCheckScreen'));
const DeactivateAccountScreen = lazy(() => import('../features/settings/screens/DeactivateAccountScreen'));
const DeleteAccountScreen = lazy(() => import('../features/settings/screens/DeleteAccountScreen'));
const ChangePasswordScreen = lazy(() => import('../features/settings/screens/ChangePasswordScreen'));

const Stack = createNativeStackNavigator();

function LoadingFallback() {
    const colors = useThemeColors();
    return (<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
      <ActivityIndicator size="large" color={colors.accent}/>
    </View>);
}

export default function MainStack() {
    const colors = useThemeColors();
    return (<Suspense fallback={<LoadingFallback/>}>
      <Stack.Navigator screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
        headerTitleAlign: 'left',
        headerStyle: { backgroundColor: colors.surface },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        headerTitleStyle: { fontSize: font.hero, fontWeight: '500', color: colors.text },
        contentStyle: { backgroundColor: colors.background },
    }}>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="Profile" component={ProfileScreen} options={({ navigation }) => ({
        headerShown: false,
        headerRight: () => (<Pressable onPress={() => navigation.navigate('EditProfile')} style={{ paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center' }}>
          <FontAwesome name="pencil" size={17} color={colors.accent}/>
        </Pressable>),
      })}/>
      <Stack.Screen name="ProfileAddress" component={ProfileAddressScreen} options={{ title: 'Address & Edit' }}/>
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile', headerShown: false }}/>
      <Stack.Screen name="Notifications" component={NotificationScreen} options={{ title: 'Notifications' }}/>
      <Stack.Screen name="NotificationDetail" component={NotificationDetailScreen} options={{ title: 'Notification' }}/>
      <Stack.Screen name="Search" component={SearchScreen} options={{ title: 'Search' }}/>
      <Stack.Screen name="HelpFeedback" component={HelpFeedbackScreen} options={{ title: 'Help and feedback', headerTitleStyle: { fontSize: font.hero, color: colors.text } }}/>
      <Stack.Screen name="Support" component={SupportScreen} options={{ title: 'Support' }}/>
      <Stack.Screen name="FollowUs" component={FollowUsScreen} options={{ title: 'Follow Us' }}/>
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }}/>
      <Stack.Screen name="QuickAccess" component={QuickAccessScreen} options={{ title: 'Quick Access' }}/>
      <Stack.Screen name="CompanyProfile" component={CompanyProfileScreen} options={{ title: 'Company Profile' }}/>
      <Stack.Screen name="InvoiceCenter" component={InvoiceCenterScreen} options={{ title: 'Invoice Center' }}/>
      <Stack.Screen name="BusinessReports" component={BusinessReportsScreen} options={{ title: 'Business Reports' }}/>
      <Stack.Screen name="HelpDesk" component={HelpDeskScreen} options={{ title: 'Help Desk' }}/>
      <Stack.Screen name="FederalFiling" component={FederalFilingScreen} options={({ route }) => ({ title: route.params?.selectedAction?.title ?? 'Federal Tax Filing' })}/>
      <Stack.Screen name="AnnualFiling" component={AnnualStateFilingScreen} options={{ title: 'Annual state filing' }}/>
      <Stack.Screen name="ComplianceHistory" component={ComplianceHistoryScreen} options={{ title: 'Compliance History' }}/>
      <Stack.Screen name="RenewCompliance" component={RenewComplianceScreen} options={({ route }) => ({ title: route.params?.selectedAction?.title ?? 'Renew compliance' })}/>
      <Stack.Screen name="AddressRenewal" component={AddressRenewalScreen} options={({ route }) => ({ title: route.params?.selectedAction?.title ?? 'Address Renewal' })}/>
      <Stack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} options={{ title: 'Invoice Details' }}/>
      <Stack.Screen name="Transactions" component={TransactionsScreen} options={{ title: 'Transactions' }}/>
      <Stack.Screen name="TaxAccounting" component={TaxAccountingScreen} options={{ title: 'Tax & Accounting Services' }}/>
      <Stack.Screen name="BusinessCompliance" component={BusinessComplianceScreen} options={{ title: 'Business Compliance & Regis.' }}/>
      <Stack.Screen name="BankingOwner" component={BankingOwnerScreen} options={{ title: 'Banking & Owner Services' }}/>
      <Stack.Screen name="CorporateChanges" component={CorporateChangesScreen} options={{ title: 'Company Updates & Documents' }}/>
      <Stack.Screen name="Bookkeeping" component={BookkeepingScreen} options={{ title: 'Bookkeeping' }}/>
      <Stack.Screen name="ComplianceCheck" component={ComplianceCheckScreen} options={{ title: 'Compliance Check' }}/>
      <Stack.Screen name="DeactivateAccount" component={DeactivateAccountScreen} options={{ title: 'Deactivate Account' }}/>
      <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} options={{ title: 'Delete Account' }}/>
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Change Password' }}/>
    </Stack.Navigator>
    </Suspense>);
}
