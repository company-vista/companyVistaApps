import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useThemeColors } from '../theme/colors';
import HomeScreen from '../features/home/screens/HomeScreen';
import ProfileScreen from '../features/profile/screens/ProfileScreen';
import ProfileAddressScreen from '../features/profile/screens/ProfileAddressScreen';
import EditProfileScreen from '../features/profile/screens/EditProfileScreen';
import NotificationScreen from '../features/notifications/screens/NotificationScreen';
import NotificationDetailScreen from '../features/notifications/screens/NotificationDetailScreen';
import SearchScreen from '../features/home/screens/SearchScreen';
import HelpFeedbackScreen from '../features/help/screens/HelpFeedbackScreen';
import SupportScreen from '../features/support/screens/SupportScreen';
import FollowUsScreen from '../features/home/screens/FollowUsScreen';
import QuickAccessScreen from '../features/home/screens/QuickAccessScreen';
import CompanyProfileScreen from '../features/home/screens/quickAccess/CompanyProfileScreen';
import InvoiceCenterScreen from '../features/home/screens/quickAccess/InvoiceCenterScreen';
import BusinessReportsScreen from '../features/home/screens/quickAccess/BusinessReportsScreen';
import HelpDeskScreen from '../features/home/screens/quickAccess/HelpDeskScreen';
import FederalFilingScreen from '../features/home/screens/compliances/FederalFilingScreen';
import AnnualStateFilingScreen from '../features/home/screens/compliances/AnnualFilingScreen';
import ComplianceHistoryScreen from '../features/home/screens/compliances/ComplianceHistoryScreen';
import RenewComplianceScreen from '../features/home/screens/compliances/RenewComplianceScreen';
import AddressRenewalScreen from '../features/home/screens/compliances/AddressRenewalScreen';
import InvoiceDetailScreen from '../features/home/screens/invoices/InvoiceDetailScreen';
import TransactionsScreen from '../features/home/screens/transactions/TransactionsScreen';
import TaxAccountingScreen from '../features/home/screens/exploreServices/TaxAccountingScreen';
import BusinessComplianceScreen from '../features/home/screens/exploreServices/BusinessComplianceScreen';
import BankingOwnerScreen from '../features/home/screens/exploreServices/BankingOwnerScreen';
import CorporateChangesScreen from '../features/home/screens/exploreServices/CorporateChangesScreen';
import BookkeepingScreen from '../features/home/screens/exploreServices/BookkeepingScreen';
import ComplianceCheckScreen from '../features/home/screens/exploreServices/ComplianceCheckScreen';
const Stack = createNativeStackNavigator();
export default function MainStack() {
    const colors = useThemeColors();
    return (<Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="Home" component={HomeScreen}/>
      <Stack.Screen name="Profile" component={ProfileScreen}/>
      <Stack.Screen name="ProfileAddress" component={ProfileAddressScreen}/>
      <Stack.Screen name="EditProfile" component={EditProfileScreen}/>
      <Stack.Screen name="Notifications" component={NotificationScreen}/>
      <Stack.Screen name="NotificationDetail" component={NotificationDetailScreen}/>
      <Stack.Screen name="Search" component={SearchScreen}/>
      <Stack.Screen name="HelpFeedback" component={HelpFeedbackScreen}/>
      <Stack.Screen name="Support" component={SupportScreen}/>
      <Stack.Screen name="FollowUs" component={FollowUsScreen}/>
      <Stack.Screen name="QuickAccess" component={QuickAccessScreen}/>
      <Stack.Screen name="CompanyProfile" component={CompanyProfileScreen}/>
      <Stack.Screen name="InvoiceCenter" component={InvoiceCenterScreen}/>
      <Stack.Screen name="BusinessReports" component={BusinessReportsScreen}/>
      <Stack.Screen name="HelpDesk" component={HelpDeskScreen}/>
      <Stack.Screen name="FederalFiling" component={FederalFilingScreen}/>
      <Stack.Screen name="AnnualFiling" component={AnnualStateFilingScreen}/>
      <Stack.Screen name="ComplianceHistory" component={ComplianceHistoryScreen}/>
      <Stack.Screen name="RenewCompliance" component={RenewComplianceScreen}/>
      <Stack.Screen name="AddressRenewal" component={AddressRenewalScreen}/>
      <Stack.Screen name="InvoiceDetail" component={InvoiceDetailScreen}/>
      <Stack.Screen name="Transactions" component={TransactionsScreen}/>
      <Stack.Screen name="TaxAccounting" component={TaxAccountingScreen}/>
      <Stack.Screen name="BusinessCompliance" component={BusinessComplianceScreen}/>
      <Stack.Screen name="BankingOwner" component={BankingOwnerScreen}/>
      <Stack.Screen name="CorporateChanges" component={CorporateChangesScreen}/>
      <Stack.Screen name="Bookkeeping" component={BookkeepingScreen}/>
      <Stack.Screen name="ComplianceCheck" component={ComplianceCheckScreen}/>
    </Stack.Navigator>);
}
