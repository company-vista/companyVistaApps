import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const cards = [
  { key: 'invoices', title: 'Invoices', icon: '📄' },
  { key: 'estimates', title: 'Estimates', icon: '🧾' },
  // { key: 'payments', title: 'Payment records', icon: '💳' },
  // { key: 'expenses', title: 'Expenses', icon: '💸' },
];

const AdminFinanceScreen = ({ showHeader = true }) => {
  const navigation = useNavigation();

  const handlePress = (item) => {
    // Placeholder navigation - can be updated when screens exist
    // navigation.navigate(item.key);
  };

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Finance</Text>
        </View>
      )}
      <View style={[styles.grid, !showHeader && styles.gridCompact]}>
        {cards.map(item => (
          <TouchableOpacity
            key={item.key}
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => handlePress(item)}>
            <View style={[styles.cardIconWrap, item.key === 'payments' && { paddingTop: 2 }]}>
              <Text style={styles.cardIcon}>{item.icon}</Text>
            </View>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default AdminFinanceScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  gridCompact: {
    paddingHorizontal: 0,
    paddingTop: 6,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 20,
  },
  card: {
    width: 64,
    backgroundColor: 'transparent',
    alignItems: 'center',
    marginBottom: 16,
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
    padding: 0,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  cardIcon: {
    fontSize: 28,
  },
  cardTitle: {
    fontSize: 10,
    fontWeight: '500',
    color: '#1E293B',
    textAlign: 'center',
    marginTop: 4,
    width: 66,
    minHeight: 24,
  },
});
