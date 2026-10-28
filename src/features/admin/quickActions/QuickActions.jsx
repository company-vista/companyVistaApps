import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const QUICK_ACTIONS = [
  { key: 'create-invoice', title: 'Create Invoice', icon: '📄' },
  { key: 'add-client', title: 'Add Client', icon: '👤' },
  { key: 'record-payment', title: 'Payment Record', icon: '💳' },
  { key: 'add-expense', title: 'Add Expense', icon: '💸' },
];

const QuickActions = () => {
  const handlePress = () => {};

  return (
    <View style={styles.quickActionsSection}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.grid}>
        {QUICK_ACTIONS.map(action => (
          <TouchableOpacity
            key={action.key}
            style={styles.card}
            activeOpacity={0.7}
            onPress={handlePress}>
            <View style={styles.cardIconWrap}>
              <Text style={styles.cardIcon}>{action.icon}</Text>
            </View>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {action.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default QuickActions;

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  quickActionsSection: {
    marginTop: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
    paddingTop: 10,
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
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  cardIcon: {
    fontSize: 22,
  },
  cardTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    marginTop: 4,
    width: 64,
    minHeight: 24,
  },
});
