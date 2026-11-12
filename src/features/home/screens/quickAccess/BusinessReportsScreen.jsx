import { useNavigation } from '@react-navigation/native';
import QuickAccessDetailScreen from './QuickAccessDetailScreen';
import { themePalette } from '../../../../theme/colors';
function BusinessReportsScreen() {
    const navigation = useNavigation();
    return (<QuickAccessDetailScreen color={themePalette.hex_f59e0b} description="Review business reports, summaries, and performance insights for your account." icon="bar-chart" onBackPress={() => navigation.goBack()} title="Business Reports"/>);
}
export default BusinessReportsScreen;
