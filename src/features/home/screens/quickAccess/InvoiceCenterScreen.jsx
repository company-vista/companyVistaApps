import { useNavigation } from '@react-navigation/native';
import QuickAccessDetailScreen from './QuickAccessDetailScreen';
import { themePalette } from '../../../../theme/colors';
function InvoiceCenterScreen() {
    const navigation = useNavigation();
    return (<QuickAccessDetailScreen color={themePalette.hex_4f7cff} description="Track invoices, payment status, billing records, and recent invoice activity." icon="file-text-o" onBackPress={() => navigation.goBack()} title="Invoice Center"/>);
}
export default InvoiceCenterScreen;
