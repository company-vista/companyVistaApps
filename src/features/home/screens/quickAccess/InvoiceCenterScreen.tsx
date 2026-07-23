import { useNavigation } from '@react-navigation/native';
import QuickAccessDetailScreen from './QuickAccessDetailScreen';
import type { MainScreenProps } from '../../../../navigation/types';

type Nav = MainScreenProps<'InvoiceCenter'>['navigation'];

function InvoiceCenterScreen() {
  const navigation = useNavigation<Nav>();
  return (
    <QuickAccessDetailScreen
      color="#4f7cff"
      description="Track invoices, payment status, billing records, and recent invoice activity."
      icon="file-text-o"
      onBackPress={() => navigation.goBack()}
      title="Invoice Center"
    />
  );
}

export default InvoiceCenterScreen;
