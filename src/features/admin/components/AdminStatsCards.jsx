import { font } from '../../../theme/typography';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { formatCurrency } from '../dashboard/utils/dashboardFormat';
import { useThemeColors } from '../../../theme/colors';

const EMPTY_CURRENCY = { INR: 0, USD: 0 };

const AdminStatsCards = ({ stats = {}, currencyTotals = {} }) => {
  const colors = useThemeColors();
  const revenue = currencyTotals.revenue || EMPTY_CURRENCY;
  const pending = currencyTotals.pending || EMPTY_CURRENCY;
  const paid = currencyTotals.paid || EMPTY_CURRENCY;

  return (
    <View style={styles.gridContainer}>
      <View style={[styles.card, { backgroundColor: colors.cardHighlight, borderColor: colors.border, shadowColor: colors.shadow }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.muted }]}>Total Revenue</Text>
          <View style={[styles.iconBox, { backgroundColor: colors.accentSoft }]}>
            <Ionicons name="cash-outline" size={14} color={colors.accent} />
          </View>
        </View>
        <View style={styles.amountRow}>
          <Text style={[styles.currencyLabel, { color: colors.subtle }]}>INR</Text>
          <Text style={[styles.amountText, { color: colors.text }]}>
            {formatCurrency(revenue.INR, 'INR')}
          </Text>
        </View>
        <View style={styles.amountRow}>
          <Text style={[styles.currencyLabel, { color: colors.subtle }]}>USD</Text>
          <Text style={[styles.subAmountText, { color: colors.text }]}>
            {formatCurrency(revenue.USD, 'USD')}
          </Text>
        </View>
        <Text style={[styles.noteText, { color: colors.subtle }]}>From paid invoices</Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.cardHighlight, borderColor: colors.border, shadowColor: colors.shadow }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.muted }]}>Pending Invoices</Text>
          <View style={[styles.iconBox, { backgroundColor: colors.sheet }]}>
            <Ionicons name="time-outline" size={14} color={colors.muted} />
          </View>
        </View>
        <Text style={[styles.mainNumber, { color: colors.text }]}>
          {stats.pendingInvoices || 0}
        </Text>
        <View style={styles.amountRow}>
          <Text style={[styles.currencyLabel, { color: colors.subtle }]}>INR</Text>
          <Text style={[styles.subAmountText, { color: colors.text }]}>
            {formatCurrency(pending.INR, 'INR')}
          </Text>
        </View>
        <View style={styles.amountRow}>
          <Text style={[styles.currencyLabel, { color: colors.subtle }]}>USD</Text>
          <Text style={[styles.subAmountText, { color: colors.text }]}>
            {formatCurrency(pending.USD, 'USD')}
          </Text>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.cardHighlight, borderColor: colors.border, shadowColor: colors.shadow }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.muted }]}>Total Clients</Text>
          <View style={[styles.iconBox, { backgroundColor: colors.accentSoft }]}>
            <Ionicons name="people-outline" size={14} color={colors.accent} />
          </View>
        </View>
        <Text style={[styles.mainNumber, { color: colors.text }]}>
          {stats.totalClients || 0}
        </Text>
        <Text style={[styles.noteText, { color: colors.subtle }]}>
          Registered clients
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.cardHighlight, borderColor: colors.border, shadowColor: colors.shadow }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.muted }]}>Paid Invoices</Text>
          <View style={[styles.iconBox, { backgroundColor: colors.accentSoft }]}>
            <Ionicons
              name="checkmark-circle-outline"
              size={14}
              color={colors.accent}
            />
          </View>
        </View>
        <Text style={[styles.mainNumber, { color: colors.text }]}>
          {stats.paidInvoices || 0}
        </Text>
        <View style={styles.amountRow}>
          <Text style={[styles.currencyLabel, { color: colors.subtle }]}>INR</Text>
          <Text style={[styles.subAmountText, { color: colors.text }]}>
            {formatCurrency(paid.INR, 'INR')}
          </Text>
        </View>
        <View style={styles.amountRow}>
          <Text style={[styles.currencyLabel, { color: colors.subtle }]}>USD</Text>
          <Text style={[styles.subAmountText, { color: colors.text }]}>
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
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    elevation: 1,
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
    fontSize: font.sm,
    fontWeight: '600',
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
    fontSize: font.displayLarge,
    fontWeight: '800',
    marginBottom: 6,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  currencyLabel: {
    fontSize: font.small,
  },
  amountText: {
    fontSize: font.bodySmall,
    fontWeight: '700',
  },
  subAmountText: {
    fontSize: font.sm,
    fontWeight: '600',
  },
  noteText: {
    fontSize: font.xs,
    marginTop: 10,
  },
});
