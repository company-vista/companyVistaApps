import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getInvoiceStatusType } from '../dashboard/utils/dashboardFormat';

const STATUS_STYLES = {
  paid: { color: '#15803D', backgroundColor: '#DCFCE7' },
  pending: { color: '#B45309', backgroundColor: '#FEF3C7' },
  partial: { color: '#B45309', backgroundColor: '#FEF3C7' },
  overdue: { color: '#B91C1C', backgroundColor: '#FEE2E2' },
  default: { color: '#475569', backgroundColor: '#F1F5F9' },
};

const AdminRecentInvoices = ({ invoices = [], onViewAll }) => {
  return (
    <View style={styles.tableCard}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Invoices</Text>
        <TouchableOpacity onPress={onViewAll} disabled={!onViewAll}>
          <Text style={styles.viewAllText}>View all</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.invoiceRowHeader}>
        <Text style={[styles.invCol, { flex: 1.3 }]}>INVOICE #</Text>
        <Text style={[styles.invCol, { flex: 1.5 }]}>COMPANY</Text>
        <Text style={[styles.invCol, { flex: 1, textAlign: 'right' }]}>
          AMOUNT
        </Text>
        <Text style={[styles.invCol, { flex: 0.9, textAlign: 'right' }]}>
          STATUS
        </Text>
      </View>

      {invoices.length === 0 ? (
        <Text style={styles.emptyText}>No invoices yet.</Text>
      ) : (
        invoices.map(invoice => {
          const badge =
            STATUS_STYLES[getInvoiceStatusType(invoice.status)] ||
            STATUS_STYLES.default;
          return (
            <View key={invoice.id} style={styles.invoiceRow}>
              <Text
                style={[styles.invoiceText, { flex: 1.3, fontWeight: '700' }]}
                numberOfLines={1}>
                {invoice.invoiceNumber}
              </Text>
              <Text
                style={[styles.invoiceText, { flex: 1.5 }]}
                numberOfLines={1}>
                {invoice.companyName}
              </Text>
              <Text
                style={[
                  styles.invoiceText,
                  { flex: 1, textAlign: 'right', fontWeight: '700' },
                ]}
                numberOfLines={1}>
                {invoice.amount}
              </Text>
              <View style={{ flex: 0.9, alignItems: 'flex-end' }}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: badge.backgroundColor },
                  ]}>
                  <Text
                    style={[styles.statusText, { color: badge.color }]}
                    numberOfLines={1}>
                    {invoice.statusLabel}
                  </Text>
                </View>
              </View>
            </View>
          );
        })
      )}
    </View>
  );
};

export default AdminRecentInvoices;

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
  },
  viewAllText: {
    fontSize: 11,
    color: '#2563EB',
  },
  invoiceRowHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 6,
    marginBottom: 8,
  },
  invCol: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
  },
  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  invoiceText: {
    fontSize: 11,
    color: '#0F172A',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    maxWidth: 90,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    paddingVertical: 16,
  },
});
