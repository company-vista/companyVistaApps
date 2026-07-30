import { useNavigation } from '@react-navigation/native';
import QuickAccessDetailScreen from '../quickAccess/QuickAccessDetailScreen';
import type { MainScreenProps } from '../../../../navigation/types';

type Nav = MainScreenProps<'ComplianceCheck'>['navigation'];

function ComplianceCheckScreen() {
  const navigation = useNavigation<Nav>();
  return (
    <QuickAccessDetailScreen
      color="#7C3AED"
      description="Stay ahead of filing deadlines with proactive compliance monitoring."
      icon="check-square-o"
      onBackPress={() => navigation.goBack()}
      title="Compliance Check"
    />
  );
}

export default ComplianceCheckScreen;
