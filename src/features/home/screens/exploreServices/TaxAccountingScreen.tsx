import { useNavigation } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BackButton from '../../../../components/buttons/BackButton';
import { useThemeColors } from '../../../../theme/colors';
import type { MainScreenProps } from '../../../../navigation/types';
import { ServiceCard } from './ServicesCard';

type Nav = MainScreenProps<'TaxAccounting'>['navigation'];

function TaxAccountingScreen() {
  const navigation = useNavigation<Nav>();
  const colors = useThemeColors();
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: safeAreaInsets.top + 22 }]}>
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={[styles.heading, { color: colors.text }]}>Tax & Accounting Services</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(safeAreaInsets.bottom, 24) }}>
        <ServiceCard
          title="Annual Tax Filing"
          price="$299"
          description="Complete federal and state tax preparation and filing for your business."
          onRequestQuote={() => {}}
          onPayNow={() => {}}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  heading: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 12,
  },
});

export default TaxAccountingScreen;
