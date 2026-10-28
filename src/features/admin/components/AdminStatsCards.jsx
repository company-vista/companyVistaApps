import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { formatCurrency } from '../dashboard/utils/dashboardFormat';

const EMPTY_CURRENCY = { INR: 0, USD: 0 };

const AdminStatsCards = ({ stats = {}, currencyTotals = {} }) => {
  const revenue = currencyTotals.revenue || EMPTY_CURRENCY;
  const pending = currencyTotals.pending || EMPTY_CURRENCY;
  const paid = currencyTotals.paid || EMPTY_CURRENCY;

  return (
    <View style={styles.gridContainer}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Total Revenue</Text>
          <View style={[styles.iconBox, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="cash-outline" size={14} color="#166534" />
          </View>
        </View>
        <View style={styles.amountRow}>
          <Text style={styles.currencyLabel}>INR</Text>
          <Text style={styles.amountText}>
            {formatCurrency(revenue.INR, 'INR')}
          </Text>
        </View>
        <View style={styles.amountRow}>
          <Text style={styles.currencyLabel}>USD</Text>
          <Text style={styles.subAmountText}>
            {formatCurrency(revenue.USD, 'USD')}
          </Text>
        </View>
        <Text style={styles.noteText}>From paid invoices</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Pending Invoices</Text>
          <View style={[styles.iconBox, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="time-outline" size={14} color="#92400E" />
          </View>
        </View>
        <Text style={styles.mainNumber}>{stats.pendingInvoices || 0}</Text>
        <View style={styles.amountRow}>
          <Text style={styles.currencyLabel}>INR</Text>
          <Text style={styles.subAmountText}>
            {formatCurrency(pending.INR, 'INR')}
          </Text>
        </View>
        <View style={styles.amountRow}>
          <Text style={styles.currencyLabel}>USD</Text>
          <Text style={styles.subAmountText}>
            {formatCurrency(pending.USD, 'USD')}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Total Clients</Text>
          <View style={[styles.iconBox, { backgroundColor: '#E0E7FF' }]}>
            <Ionicons name="people-outline" size={14} color="#3730A3" />
          </View>
        </View>
        <Text style={styles.mainNumber}>{stats.totalClients || 0}</Text>
        <Text style={styles.noteText}>Registered clients</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Paid Invoices</Text>
          <View style={[styles.iconBox, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons
              name="checkmark-circle-outline"
              size={14}
              color="#166534"
            />
          </View>
        </View>
        <Text style={styles.mainNumber}>{stats.paidInvoices || 0}</Text>
        <View style={styles.amountRow}>
          <Text style={styles.currencyLabel}>INR</Text>
          <Text style={styles.subAmountText}>
            {formatCurrency(paid.INR, 'INR')}
          </Text>
        </View>
        <View style={styles.amountRow}>
          <Text style={styles.currencyLabel}>USD</Text>
          <Text style={styles.subAmountText}>
            {formatCurrency(paid.USD, 'USD')}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default AdminStatsCards;

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    flex: 1,
    marginRight: 6,
  },
  iconBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainNumber: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  currencyLabel: {
    fontSize: 11,
    color: '#94A3B8',
  },
  amountText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  subAmountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  noteText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 10,
  },
});
