import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AnimatedAppear from '../../../../components/AnimatedAppear';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import { BackButton } from '../../../../components/buttons';
import { useThemeColors } from '../../../../theme/colors';
import { useAppSelector } from '../../../../store/hooks';
import TransactionDetailScreen, {
  type TransactionDetail,
} from './TransactionDetailScreen';
import { fetchSubscriptionPayments } from '../../api/subscriptionPaymentsApi';
import { formatDate } from '../../../../constants/dateFormatter';
import type { CompanyCardItem } from '../quickAccess/CompanyCard';
import {
  matchesSelectedCompany,
  matchesTransactionSearch,
} from './transactionsUtils';
import { formatCurrency } from '../../../../constants/currencyConverter';
import { font } from '../../../../theme/typography';
import { fetchClientCompanies } from '../../api/clientProfileApi';
import { mapCompanyToListItem } from '../quickAccess/companyListItem';
import type { MainScreenProps, MainStackParamList } from '../../../../navigation/types';

type Nav = MainScreenProps<'Transactions'>['navigation'];
type Route = RouteProp<MainStackParamList, 'Transactions'>;

type TransactionItem = {
  id: string;
  title: string;
  date: string;
  amount: string;
  onlineAmount?: string;
  cashAmount?: string;
  status: string;
  method: string;
  category: string;
  details: TransactionDetail;
};

type ApiTransactionItem = {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  amount?: number | string;
  onlineAmount?: number | string;
  cashAmount?: number | string;
  currency?: string;
  date?: string;
  status?: string;
  method?: string;
  paymentMethod?: string;
  category?: string;
  type?: string;
  description?: string;
  notes?: string;
  referenceId?: string;
  transactionId?: string;
  gateway?: string;
  bankName?: string;
  accountLast4?: string;
  company?: string;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
  invoice?: string | null;
  [key: string]: unknown;
};

function formatAmountField(
  value: string | number | undefined,
  currency?: string,
) {
  const resolvedCurrency = currency && currency.trim() ? currency : 'USD';

  if (value === undefined || value === null || value === '') {
    return formatCurrency(0, resolvedCurrency);
  }

  if (typeof value === 'number') {
    return formatCurrency(value, resolvedCurrency);
  }

  const parsed = Number(String(value).replace(/[^0-9.-]+/g, ''));
  return Number.isFinite(parsed)
    ? formatCurrency(parsed, resolvedCurrency)
    : String(value);
}

function parseApiAmount(value: string | number | undefined) {
  if (typeof value === 'number') {
    return value;
  }
  const parsed = Number(String(value).replace(/[^0-9.-]+/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function getApiStatus(value?: string, isActive?: boolean): string {
  if (isActive) return 'Active';

  if (typeof value === 'string' && value.trim()) {
    const normalized = value.trim().toLowerCase();
    if (normalized.includes('active')) return 'Active';
    if (
      normalized.includes('success') ||
      normalized.includes('paid') ||
      normalized.includes('su')
    ) {
      return 'Success';
    }
    if (
      normalized.includes('fail') ||
      normalized.includes('decline') ||
      normalized.includes('cancel')
    ) {
      return 'Failed';
    }
    return value.trim().charAt(0).toUpperCase() + value.trim().slice(1);
  }
  return 'Pending';
}

function normalizeApiTransaction(item: ApiTransactionItem): TransactionItem {
  const title =
    item.title ||
    item.name ||
    (typeof item.company === 'object' && item.company !== null
      ? (item.company as any).companyName
      : undefined) ||
    item.description ||
    item.type?.replace(/_/g, ' ') ||
    'Payment';

  const amountNumber = parseApiAmount(
    item.amount ?? item.onlineAmount ?? item.cashAmount,
  );
  const onlineAmountNumber = parseApiAmount(item.onlineAmount);
  const cashAmountNumber = parseApiAmount(item.cashAmount);

  const statusValue = getApiStatus(item.status, item.isActive);

  const companyId =
    typeof item.company === 'object' && item.company !== null
      ? String((item.company as any)._id ?? (item.company as any).id ?? '')
      : String(item.company ?? '');

  const details: TransactionDetail = {
    _id: String(item._id ?? item.id ?? item.transactionId ?? 'unknown'),
    amount: amountNumber,
    onlineAmount: Number.isFinite(onlineAmountNumber)
      ? onlineAmountNumber
      : undefined,
    cashAmount: Number.isFinite(cashAmountNumber)
      ? cashAmountNumber
      : undefined,
    currency: String(item.currency ?? 'USD').toUpperCase(),
    date: item.date ?? item.createdAt ?? '',
    status: statusValue.toLowerCase() as TransactionDetail['status'],
    type: String(item.type ?? item.category ?? 'payment'),
    description: String(item.description ?? item.title ?? 'Payment record'),
    notes: String(item.notes ?? ''),
    company: companyId,
    paymentMethod: String(item.method ?? item.paymentMethod ?? ''),
    referenceId: String(item.referenceId ?? ''),
    transactionId: String(
      item.transactionId ?? item.referenceId ?? item._id ?? '',
    ),
    gateway: String(item.gateway ?? ''),
    bankName: String(item.bankName ?? ''),
    accountLast4: String(item.accountLast4 ?? ''),
    createdBy: String(item.createdBy ?? ''),
    isActive: Boolean(item.isActive ?? true),
    createdAt: item.createdAt ?? item.date ?? '',
    updatedAt: item.updatedAt ?? item.date ?? '',
    invoice: item.invoice ?? null,
  };

  return {
    id: String(
      item._id ??
        item.id ??
        item.transactionId ??
        item.referenceId ??
        title ??
        'unknown',
    ),
    title,
    date: item.date ?? item.createdAt ?? '',
    amount: formatAmountField(amountNumber, item.currency),
    onlineAmount: Number.isFinite(onlineAmountNumber)
      ? formatAmountField(onlineAmountNumber, item.currency)
      : undefined,
    cashAmount: Number.isFinite(cashAmountNumber)
      ? formatAmountField(cashAmountNumber, item.currency)
      : undefined,
    status: statusValue,
    method: String(item.method ?? item.paymentMethod ?? 'Unknown'),
    category: String(item.category ?? item.type ?? 'Payment'),
    details,
  };
}

export default function TransactionsScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const companyId = route.params?.companyId;
  const safeAreaInsets = useSafeAreaInsets();
  const colors = useThemeColors();
  const token = useAppSelector(state => state.auth.token);
  const userId = useAppSelector(state => state.auth.user?.id);
  const [selectedCompany, setSelectedCompany] = useState<CompanyCardItem | null>(null);
  const [activeFilter, setActiveFilter] = useState<
    'All' | 'Success' | 'Pending' | 'Failed'
  >('All');
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    async function loadCompany() {
      try {
        const result = await fetchClientCompanies({ token: token ?? undefined, userId });
        if (isMounted && result.companies?.length) {
          setSelectedCompany(mapCompanyToListItem(result.companies[0], 0));
        }
      } catch {}
    }
    loadCompany();
    return () => { isMounted = false; };
  }, [token]);

  useEffect(() => {
    let isMounted = true;
    async function loadTransactions() {
      setIsLoading(true);
      setErrorMessage('');
      try {
        const response = await fetchSubscriptionPayments(token ?? undefined);
        if (!isMounted) return;

        if (response.isSuccess) {
          const normalized = response.payments.map(normalizeApiTransaction);
          setTransactions(normalized);
        } else {
          setErrorMessage(response.error || 'Unable to load transactions.');
        }
      } catch (err) {
        if (isMounted) setErrorMessage('Something went wrong.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadTransactions();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(item => {
      if (companyId) {
        const txnCompanyId = String(item.details?.company ?? '').trim();
        if (!txnCompanyId || txnCompanyId !== String(companyId)) {
          return false;
        }
      }
      const matchesFilter =
        activeFilter === 'All' || item.status === activeFilter;
      const matchesSearch = matchesTransactionSearch(item, search);
      return matchesFilter && matchesSearch;
    });
  }, [
    companyId,
    activeFilter,
    search,
    transactions,
  ]);

  const currencyFilteredTransactions = useMemo(() => {
    if (!selectedCurrency) return filteredTransactions;
    return filteredTransactions.filter(
      item => item.details?.currency === selectedCurrency,
    );
  }, [filteredTransactions, selectedCurrency]);

  // UI समरी कार्ड्स के लिए डायनामिक करेंसी रेंडरिंग लॉजिक
  const summaryDOM = useMemo(() => {
    const totals: Record<string, { total: number; pending: number }> = {};

    filteredTransactions.forEach(item => {
      const currency = item.details?.currency || 'USD';
      const parsedAmount =
        Number(String(item.amount).replace(/[^0-9.-]+/g, '')) || 0;

      if (!totals[currency]) {
        totals[currency] = { total: 0, pending: 0 };
      }

      totals[currency].total += parsedAmount;
      if (item.status === 'Pending') {
        totals[currency].pending += parsedAmount;
      }
    });

    const keys = Object.keys(totals);
    if (keys.length === 0) {
      return { totals: { USD: { total: 0, pending: 0 } }, keys: ['USD'] };
    }

    return { totals, keys };
  }, [filteredTransactions]);

  const getStatusColor = (status: TransactionItem['status']) => {
    switch (status) {
      case 'Success':
        return '#16a34a'; // ग्रीन कलर फॉर सक्सेस
      case 'Pending':
        return '#ca8a04'; // येलो कलर फॉर पेंडिंग
      case 'Failed':
        return '#dc2626'; // रेड कलर फॉर फ़ील्ड
      default:
        return '#2563eb';
    }
  };

  const getStatusBg = (status: TransactionItem['status']) => {
    switch (status) {
      case 'Success':
        return '#f0fdf4';
      case 'Pending':
        return '#fef9c3';
      case 'Failed':
        return '#fef2f2';
      default:
        return '#ebf8ff';
    }
  };

  if (selectedTransaction && selectedTransaction.details) {
    return (
      <TransactionDetailScreen
        transaction={selectedTransaction.details}
        onBackPress={() => setSelectedTransaction(null)}
      />
    );
  }

  return (
    <View
      style={[
        styles.screen,
        {
          paddingTop: safeAreaInsets.top + 8,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={[styles.title, { color: colors.text }]}>Transactions</Text>
      </View>

      {/* Summary Cards (one per currency) */}
      <View style={styles.summaryContainer}>
        {summaryDOM.keys.map(currency => {
          const isActive = selectedCurrency === currency;
          return (
            <Pressable
              key={currency}
              onPress={() =>
                setSelectedCurrency(isActive ? null : currency)
              }
              style={[
                styles.summaryCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
                isActive && {
                  borderColor: colors.accent,
                  backgroundColor: colors.accentSoft,
                },
              ]}
            >
              <Text style={[styles.summaryLabel, { color: colors.muted }]}>
                Total Spent ({currency})
              </Text>
              <Text
                style={[styles.summaryValue, { color: colors.text }]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {formatCurrency(summaryDOM.totals[currency].total, currency)}
              </Text>
              <Text
                style={[
                  styles.summaryLabel,
                  { color: colors.muted, marginTop: 8 },
                ]}
              >
                Pending ({currency})
              </Text>
              <Text
                style={[styles.summaryValue, { color: '#ca8a04' }]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {formatCurrency(summaryDOM.totals[currency].pending, currency)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search by amount or methods"
          placeholderTextColor={colors.muted}
          style={[
            styles.searchInput,
            {
              color: colors.text,
              borderColor: colors.border,
              backgroundColor: colors.surface,
            },
          ]}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {(['All', 'Success', 'Pending', 'Failed'] as const).map(filter => {
          const isActive = activeFilter === filter;
          return (
            <Pressable
              key={filter}
              onPress={() => setActiveFilter(filter)}
              style={[
                styles.filterButton,
                { backgroundColor: colors.surface, borderColor: colors.border },
                isActive
                  ? {
                      borderColor: colors.accent,
                      backgroundColor: colors.accentSoft,
                    }
                  : null,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: colors.text },
                  isActive ? { color: colors.accent, fontWeight: '700' } : null,
                ]}
              >
                {filter}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {isLoading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text
            style={[styles.emptyText, { color: colors.text, marginTop: 12 }]}
          >
            Loading transactions...
          </Text>
        </View>
      ) : errorMessage ? (
        <View
          style={[styles.emptyContainer, { backgroundColor: colors.surface }]}
        >
          <FontAwesome
            name="exclamation-circle"
            size={40}
            color={colors.accent}
          />
          <Text
            style={[
              styles.emptyText,
              { color: colors.text, textAlign: 'center' },
            ]}
          >
            {errorMessage}
          </Text>
        </View>
      ) : (
        <FlatList
          data={currencyFilteredTransactions}
          keyExtractor={item => item.id}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: safeAreaInsets.bottom + 24,
          }}
          ListEmptyComponent={
            <View
              style={[
                styles.emptyContainer,
                { backgroundColor: colors.surface },
              ]}
            >
              <FontAwesome name="credit-card" size={40} color={colors.muted} />
              <Text style={[styles.emptyText, { color: colors.text }]}>
                No transactions found
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable onPress={() => setSelectedTransaction(item)}>
              <View
                style={[
                  styles.txCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: colors.background },
                  ]}
                >
                  <FontAwesome
                    name="file-text-o"
                    size={18}
                    color={colors.accent}
                  />
                </View>
                <View style={styles.middleSection}>
                  <Text style={[styles.txTitle, { color: colors.text }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.txSubtitle, { color: colors.muted }]}>
                    {formatDate(item.date)} • method: {item.method}
                  </Text>
                </View>
                <View style={styles.rightSection}>
                  <Text style={[styles.txAmount, { color: colors.text }]}>
                    {item.amount}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusBg(item.status) },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(item.status) },
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 14,
  },
  title: { fontSize: font.hero, fontWeight: '500' },
  searchContainer: { paddingHorizontal: 20, marginBottom: 16 },
  searchInput: {
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    borderColor: '#ccc',
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: { flex: 1, padding: 16, borderRadius: 16, borderWidth: 1 },
  summaryLabel: { fontSize: font.base, fontWeight: '600', marginBottom: 6 },
  summaryValue: { fontSize: font.xxl, fontWeight: '800' },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterText: { fontSize: font.base, fontWeight: '500' },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  middleSection: { flex: 1 },
  txTitle: { fontSize: font.lg, fontWeight: '500', marginBottom: 4 },
  txSubtitle: { fontSize: font.sm },
  rightSection: { alignItems: 'flex-end' },
  txAmount: {
    fontSize: font.lg,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'right',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: font.xs, fontWeight: '800' },
  emptyContainer: {
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: { fontSize: font.lg, fontWeight: '600' },
});
