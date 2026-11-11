import { font } from '../../../theme/typography';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const services = [
  { key: 'change-requests', title: 'Change Requests', icon: '📝' },
  { key: 'itin-apps', title: 'ITIN Apps', icon: '🪪' },
  { key: 'bank-accounts', title: 'Bank Accounts', icon: '🏦' },
  { key: 'company-claims', title: 'Company Claims', icon: '🏢' },
];

const AdminServicesSection = () => (
  <View style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Services</Text>
    </View>
    <View style={styles.grid}>
      {services.map(item => (
        <TouchableOpacity
          key={item.key}
          style={styles.card}
          activeOpacity={0.7}>
          <View style={styles.cardIconWrap}>
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

export default AdminServicesSection;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    marginTop: 16,
  },
  header: {
    paddingBottom: 0,
  },
  headerTitle: {
    fontSize: font.base,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
    paddingTop: 6,
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
    fontSize: font.displayXL,
  },
  cardTitle: {
    fontSize: font.xs,
    fontWeight: '500',
    color: '#1E293B',
    textAlign: 'center',
    marginTop: 4,
    width: 66,
    minHeight: 24,
  },
});
