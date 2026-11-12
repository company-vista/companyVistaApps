import { useNavigation } from '@react-navigation/native';
import QuickAccessDetailScreen from '../quickAccess/QuickAccessDetailScreen';
import { themePalette } from '../../../../theme/colors';
function BookkeepingScreen() {
    const navigation = useNavigation();
    return (<QuickAccessDetailScreen color={themePalette.hex_1d4ed8} description="Monthly reconciliation, financial reports, and bookkeeping management." icon="calculator" onBackPress={() => navigation.goBack()} title="Bookkeeping"/>);
}
export default BookkeepingScreen;
