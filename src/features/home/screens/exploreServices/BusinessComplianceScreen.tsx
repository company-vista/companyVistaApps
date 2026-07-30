import { useNavigation } from '@react-navigation/native';
import QuickAccessDetailScreen from '../quickAccess/QuickAccessDetailScreen';
import type { MainScreenProps } from '../../../../navigation/types';

type Nav = MainScreenProps<'BusinessCompliance'>['navigation'];

function BusinessComplianceScreen() {
  const navigation = useNavigation<Nav>();
  return (
    <QuickAccessDetailScreen
      color="#1D4ED8"
      description="Entity formation, registration, and compliance services for your business."
      icon="briefcase"
      onBackPress={() => navigation.goBack()}
      title="Business Compliance & Registrations"
    />
  );
}

export default BusinessComplianceScreen;
