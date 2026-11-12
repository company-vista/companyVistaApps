import { useNavigation } from '@react-navigation/native';
import QuickAccessDetailScreen from '../quickAccess/QuickAccessDetailScreen';
import { themePalette } from '../../../../theme/colors';
function ComplianceCheckScreen() {
    const navigation = useNavigation();
    return (<QuickAccessDetailScreen color={themePalette.hex_7c3aed} description="Stay ahead of filing deadlines with proactive compliance monitoring." icon="check-square-o" onBackPress={() => navigation.goBack()} title="Compliance Check"/>);
}
export default ComplianceCheckScreen;
