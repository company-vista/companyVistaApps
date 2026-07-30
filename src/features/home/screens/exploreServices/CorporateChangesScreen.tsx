import { useNavigation } from '@react-navigation/native';
import QuickAccessDetailScreen from '../quickAccess/QuickAccessDetailScreen';
import type { MainScreenProps } from '../../../../navigation/types';

type Nav = MainScreenProps<'CorporateChanges'>['navigation'];

function CorporateChangesScreen() {
  const navigation = useNavigation<Nav>();
  return (
    <QuickAccessDetailScreen
      color="#DC2626"
      description="Corporate amendments, legal documentation, and registered agent changes."
      icon="file-text-o"
      onBackPress={() => navigation.goBack()}
      title="Corporate Changes & Legal Documentation"
    />
  );
}

export default CorporateChangesScreen;
