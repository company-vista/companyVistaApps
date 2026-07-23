import { useNavigation } from '@react-navigation/native';
import QuickAccessDetailScreen from './QuickAccessDetailScreen';
import type { MainScreenProps } from '../../../../navigation/types';

type Nav = MainScreenProps<'HelpDesk'>['navigation'];

function HelpDeskScreen() {
  const navigation = useNavigation<Nav>();
  return (
    <QuickAccessDetailScreen
      color="#22c55e"
      description="Get support, raise help requests, and find answers for common service questions."
      icon="comments-o"
      onBackPress={() => navigation.goBack()}
      title="Help Desk"
    />
  );
}

export default HelpDeskScreen;
