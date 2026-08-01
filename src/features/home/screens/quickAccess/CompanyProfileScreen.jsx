import { useNavigation } from '@react-navigation/native';
import QuickAccessDetailScreen from './QuickAccessDetailScreen';
function CompanyProfileScreen() {
    const navigation = useNavigation();
    return (<QuickAccessDetailScreen color="#38bdf8" description="View and manage company profile details, business information, and account records." icon="building-o" onBackPress={() => navigation.goBack()} title="Company Profile"/>);
}
export default CompanyProfileScreen;
