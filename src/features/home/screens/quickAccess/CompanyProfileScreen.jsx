import { useNavigation } from '@react-navigation/native';
import QuickAccessDetailScreen from './QuickAccessDetailScreen';
import { themePalette } from '../../../../theme/colors';
function CompanyProfileScreen() {
    const navigation = useNavigation();
    return (<QuickAccessDetailScreen color={themePalette.hex_38bdf8} description="View and manage company profile details, business information, and account records." icon="building-o" onBackPress={() => navigation.goBack()} title="Company Profile"/>);
}
export default CompanyProfileScreen;
