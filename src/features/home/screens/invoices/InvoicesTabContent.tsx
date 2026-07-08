import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { useThemeColors, type AppTheme } from '../../../../theme/colors';
import {
  fetchInvoicesForCompany,
  selectHasLoadedInvoicesForCompany,
  selectInvoicesForCompany,
} from '../../../../store/slices/invoicesSlice';
import type { ClientInvoice } from '../../api/clientInvoicesApi';
import type { CompanyCardItem } from '../quickAccess/CompanyCard';

type Invoice = {
  amount: string;
  company: string;
  created: string;
  due: string;
  id: string;
  raw: ClientInvoice;
  status: 'paid' | 'overdue';
  statusText: string;
};

const HOME_HERO_COLORS = {
  panel: '#0D2137',
  accentBlue: '#85B7EB',
  accentYellow: '#FAC775',
  white: '#ffffff',
};

function getInvoicePalette(colors: AppTheme) {
  const isDark = colors.mode === 'dark';

  return {
    primaryText: isDark ? colors.text : HOME_HERO_COLORS.panel,
    accentText: isDark ? HOME_HERO_COLORS.accentBlue : '#2F6FAE',
    actionSurface: isDark ? '#183A5C' : '#EAF4FF',
    actionBorder: isDark ? 'rgba(133,183,235,0.35)' : '#C7DFF6',
    iconSurface: isDark ? 'rgba(133,183,235,0.14)' : '#EAF4FF',
    iconColor: isDark ? HOME_HERO_COLORS.accentBlue : HOME_HERO_COLORS.panel,
    buttonText: isDark ? HOME_HERO_COLORS.accentBlue : HOME_HERO_COLORS.panel,
    link: isDark ? HOME_HERO_COLORS.accentYellow : '#9A640F',
  };
}

type BillingTabContentProps = {
  onInvoicePress?: (invoice: ClientInvoice) => void;
  onGoHome?: () => void;
  selectedCompany?: CompanyCardItem | null;
};

function getStringValue(...values: unknown[]) {
  const value = values.find(candidate => (
    typeof candidate === 'string' && candidate.trim().length > 0
  ));

  return typeof value === 'string' ? value.trim() : '';
}

function getNumberValue(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string') {
      const parsed = Number(value.replace(/[^0-9.-]/g, ''));

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return 0;
}

function getNestedRecord(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;
}

function formatDate(value: unknown) {
  const rawDate = getStringValue(value);

  if (!rawDate) {
    return 'N/A';
  }

  const date = new Date(rawDate);

  if (Number.isNaN(date.getTime())) {
    return rawDate;
  }

  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatAmount(value: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    currency,
    style: 'currency',
  }).format(value);
}

function normalizeCompanyId(value: unknown) {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value).trim();
  }

  const record = getNestedRecord(value);

  return getStringValue(record?._id, record?.id);
}

function getInvoiceCompany(invoice: ClientInvoice) {
  const company =
    getNestedRecord(invoice.company) ??
    getNestedRecord(invoice.companyId) ??
    getNestedRecord(invoice.clientCompany) ??
    getNestedRecord(invoice.client);

  return {
    id: getStringValue(
      normalizeCompanyId(invoice.companyId),
      normalizeCompanyId(invoice.company),
      normalizeCompanyId(invoice.clientCompanyId),
      normalizeCompanyId(invoice.clientCompany),
      normalizeCompanyId(invoice.clientId),
      normalizeCompanyId(company),
      company?._id,
      company?.id,
    ),
    name: getStringValue(
      invoice.companyName,
      invoice.businessName,
      invoice.clientCompanyName,
      company?.companyName,
      company?.businessName,
      company?.legalName,
      company?.name,
    ),
  };
}

function getInvoiceAmount(invoice: ClientInvoice) {
  return getNumberValue(
    invoice.totalAmount,
    invoice.amount,
    invoice.grandTotal,
    invoice.total,
    invoice.balance,
  );
}

function getInvoiceStatus(invoice: ClientInvoice): Invoice['status'] {
  const status = getStringValue(
    invoice.status,
    invoice.paymentStatus,
    invoice.invoiceStatus,
  ).toLowerCase();
  const dueDate = getStringValue(invoice.dueDate, invoice.due, invoice.due_at);
  const isDueOver = dueDate ? new Date(dueDate).getTime() < Date.now() : false;

  if (status.includes('overdue') || (!status.includes('paid') && isDueOver)) {
    return 'overdue';
  }

  return 'paid';
}

function getOverdueText(invoice: ClientInvoice) {
  const dueDate = getStringValue(invoice.dueDate, invoice.due, invoice.due_at);

  if (!dueDate) {
    return 'Overdue';
  }

  const dueTime = new Date(dueDate).getTime();

  if (Number.isNaN(dueTime)) {
    return 'Overdue';
  }

  const overdueDays = Math.max(
    1,
    Math.ceil((Date.now() - dueTime) / (1000 * 60 * 60 * 24)),
  );

  return `${overdueDays} Day${overdueDays === 1 ? '' : 's'} Overdue`;
}

function mapInvoice(invoice: ClientInvoice): Invoice {
  const invoiceCompany = getInvoiceCompany(invoice);
  const status = getInvoiceStatus(invoice);
  const currency = getStringValue(invoice.currency, invoice.currencyCode) || 'USD';

  return {
    amount: formatAmount(getInvoiceAmount(invoice), currency),
    company: invoiceCompany.name || 'Company',
    created: formatDate(invoice.createdAt ?? invoice.created_at ?? invoice.invoiceDate),
    due: formatDate(invoice.dueDate ?? invoice.due ?? invoice.due_at),
    id: getStringValue(
      invoice.invoiceNumber,
      invoice.invoiceNo,
      invoice.number,
      invoice._id,
      invoice.id,
    ) || 'Invoice',
    raw: invoice,
    status,
    statusText: status === 'paid' ? 'Fully Paid' : getOverdueText(invoice),
  };
}

function invoiceMatchesCompany(
  invoice: ClientInvoice,
  selectedCompany?: CompanyCardItem | null,
) {
  if (!selectedCompany) {
    return false;
  }

  const companyObj = getNestedRecord(invoice.company);

  if (!companyObj) {
    return false;
  }

  const companyId = getStringValue(companyObj._id, companyObj.id);
  const companyName = getStringValue(
    companyObj.companyName,
    companyObj.businessName,
    companyObj.legalName,
    companyObj.name,
  );

  const matchesCompany =
    (companyId && companyId === selectedCompany.id) ||
    (companyName && companyName.toLowerCase() === selectedCompany.name.toLowerCase());

  if (!matchesCompany) {
    return false;
  }

  const status = getStringValue(
    invoice.status,
    invoice.paymentStatus,
    invoice.invoiceStatus,
  ).toLowerCase();

  if (!status.includes('sent')) {
    return false;
  }

  return true;
}

function BillingTabContent({ onInvoicePress, onGoHome, selectedCompany }: BillingTabContentProps) {
  const colors = useThemeColors();
  const palette = getInvoicePalette(colors);
  const styles = getStyles(colors);
  const dispatch = useAppDispatch();
  const token = useAppSelector(state => state.auth.token);
  const isLoading = useAppSelector(state => state.invoices.isLoading);
  const errorMessage = useAppSelector(state => state.invoices.errorMessage);
  const apiInvoices = useAppSelector(state =>
    selectInvoicesForCompany(state, selectedCompany?.id),
  );
  const hasLoadedInvoices = useAppSelector(state =>
    selectHasLoadedInvoicesForCompany(state, selectedCompany?.id),
  );
  const [searchQuery, setSearchQuery] = useState('');
  const visibleApiInvoices = useMemo(
    () => apiInvoices.filter(invoice => invoiceMatchesCompany(invoice, selectedCompany)),
    [apiInvoices, selectedCompany],
  );
  const invoices = useMemo(() => {
    const mapped = visibleApiInvoices.map(mapInvoice);
    const query = searchQuery.trim();
    if (!query) {
      return mapped;
    }
    const digitsOnly = query.replace(/[^0-9.]/g, '');
    return mapped.filter(inv => {
      const lastFour = inv.id.replace(/\D/g, '').slice(-4);
      if (lastFour === query.replace(/\D/g, '')) {
        return true;
      }
      const amountOnly = inv.amount.replace(/[^0-9.]/g, '');
      if (digitsOnly && amountOnly.includes(digitsOnly)) {
        return true;
      }
      return false;
    });
  }, [visibleApiInvoices, searchQuery]);

  useEffect(() => {
    if (!selectedCompany?.id || !token || hasLoadedInvoices) {
      return;
    }

    dispatch(fetchInvoicesForCompany({ companyId: selectedCompany.id, token }));
  }, [dispatch, hasLoadedInvoices, selectedCompany?.id, token]);

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View >
          <Text style={styles.title}>Invoices</Text>
          <Text style={styles.companyName}>
            Company name: {selectedCompany?.name ?? 'All companies'}
          </Text>
        </View>
      </View>

      <View style={styles.searchRow}>
        <View
          style={[
            styles.searchBox,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}>
          <FontAwesome name="search" size={17} color={palette.accentText} />
          <TextInput
            editable={!isLoading}
            placeholder="Search by invoice no. or amount"
            placeholderTextColor={colors.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>
        <View
          style={[
            styles.filterButton,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}>
          <FontAwesome name="filter" size={17} color={palette.iconColor} />
          <Text style={styles.filterText}>Filters</Text>
        </View>
      </View>

      <View style={styles.listHeader}>
        <View>
          <Text style={[styles.foundSubtitle, { color: colors.muted }]}>
            {isLoading
              ? 'Loading invoices...'
              : `Showing ${invoices.length} invoice${invoices.length === 1 ? '' : 's'}`}
          </Text>
        </View>
        <View style={styles.sortRow}>
          <Text style={[styles.sortLabel, { color: colors.muted }]}>Sort by:</Text>
          <Text style={styles.sortValue}>Newest</Text>
          <FontAwesome name="angle-down" size={18} color={palette.accentText} />
        </View>
      </View>

      <View style={styles.invoiceList}>
        {isLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color={palette.accentText} />
            <Text style={[styles.stateText, { color: colors.muted }]}>
              Loading invoices...
            </Text>
          </View>
        ) : null}
        {!isLoading && errorMessage ? (
          <Text style={[styles.stateText, { color: colors.danger }]}>
            {errorMessage}
          </Text>
        ) : null}
        {!isLoading && !errorMessage && !selectedCompany?.id ? (
          <Text style={[styles.stateText, { color: colors.muted }]}>
            Select a company from the home page to view invoices.
          </Text>
        ) : null}
        {!isLoading && !errorMessage && selectedCompany?.id && invoices.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.stateText, { color: colors.muted }]}>
            No invoices found for this company.
          </Text>
            <Pressable 
              onPress={() => {
                onGoHome?.();
              }}
              style={styles.homeButton}
            >
              <Text style={styles.text}>Go To Home</Text>
            </Pressable>
          </View>
        ) : null}
        {!isLoading && invoices.map(invoice => {
          const isOverdue = invoice.status === 'overdue';
          const statusColor = isOverdue ? '#dc2626' : '#16a34a';
          const statusBackground = isOverdue ? '#fee2e2' : '#dcfce7';

          return (
            <View
              key={invoice.id}
              style={[
                styles.invoiceCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  shadowColor: colors.shadow,
                },
              ]}>
              <View style={styles.invoiceLeft}>
                <View style={styles.invoiceIcon}>
                  <FontAwesome name="building-o" size={22} color={palette.iconColor} />
                </View>
                <View style={styles.invoiceCopy}>
                  <Text style={styles.invoiceId}>
                    {invoice.id}
                  </Text>
                  <Text style={styles.invoiceCompany}>
                    {invoice.company}
                  </Text>
                  <View style={styles.metaRow}>
                    <FontAwesome name="calendar" size={13} color={palette.accentText} />
                    <Text style={styles.metaText}>
                      Created: {invoice.created}
                    </Text>
                  </View>
                  <View style={styles.metaRow}>
                    <FontAwesome name="calendar" size={13} color={palette.accentText} />
                    <Text
                      style={[
                        styles.metaText,
                        isOverdue ? styles.overdueDueText : styles.paidDueText,
                      ]}>
                      Due: {invoice.due}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.invoiceRight}>
                <Text style={styles.amount}>
                  {invoice.amount}
                </Text>
                <View style={styles.statusActionRow}>
                  <View style={[styles.statusPill, { backgroundColor: statusBackground }]}>
                    <Text style={[styles.statusText, { color: statusColor }]}>
                      {isOverdue ? 'Overdue' : 'Paid'}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => onInvoicePress?.(invoice.raw)}
                    style={styles.actionButton}>
                    <FontAwesome name="eye" size={15} color={palette.iconColor} />
                  </Pressable>
                </View>
                <Text style={[styles.statusDetail, { color: statusColor }]}>
                  {invoice.statusText}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const getStyles = (colors: AppTheme) => {
  const palette = getInvoicePalette(colors);

  return StyleSheet.create({
  container: {
    paddingTop: 2,
  },
  titleRow: {
    marginBottom: 4,
  },
  title: {
    color: palette.primaryText,
    fontSize: 18,
    fontWeight: '400',
    letterSpacing: 0,
  },
  companyName: {
    color: palette.accentText,
    fontSize: 16,
    fontWeight: '500',
    marginTop: 4,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  searchBox: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    height: 50,
    paddingHorizontal: 14,
  },
  searchInput: {
    color: palette.primaryText,
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    marginLeft: 12,
    padding: 0,
  },
  filterButton: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    height: 50,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  filterText: {
    color: palette.buttonText,
    fontSize: 15,
    fontWeight: '600',
  },
  listHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 26,
  },
  foundSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  sortRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    paddingTop: 4,
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  sortValue: {
    color: palette.link,
    fontSize: 14,
    fontWeight: '900',
  },
  stateText: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
    paddingVertical: 8,
  },
  invoiceList: {
    gap: 12,
    marginTop: 18,
  },
  loadingState: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 40,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 40,
    marginTop: 130
  },
  homeButton:{
    backgroundColor: palette.actionSurface,
    borderColor: palette.actionBorder,
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  text: {
    color: palette.buttonText,
    fontWeight: '600',
  },
  invoiceCard: {
    borderRadius: 20,
    borderWidth: 1,
    elevation: 2,
    flexDirection: 'row',
    minHeight: 120,
    padding: 12,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
  },
  invoiceLeft: {
    flex: 1,
    flexDirection: 'row',
    paddingRight: 8,
  },
  invoiceIcon: {
    alignItems: 'center',
    backgroundColor: palette.iconSurface,
    borderColor: palette.actionBorder,
    borderWidth: 1,
    borderRadius: 18,
    height: 40,
    justifyContent: 'center',
    marginRight: 12,
    width: 40,
  },
  invoiceCopy: {
    flex: 1,
  },
  invoiceId: {
    color: palette.primaryText,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0,
  },
  invoiceCompany: {
    color: palette.primaryText,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 7,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 6,
  },
  metaText: {
    color: palette.accentText,
    fontSize: 12,
    fontWeight: '400',
    marginLeft: 8,
  },
  overdueDueText: {
    color: '#dc2626',
  },
  paidDueText: {
    color: palette.accentText,
  },
  invoiceRight: {
    alignItems: 'flex-end',
    paddingRight: 1,
    width: 112,
  },
  amount: {
    color: palette.primaryText,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0,
    textAlign: 'right',
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 15,
    paddingVertical: 6,
  },
  statusActionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusDetail: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 18,
    textAlign: 'right',
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: palette.actionSurface,
    borderColor: palette.actionBorder,
    borderRadius: 10,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    width: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 1,
  },
  });
};

export default BillingTabContent;
