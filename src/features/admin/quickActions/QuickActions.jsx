import { font } from '../../../theme/typography';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

export const QUICK_ACTIONS = [
  { key: 'create-invoice', title: 'Create Invoice', icon: 'document-text-outline' },
  { key: 'add-client', title: 'Clients', icon: 'people-outline' },
  { key: 'crm', title: 'CRM', icon: 'briefcase-outline' },
  // { key: 'record-payment', title: 'Payment record', icon: 'card-outline' },
  { key: 'blogs', title: 'Blogs', icon: 'newspaper-outline' },
];

const QuickActions = () => {
  const navigation = useNavigation();
  const handlePress = action => {
    if (action.key === 'create-invoice') {
      navigation.navigate('AdminCreateInvoice');
    } else if (action.key === 'add-client') {
      navigation.navigate('AdminClients');
    } else if (action.key === 'crm') {
      navigation.navigate('AdminCRM');
    } else if (action.key === 'blogs') {
      navigation.navigate('AdminBlogs');
    }
  };

  return (
    <View style={styles.quickActionsSection}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.grid}>
        {QUICK_ACTIONS.map(action => (
          <TouchableOpacity
            key={action.key}
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => handlePress(action)}>
            <View style={styles.cardIconWrap}>
              <Ionicons name={action.icon} size={font.displayMedium} color="#4F46E5" />
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
    fontSize: font.base,
    fontWeight: '700',
    color: '#0F172A',
  },
  quickActionsSection: {
    marginTop: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: 10,
    columnGap: 20,
    rowGap: 8,
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
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    // borderWidth: 1,
    // borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  cardTitle: {
    fontSize: font.sm,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    marginTop: 4,
    width: 64,
    minHeight: 24,
  },
});
