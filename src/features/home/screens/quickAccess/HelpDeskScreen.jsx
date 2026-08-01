import { useNavigation } from '@react-navigation/native';
import QuickAccessDetailScreen from './QuickAccessDetailScreen';
function HelpDeskScreen() {
    const navigation = useNavigation();
    return (<QuickAccessDetailScreen color="#22c55e" description="Get support, raise help requests, and find answers for common service questions." icon="comments-o" onBackPress={() => navigation.goBack()} title="Help Desk"/>);
}
export default HelpDeskScreen;
