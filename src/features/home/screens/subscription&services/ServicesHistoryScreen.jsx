import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BackButton from '../../../../components/buttons/BackButton';
import { useThemeColors } from '../../../../theme/colors';
import { font } from '../../../../theme/typography';
import ServiceCard from './ServiceCard';

const SERVICE_HISTORY = [
  {
    id: '1',
    title: 'CPA / Tax Consultation',
    isPaid: true,
    paymentType: 'Direct Payment',
    companyName: 'test',
    requestedDate: 'Jul 13, 2026',
    amount: '$149',
    icon: 'chatbubbles-outline',
  },
  {
    id: '2',
    title: 'EIN Application',
    isPaid: true,
    paymentType: 'Subscription',
    companyName: 'Company Vista LLC',
    requestedDate: 'Jul 10, 2026',
    amount: '$349',
    icon: 'finger-print-outline',
  },
  {
    id: '3',
    title: 'Operating Agreement Preparation',
    isPaid: false,
    paymentType: 'Direct Payment',
    companyName: 'test',
    requestedDate: 'Jul 5, 2026',
    amount: '$299',
    icon: 'document-text-outline',
  },
];

export default function ServicesHistoryScreen({ onBackPress }) {
  const colors = useThemeColors();
  const safeAreaInsets = useSafeAreaInsets();
  const isLight = colors.mode === 'light';
  return (
    <View style={[styles.screen, { backgroundColor: isLight ? '#F1F5F9' : undefined }]}>
      <View style={[styles.headerArea, { backgroundColor: isLight ? '#ffffff' : undefined, paddingTop: safeAreaInsets.top + 12 }]}>
        <View style={styles.header}>
          <BackButton onPress={onBackPress} />
          <Text style={[styles.title, { color: colors.text }]}>Services History</Text>
        </View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: safeAreaInsets.bottom + 24 }}>
        {SERVICE_HISTORY.map((service) => (
          <ServiceCard
            key={service.id}
            title={service.title}
            isPaid={service.isPaid}
            paymentType={service.paymentType}
            companyName={service.companyName}
            requestedDate={service.requestedDate}
            amount={service.amount}
            icon={service.icon}
            isLight={isLight}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  headerArea: {
    paddingHorizontal: 20,
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
