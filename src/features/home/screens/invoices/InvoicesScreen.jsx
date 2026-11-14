import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BackButton from '../../../../components/buttons/BackButton';
import { useThemeColors, themePalette } from '../../../../theme/colors';
import { font } from '../../../../theme/typography';
import { s } from '../../../../theme/responsive';
import BillingTabContent from './InvoicesTabContent';

export default function InvoicesScreen({ selectedCompany, onBackPress, onInvoicePress }) {
    const colors = useThemeColors();
    const safeAreaInsets = useSafeAreaInsets();
    const isLight = colors.mode === 'light';
    return (<View style={[styles.screen, { backgroundColor: isLight ? themePalette.hex_f1f5f9 : undefined }]}>
      <View style={[styles.headerArea, { backgroundColor: isLight ? themePalette.hex_ffffff : undefined, paddingTop: safeAreaInsets.top + 12 }]}>
        <View style={styles.header}>
          <BackButton onPress={onBackPress}/>
          <Text style={[styles.title, { color: colors.text }]}>Invoices</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{
            paddingHorizontal: s(12),
            paddingBottom: safeAreaInsets.bottom + 24,
        }}>
        <BillingTabContent selectedCompany={selectedCompany} onInvoicePress={onInvoicePress}/>
      </ScrollView>
    </View>);
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    headerArea: {
        paddingHorizontal: s(12),
        paddingBottom: 12,
        marginBottom: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    title: {
        fontSize: font.title,
        fontWeight: '600',
    },
});
