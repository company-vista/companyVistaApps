import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminHomeScreen from '../screens/AdminHomeScreen';
import AdminProfileScreen from '../profile/screens/AdminProfileScreen';
import AdminCompanyScreen from '../company/screens/AdminCompanyScreen';
import AdminDocumentsScreen from '../documents/AdminDocumentsScreen';
import AdminChatListScreen from '../messages/screens/AdminChatListScreen';
import AdminMessageScreen from '../messages/screens/AdminMessageScreen';
import EditCompanyScreen from '../company/screens/EditCompanyScreen';
import UploadCompanyDocumentScreen from '../company/screens/UploadCompanyDocumentScreen';
import {
  AdminCompanyHomeScreen,
  AdminCompanyRecordsScreen,
} from '../company/screens/AdminCompanyDetailsScreen';
import AdminLayout from '../components/AdminLayout';

const Stack = createNativeStackNavigator();

const FullScreenLayout = ({ children }) => children;
const AdminScreenLayout = ({ children }) => <AdminLayout>{children}</AdminLayout>;

export default function AdminStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminHome" component={AdminHomeScreen} layout={AdminScreenLayout} />
      <Stack.Screen name="AdminProfile" component={AdminProfileScreen} layout={AdminScreenLayout} />
      <Stack.Screen name="AdminCompany" component={AdminCompanyScreen} layout={AdminScreenLayout} />
      <Stack.Screen name="AdminDocuments" component={AdminDocumentsScreen} layout={AdminScreenLayout} />
      <Stack.Screen name="AdminChatList" component={AdminChatListScreen} layout={AdminScreenLayout} />
      <Stack.Screen
        name="AdminMessageScreen"
        component={AdminMessageScreen}
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
        name="UploadCompanyDocument"
        component={UploadCompanyDocumentScreen}
        layout={FullScreenLayout}
      />
    </Stack.Navigator>
  );
}

