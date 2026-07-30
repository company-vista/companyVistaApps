import { useNavigation } from '@react-navigation/native';
import QuickAccessDetailScreen from '../quickAccess/QuickAccessDetailScreen';
import type { MainScreenProps } from '../../../../navigation/types';

type Nav = MainScreenProps<'Bookkeeping'>['navigation'];

function BookkeepingScreen() {
  const navigation = useNavigation<Nav>();
  return (
    <QuickAccessDetailScreen
      color="#1D4ED8"
      description="Monthly reconciliation, financial reports, and bookkeeping management."
      icon="calculator"
      onBackPress={() => navigation.goBack()}
      title="Bookkeeping"
    />
  );
}

export default BookkeepingScreen;
