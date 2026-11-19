import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminHomeScreen from '../screens/AdminHomeScreen';
import AdminCompaniesWithoutDocumentsScreen from '../screens/AdminCompaniesWithoutDocumentsScreen';
import AdminProfileScreen from '../profile/screens/AdminProfileScreen';
import AdminSettingsScreen from '../settings/SettingsScreen';
import CompanyVistaLeadsScreen from '../companyVistaLeads/screens/CompanyVistaLeadsScreen';
import DeactivateAccountScreen from '../../settings/screens/DeactivateAccountScreen';
import DeleteAccountScreen from '../../settings/screens/DeleteAccountScreen';

import AdminCompanyScreen from '../company/screens/AdminCompanyScreen';
import AdminClientsScreen from '../clients/screens/AdminClientsScreen';
import AdminClientDetailsScreen from '../clients/screens/AdminClientDetailsScreen';
import AdminCreateClientScreen from '../clients/screens/AdminCreateClientScreen';
import AdminEditClientScreen from '../clients/screens/AdminEditClientScreen';
import AdminSearchScreen from '../search/screens/AdminSearchScreen';
import AdminDocumentsScreen from '../documents/AdminDocumentsScreen';
import AdminChatListScreen from '../messages/screens/AdminChatListScreen';
import AdminMessageScreen from '../messages/screens/AdminMessageScreen';
import AdminNotificationsScreen from '../notifications/screens/AdminNotificationsScreen';
import AdminCreateInvoiceScreen from '../invoices/screens/AdminCreateInvoiceScreen';
import AdminInvoicesScreen from '../invoices/screens/AdminInvoicesScreen';
import AdminTransactionsScreen from '../transactions/screens/AdminTransactionsScreen';
import AdminEditTransactionScreen from '../transactions/screens/AdminEditTransactionScreen';
import AdminExpenseListScreen from '../expenses/screens/AdminExpenseListScreen';
import AdminAddExpenseScreen from '../expenses/screens/AdminAddExpenseScreen';
import AdminExpenseHeadsScreen from '../expenses/screens/AdminExpenseHeadsScreen';
import EditCompanyScreen from '../company/screens/EditCompanyScreen';
import NewCompanyScreen from '../company/screens/NewCompanyScreen';
import AdminCompanyRequestsScreen from '../company/screens/AdminCompanyRequestsScreen';
import UploadCompanyDocumentScreen from '../company/screens/UploadCompanyDocumentScreen';
import {
  AdminCompanyHomeScreen,
  AdminCompanyRecordsScreen,
} from '../company/screens/AdminCompanyDetailsScreen';
import AdminLayout from '../components/AdminLayout';
import AdminBlogsScreen from '../blogs/AdminBlogsScreen';
import CRM from '../crm/crm';
import RecentActivityScreen from '../crm/screens/RecentActivityScreen';
import AdminChangeRequest from '../services/components/AdminChangeRequest';
import AdminChangeRequestDetails from '../services/components/AdminChangeRequestDetails';
import AdminServicesRequest from '../services/components/AdminServicesRequest';
import AdminItin from '../services/components/AdminItin';

const Stack = createNativeStackNavigator();

const FullScreenLayout = ({ children }) => children;
const AdminScreenLayout = ({ children }) => <AdminLayout>{children}</AdminLayout>;

export default function AdminStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminHome" component={AdminHomeScreen} layout={AdminScreenLayout} />
      <Stack.Screen
        name="AdminCompaniesWithoutDocuments"
        component={AdminCompaniesWithoutDocumentsScreen}
        layout={FullScreenLayout}
      />
      <Stack.Screen name="AdminCRM" component={CRM} layout={FullScreenLayout} />
      <Stack.Screen
        name="AdminRecentActivity"
        component={RecentActivityScreen}
        layout={FullScreenLayout}
      />
      <Stack.Screen
        name="AdminChangeRequests"
        component={AdminChangeRequest}
        layout={FullScreenLayout}
      />
      <Stack.Screen
        name="AdminChangeRequestDetails"
        component={AdminChangeRequestDetails}
        layout={FullScreenLayout}
      />
      <Stack.Screen
        name="AdminServiceRequests"
        component={AdminServicesRequest}
        layout={FullScreenLayout}
      />
      <Stack.Screen
        name="AdminItin"
        component={AdminItin}
        layout={FullScreenLayout}
      />
      <Stack.Screen
        name="AdminBlogs"
        component={AdminBlogsScreen}
        layout={FullScreenLayout}
      />
      <Stack.Screen
        name="AdminProfile"
        component={AdminProfileScreen}
        layout={FullScreenLayout}
      />
      <Stack.Screen
        name="AdminSettings"
        component={AdminSettingsScreen}
        layout={FullScreenLayout}
      />
      <Stack.Screen
        name="CompanyVistaLeads"
        component={CompanyVistaLeadsScreen}
        layout={FullScreenLayout}
      />
      <Stack.Screen name="AdminCompany" component={AdminCompanyScreen} layout={AdminScreenLayout} />
      <Stack.Screen
        name="AdminCompanyRequests"
        component={AdminCompanyRequestsScreen}
        layout={FullScreenLayout}
      />
      <Stack.Screen
        name="AdminClients"
        component={AdminClientsScreen}
        layout={FullScreenLayout}
      />
      <Stack.Screen
        name="AdminClientDetails"
        component={AdminClientDetailsScreen}
        layout={FullScreenLayout}
      />
      <Stack.Screen
        name="AdminCreateClient"
        component={AdminCreateClientScreen}
        layout={FullScreenLayout}
      />
      <Stack.Screen
        name="AdminEditClient"
        component={AdminEditClientScreen}
        layout={FullScreenLayout}
      />
      <Stack.Screen
        name="AdminSearch"
        component={AdminSearchScreen}
        layout={FullScreenLayout}
      />
      <Stack.Screen name="AdminDocuments" component={AdminDocumentsScreen} layout={AdminScreenLayout} />
      <Stack.Screen name="AdminChatList" component={AdminChatListScreen} layout={AdminScreenLayout} />
      <Stack.Screen
        name="AdminCreateInvoice"
        component={AdminCreateInvoiceScreen}
        layout={FullScreenLayout}
      />
      <Stack.Screen
        name="AdminEditInvoice"
        component={AdminCreateInvoiceScreen}
        layout={FullScreenLayout}
      />
      <Stack.Screen
        name="AdminInvoices"
        component={AdminInvoicesScreen}
        layout={FullScreenLayout}
      />
      <Stack.Screen
        name="AdminTransactions"
        component={AdminTransactionsScreen}
        layout={FullScreenLayout}
      />
      <Stack.Screen
        name="AdminEditTransaction"
        component={AdminEditTransactionScreen}
        layout={FullScreenLayout}
      />
      <Stack.Screen
        name="AdminExpenses"
        component={AdminExpenseListScreen}
        layout={FullScreenLayout}
      />
      <Stack.Screen
        name="AdminAddExpense"
        component={AdminAddExpenseScreen}
        layout={FullScreenLayout}
      />
      <Stack.Screen
        name="AdminEditExpense"
        component={AdminAddExpenseScreen}
        layout={FullScreenLayout}
      />
      <Stack.Screen
        name="AdminExpenseHeads"
        component={AdminExpenseHeadsScreen}
        layout={FullScreenLayout}
      />
      <Stack.Screen
        name="AdminMessageScreen"
        component={AdminMessageScreen}
      />
      <Stack.Screen
        name="AdminNotifications"
        component={AdminNotificationsScreen}
        layout={FullScreenLayout}
      />
      <Stack.Screen
        name="DeactivateAccount"
        component={DeactivateAccountScreen}
        layout={FullScreenLayout}
      />
      <Stack.Screen
        name="DeleteAccount"
        component={DeleteAccountScreen}
        layout={FullScreenLayout}
      />
      <Stack.Screen
        name="AdminCompanyDetails"
        component={AdminCompanyHomeScreen}
        layout={FullScreenLayout}
      />
      <Stack.Screen
        name="AdminCompanyRecords"
        component={AdminCompanyRecordsScreen}
        layout={FullScreenLayout}
      />
      <Stack.Screen
        name="EditCompany"
        component={EditCompanyScreen}
        layout={FullScreenLayout}
      />
      <Stack.Screen
        name="NewCompany"
        component={NewCompanyScreen}
        layout={FullScreenLayout}
      />
      <Stack.Screen
        name="UploadCompanyDocument"
        component={UploadCompanyDocumentScreen}
        layout={FullScreenLayout}
      />
    </Stack.Navigator>
  );
}
