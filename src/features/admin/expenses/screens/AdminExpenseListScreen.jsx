import { font } from '../../../../theme/typography';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../../../../store/hooks';
import {
  deleteAdminExpense,
  fetchAdminExpenses,
  fetchExpenseHeads,
} from '../api/expensesApi';

const STATUSES = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'reimbursed', label: 'Reimbursed' },
];

const STATUS_COLORS = {
  pending: { color: '#B45309', backgroundColor: '#FEF3C7' },
  approved: { color: '#15803D', backgroundColor: '#DCFCE7' },
  rejected: { color: '#B91C1C', backgroundColor: '#FEE2E2' },
  reimbursed: { color: '#1D4ED8', backgroundColor: '#DBEAFE' },
};

const formatCurrency = (amount, currency) => {
  const code = String(currency || 'USD').toUpperCase();
  const safeAmount = Number(amount) || 0;
  try {
    return new Intl.NumberFormat(code === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: code,
      maximumFractionDigits: 2,
    }).format(safeAmount);
  } catch (error) {
    return `${code} ${safeAmount.toFixed(2)}`;
  }
};

const formatDate = value => {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const normalizeLabel = value =>
  String(value || 'N/A')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, character => character.toUpperCase());

const AdminExpenseListScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const token = useAppSelector(state => state.auth.token);
  const [expenses, setExpenses] = useState([]);
  const [expenseHeads, setExpenseHeads] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    expenseHeadId: '',
    startDate: '',
    endDate: '',
  });
  const [search, setSearch] = useState('');
  const [headSearch, setHeadSearch] = useState('');
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState('');

  const loadExpenses = useCallback(
    async ({ refresh = false } = {}) => {
      if (refresh) setRefreshing(true);
      else setLoading(true);
      setError('');
      try {
        const [expenseResult, headsResult] = await Promise.allSettled([
          fetchAdminExpenses({ token, filters }),
          fetchExpenseHeads(token),
        ]);
        if (expenseResult.status === 'rejected') throw expenseResult.reason;
        setExpenses(expenseResult.value);
        if (headsResult.status === 'fulfilled') {
          setExpenseHeads(headsResult.value);
        } else {
          setError(`Unable to load expense heads: ${headsResult.reason.message}`);
        }
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [filters, token],
  );

  useFocusEffect(
    useCallback(() => {
      loadExpenses();
    }, [loadExpenses]),
  );

  const filteredExpenses = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return expenses;
    return expenses.filter(expense =>
      [
        expense.expenseHeadId?.name,
        expense.clientId?.name,
        expense.currency,
        expense.paymentMethod,
        expense.serviceType,
        expense.notes,
        expense.status,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [expenses, search]);

  const amountTotals = useMemo(
    () =>
      expenses.reduce(
        (totals, expense) => {
          const currency = String(expense.currency || 'USD').toUpperCase();
          totals[currency] = (totals[currency] || 0) + (Number(expense.amount) || 0);
          return totals;
        },
        {},
      ),
    [expenses],
  );

  const setFilter = (key, value) =>
    setFilters(previous => ({ ...previous, [key]: value }));

  const confirmDelete = expense => {
    Alert.alert(
      'Delete expense?',
      `${expense.expenseHeadId?.name || 'This expense'} · ${formatCurrency(expense.amount, expense.currency)}. This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(expense._id);
            try {
              await deleteAdminExpense({ token, id: expense._id });
              await loadExpenses({ refresh: true });
            } catch (deleteError) {
              Alert.alert('Unable to delete expense', deleteError.message);
            } finally {
              setDeletingId('');
            }
          },
        },
      ],
    );
  };

  const renderExpense = ({ item }) => {
    const status = String(item.status || 'pending').toLowerCase();
    const badge = STATUS_COLORS[status] || STATUS_COLORS.pending;
    return (
      <View style={styles.expenseCard}>
        <View style={styles.cardHeader}>
          <View style={styles.expenseIcon}>
            <Ionicons name="receipt-outline" size={18} color="#2563EB" />
          </View>
          <View style={styles.expenseMain}>
            <Text style={styles.expenseTitle} numberOfLines={1}>
              {item.expenseHeadId?.name || 'Expense'}
            </Text>
            {item.clientId?.name ? (
              <Text style={styles.clientText} numberOfLines={1}>
                Client: {item.clientId.name}
              </Text>
            ) : null}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: badge.backgroundColor }]}>
            <Text style={[styles.statusText, { color: badge.color }]}>
              {normalizeLabel(status)}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />
        <View style={styles.amountRow}>
          <Text style={styles.amountText}>
            {formatCurrency(item.amount, item.currency)}
          </Text>
          <Text style={styles.currencyTag}>{item.currency || 'USD'}</Text>
        </View>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={13} color="#64748B" />
            <Text style={styles.metaText}>{formatDate(item.expenseDate)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="card-outline" size={13} color="#64748B" />
            <Text style={styles.metaText}>{normalizeLabel(item.paymentMethod)}</Text>
          </View>
        </View>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="briefcase-outline" size={13} color="#64748B" />
            <Text style={styles.metaText} numberOfLines={1}>
              {normalizeLabel(item.serviceType)}
            </Text>
          </View>
          {item.country ? (
            <Text style={styles.countryText}>{item.country}</Text>
          ) : null}
        </View>
        {item.notes ? (
          <Text style={styles.notesText} numberOfLines={2}>{item.notes}</Text>
        ) : null}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() =>
              navigation.navigate('AdminEditExpense', { expenseId: item._id })
            }
            accessibilityRole="button"
            accessibilityLabel="Edit expense">
            <Ionicons name="create-outline" size={16} color="#2563EB" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => confirmDelete(item)}
            disabled={deletingId === item._id}
            accessibilityRole="button"
            accessibilityLabel="Delete expense">
            {deletingId === item._id ? (
              <ActivityIndicator size="small" color="#DC2626" />
            ) : (
              <>
                <Ionicons name="trash-outline" size={15} color="#DC2626" />
                <Text style={styles.deleteButtonText}>Delete</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) + 8 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={21} color="#1E293B" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Expenses</Text>
          <Text style={styles.headerSubtitle}>Manage admin expenses</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AdminAddExpense')}
          accessibilityRole="button"
          accessibilityLabel="Add expense">
          <Ionicons name="add" size={23} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Showing</Text>
          <Text style={styles.summaryValue}>{filteredExpenses.length}</Text>
          <Text style={styles.summaryHint}>expenses</Text>
        </View>
        {Object.entries(amountTotals).slice(0, 2).map(([currency, amount]) => (
          <View key={currency} style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>{currency} total</Text>
            <Text style={styles.summaryMoney} numberOfLines={1}>
              {formatCurrency(amount, currency)}
            </Text>
            <Text style={styles.summaryHint}>loaded expenses</Text>
          </View>
        ))}
      </View>

      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={17} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search expenses..."
            placeholderTextColor="#94A3B8"
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={17} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity
          style={[styles.filterButton, filtersVisible && styles.filterButtonActive]}
          onPress={() => setFiltersVisible(visible => !visible)}
          accessibilityRole="button"
          accessibilityLabel="Toggle expense filters">
          <Ionicons name="options-outline" size={19} color="#334155" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headsButton}
          onPress={() => navigation.navigate('AdminExpenseHeads')}
          accessibilityRole="button"
          accessibilityLabel="Manage expense heads">
          <Ionicons name="list-outline" size={18} color="#334155" />
        </TouchableOpacity>
      </View>

      {filtersVisible ? (
        <View style={styles.filtersPanel}>
          <Text style={styles.filterLabel}>Status</Text>
          <View style={styles.chipRow}>
            {STATUSES.map(option => (
              <TouchableOpacity
                key={option.value || 'all'}
                style={[
                  styles.filterChip,
                  filters.status === option.value && styles.filterChipActive,
                ]}
                onPress={() => setFilter('status', option.value)}>
                <Text
                  style={[
                    styles.filterChipText,
                    filters.status === option.value && styles.filterChipTextActive,
                  ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.filterLabel}>Expense head</Text>
          <TextInput
            style={styles.dateInput}
            value={headSearch}
            onChangeText={setHeadSearch}
            placeholder="Search expense head..."
            placeholderTextColor="#94A3B8"
          />
          {headSearch.trim() ? (
            <View style={styles.headFilterResults}>
              {expenseHeads
                .filter(head =>
                  String(head.name || '')
                    .toLowerCase()
                    .includes(headSearch.trim().toLowerCase()),
                )
                .slice(0, 5)
                .map(head => (
                  <TouchableOpacity
                    key={head._id}
                    style={styles.headFilterOption}
                    onPress={() => {
                      setFilter('expenseHeadId', head._id);
                      setHeadSearch(head.name || '');
                    }}>
                    <Text style={styles.headFilterText}>{head.name}</Text>
                    {filters.expenseHeadId === head._id ? (
                      <Ionicons name="checkmark" size={16} color="#2563EB" />
                    ) : null}
                  </TouchableOpacity>
                ))}
            </View>
          ) : filters.expenseHeadId ? (
            <TouchableOpacity
              style={styles.clearHeadButton}
              onPress={() => {
                setFilter('expenseHeadId', '');
                setHeadSearch('');
              }}>
              <Text style={styles.clearHeadText}>Clear selected expense head</Text>
            </TouchableOpacity>
          ) : null}
          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <Text style={styles.filterLabel}>From</Text>
              <TextInput
                style={styles.dateInput}
                value={filters.startDate}
                onChangeText={value => setFilter('startDate', value)}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94A3B8"
              />
            </View>
            <View style={styles.dateField}>
              <Text style={styles.filterLabel}>To</Text>
              <TextInput
                style={styles.dateInput}
                value={filters.endDate}
                onChangeText={value => setFilter('endDate', value)}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => {
              setFilters({ status: '', expenseHeadId: '', startDate: '', endDate: '' });
              setHeadSearch('');
            }}>
            <Text style={styles.resetButtonText}>Reset filters</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => loadExpenses()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {loading && expenses.length === 0 ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.stateText}>Loading expenses...</Text>
        </View>
      ) : (
        <FlatList
          style={styles.expenseList}
          data={filteredExpenses}
          keyExtractor={(item, index) => String(item._id || index)}
          renderItem={renderExpense}
          contentContainerStyle={[
            styles.listContent,
            filteredExpenses.length === 0 && styles.emptyContent,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadExpenses({ refresh: true })}
              tintColor="#2563EB"
              colors={['#2563EB']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="receipt-outline" size={28} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>No expenses found</Text>
              <Text style={styles.emptyMessage}>
                Adjust filters or add your first expense.
              </Text>
              <TouchableOpacity
                style={styles.emptyAction}
                onPress={() => navigation.navigate('AdminAddExpense')}>
                <Ionicons name="add" size={17} color="#FFFFFF" />
                <Text style={styles.emptyActionText}>Add expense</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
};

export default AdminExpenseListScreen;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    marginRight: 10,
  },
  headerText: { flex: 1 },
  headerTitle: { color: '#0F172A', fontSize: font.xl, fontWeight: '800' },
  headerSubtitle: { color: '#64748B', fontSize: font.xs, marginTop: 3 },
  addButton: {
    width: 38,
    height: 38,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryRow: { flexDirection: 'row', gap: 7, paddingHorizontal: 16, paddingTop: 11 },
  summaryCard: {
    flex: 1,
    minWidth: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 9,
  },
  summaryLabel: { color: '#64748B', fontSize: font.caption, fontWeight: '700' },
  summaryValue: { color: '#0F172A', fontSize: font.lg, fontWeight: '800', marginTop: 3 },
  summaryMoney: { color: '#0F172A', fontSize: font.small, fontWeight: '800', marginTop: 5 },
  summaryHint: { color: '#94A3B8', fontSize: font.tiny, marginTop: 2 },
  toolbar: {
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
  },
  searchBox: {
    flex: 1,
    minHeight: 42,
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    gap: 7,
  },
  searchInput: { flex: 1, color: '#0F172A', fontSize: font.small, paddingVertical: 8 },
  filterButton: {
    width: 39,
    height: 42,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: { backgroundColor: '#EFF6FF', borderColor: '#93C5FD' },
  headsButton: {
    width: 39,
    height: 42,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersPanel: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 11,
  },
  filterLabel: {
    color: '#64748B',
    fontSize: font.caption,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  filterChip: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  filterChipText: { color: '#64748B', fontSize: font.caption },
  filterChipTextActive: { color: '#1D4ED8', fontWeight: '700' },
  dateRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  dateField: { flex: 1 },
  dateInput: {
    minHeight: 36,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 9,
    color: '#334155',
    fontSize: font.xs,
  },
  headFilterResults: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    marginTop: 4,
  },
  headFilterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headFilterText: { color: '#334155', fontSize: font.xs },
  clearHeadButton: { alignSelf: 'flex-start', marginTop: 7 },
  clearHeadText: { color: '#2563EB', fontSize: font.caption, fontWeight: '700' },
  resetButton: { alignSelf: 'flex-end', paddingVertical: 7 },
  resetButtonText: { color: '#2563EB', fontSize: font.xs, fontWeight: '700' },
  expenseList: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 20 },
  emptyContent: { flexGrow: 1 },
  expenseCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 13,
    marginBottom: 10,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  expenseIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expenseMain: { flex: 1, minWidth: 0 },
  expenseTitle: { color: '#0F172A', fontSize: font.sm, fontWeight: '800' },
  clientText: { color: '#64748B', fontSize: font.caption, marginTop: 3 },
  statusBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4 },
  statusText: { fontSize: font.tiny, fontWeight: '800' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 10 },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  amountText: { color: '#0F172A', fontSize: font.lg, fontWeight: '800' },
  currencyTag: {
    color: '#1D4ED8',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 12,
    fontSize: font.tiny,
    fontWeight: '800',
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 5 },
  metaItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { color: '#64748B', fontSize: font.caption, flexShrink: 1 },
  countryText: { color: '#64748B', fontSize: font.caption },
  notesText: { color: '#475569', fontSize: font.xs, marginTop: 9 },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 11,
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },
  editButtonText: { color: '#2563EB', fontSize: font.caption, fontWeight: '700' },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 62,
    justifyContent: 'center',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
  },
  deleteButtonText: { color: '#DC2626', fontSize: font.caption, fontWeight: '700' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 28 },
  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },
  emptyTitle: { color: '#1E293B', fontSize: font.md, fontWeight: '700' },
  emptyMessage: { color: '#64748B', fontSize: font.small, textAlign: 'center', marginTop: 6 },
  emptyAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginTop: 16,
  },
  emptyActionText: { color: '#FFFFFF', fontSize: font.small, fontWeight: '700' },
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  stateText: { color: '#64748B', fontSize: font.sm, marginTop: 10 },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 7,
    padding: 10,
    backgroundColor: '#FEF2F2',
    borderRadius: 9,
  },
  errorText: { color: '#B91C1C', fontSize: font.xs, flex: 1, marginRight: 8 },
  retryText: { color: '#B91C1C', fontSize: font.xs, fontWeight: '700' },
});
