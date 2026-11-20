import { font } from '../../../theme/typography';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getInvoiceStatusType } from '../dashboard/utils/dashboardFormat';
import { useThemeColors } from '../../../theme/colors';

const getStatusStyles = colors => ({
  paid: { color: colors.accent, backgroundColor: colors.accentSoft },
  pending: { color: colors.muted, backgroundColor: colors.sheet },
  partial: { color: colors.muted, backgroundColor: colors.sheet },
  overdue: { color: colors.danger, backgroundColor: colors.sheet },
  default: { color: colors.muted, backgroundColor: colors.sheet },
});

const AdminRecentInvoices = ({ invoices = [], onViewAll }) => {
  const colors = useThemeColors();
  const statusStyles = getStatusStyles(colors);

  return (
    <View
      style={[
        styles.tableCard,
        {
          backgroundColor: colors.cardHighlight,
          borderColor: colors.border,
        },
      ]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Recent Invoices
        </Text>
        <TouchableOpacity onPress={onViewAll} disabled={!onViewAll}>
          <Text style={[styles.viewAllText, { color: colors.accent }]}>
            View all
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.invoiceRowHeader, { borderBottomColor: colors.border }]}>
        <Text style={[styles.invCol, { flex: 1.3, color: colors.subtle }]}>
          INVOICE #
        </Text>
        <Text style={[styles.invCol, { flex: 1.5, color: colors.subtle }]}>
          COMPANY
        </Text>
        <Text
          style={[
            styles.invCol,
            { flex: 1, textAlign: 'right', color: colors.subtle },
          ]}>
          AMOUNT
        </Text>
        <Text
          style={[
            styles.invCol,
            { flex: 0.9, textAlign: 'right', color: colors.subtle },
          ]}>
          STATUS
        </Text>
      </View>

      {invoices.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.muted }]}>
          No invoices yet.
        </Text>
      ) : (
        invoices.map(invoice => {
          const badge =
            statusStyles[getInvoiceStatusType(invoice.status)] ||
            statusStyles.default;
          return (
            <View key={invoice.id} style={styles.invoiceRow}>
              <Text
                style={[
                  styles.invoiceText,
                  { flex: 1.3, fontWeight: '700', color: colors.text },
                ]}
                numberOfLines={1}>
                {invoice.invoiceNumber}
              </Text>
              <Text
                style={[styles.invoiceText, { flex: 1.5, color: colors.text }]}
                numberOfLines={1}>
                {invoice.companyName}
              </Text>
              <Text
                style={[
                  styles.invoiceText,
                  {
                    flex: 1,
                    textAlign: 'right',
                    fontWeight: '700',
                    color: colors.text,
                  },
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
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: font.base,
    fontWeight: '700',
  },
  viewAllText: {
    fontSize: font.small,
  },
  invoiceRowHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingBottom: 6,
    marginBottom: 8,
  },
  invCol: {
    fontSize: font.caption,
    fontWeight: '700',
  },
  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  invoiceText: {
    fontSize: font.small,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    maxWidth: 90,
  },
  statusText: {
    fontSize: font.caption,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: font.sm,
    textAlign: 'center',
    paddingVertical: 16,
  },
});
