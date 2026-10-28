import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const BADGE_STYLES = {
  success: { backgroundColor: '#DCFCE7', color: '#15803D' },
  warning: { backgroundColor: '#FEF3C7', color: '#B45309' },
  danger: { backgroundColor: '#FEE2E2', color: '#B91C1C' },
  action: { backgroundColor: '#FFEDD5', color: '#C2410C' },
};

const AdminNewCompanies = ({ companies = [], onViewAll }) => {
  return (
    <View style={styles.tableCard}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Newly Registered Companies</Text>
        <TouchableOpacity onPress={onViewAll} disabled={!onViewAll}>
          <Text style={styles.viewAllText}>View all</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tableRowHeader}>
        <Text style={[styles.tableCol, { flex: 2 }]}>COMPANY</Text>
        <Text style={[styles.tableCol, { flex: 1.2, textAlign: 'right' }]}>
          REGISTERED ON
        </Text>
      </View>

      {companies.length === 0 ? (
        <Text style={styles.emptyText}>No companies registered yet.</Text>
      ) : (
        companies.map(item => {
          const badge = BADGE_STYLES[item.statusType] || BADGE_STYLES.warning;
          return (
            <View key={item.id} style={styles.tableRow}>
              <View style={{ flex: 2, paddingRight: 8 }}>
                <Text style={styles.companyName} numberOfLines={1}>
                  {item.name}
                </Text>
                <View style={styles.metaRow}>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: badge.backgroundColor },
                    ]}>
                    <Text style={[styles.statusText, { color: badge.color }]}>
                      {item.status}
                    </Text>
                  </View>
                  <Text style={styles.stateText} numberOfLines={1}>
                    {item.state}
                  </Text>
                </View>
              </View>
              <Text style={styles.dateText}>{item.date}</Text>
            </View>
          );
        })
      )}
    </View>
  );
};

export default AdminNewCompanies;

const styles = StyleSheet.create({
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  viewAllText: {
    fontSize: 11,
    color: '#2563EB',
  },
  tableRowHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 6,
    marginBottom: 8,
  },
  tableCol: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  companyName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '600',
  },
  stateText: {
    fontSize: 9,
    color: '#94A3B8',
    marginLeft: 6,
    flex: 1,
  },
  dateText: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'right',
  },
  emptyText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    paddingVertical: 16,
  },
});
