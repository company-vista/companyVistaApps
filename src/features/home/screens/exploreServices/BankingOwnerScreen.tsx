import { useNavigation } from '@react-navigation/native';
import QuickAccessDetailScreen from '../quickAccess/QuickAccessDetailScreen';
import type { MainScreenProps } from '../../../../navigation/types';

type Nav = MainScreenProps<'BankingOwner'>['navigation'];

function BankingOwnerScreen() {
  const navigation = useNavigation<Nav>();
  return (
    <QuickAccessDetailScreen
      color="#7C3AED"
      description="Banking solutions and owner services to manage your business accounts."
      icon="university"
      onBackPress={() => navigation.goBack()}
      title="Banking & Owner Services"
    />
  );
}

export default BankingOwnerScreen;
