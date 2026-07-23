import { useNavigation } from '@react-navigation/native';
import QuickAccessDetailScreen from './QuickAccessDetailScreen';
import type { MainScreenProps } from '../../../../navigation/types';

type Nav = MainScreenProps<'BusinessReports'>['navigation'];

function BusinessReportsScreen() {
  const navigation = useNavigation<Nav>();
  return (
    <QuickAccessDetailScreen
      color="#f59e0b"
      description="Review business reports, summaries, and performance insights for your account."
      icon="bar-chart"
      onBackPress={() => navigation.goBack()}
      title="Business Reports"
    />
  );
}

export default BusinessReportsScreen;
