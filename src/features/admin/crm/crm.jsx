import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { font } from '../../../theme/typography';

const CRM_CARDS = [
  { key: 'vista-leads', title: 'Vista Leads', icon: 'people-outline', screen: 'CompanyVistaLeads' },
  { key: 'add-expense', title: 'Add Expense', icon: 'wallet-outline', screen: 'AdminAddExpense' },
];

const CRM = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 16,
          paddingLeft: insets.left + 16,
          paddingRight: insets.right + 16,
        },
      ]}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={21} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.sectionTitle}>CRM</Text>
      </View>
      <View style={styles.grid}>
        {CRM_CARDS.map(card => (
          <TouchableOpacity
            key={card.key}
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => navigation.navigate(card.screen)}>
            <View style={styles.cardIconWrap}>
              <Ionicons name={card.icon} size={font.displayMedium} color="#4F46E5" />
            </View>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {card.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default CRM;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    backgroundColor: '#F8FAFC',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: font.base,
    fontWeight: '700',
    color: '#0F172A',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 20,
    rowGap: 8,
    paddingTop: 18,
  },
  card: {
    width: 64,
    backgroundColor: 'transparent',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardIconWrap: {
    width: 64,
    height: 64,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  cardTitle: {
    fontSize: font.xs,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    marginTop: 4,
    width: 64,
    minHeight: 24,
  },
});
