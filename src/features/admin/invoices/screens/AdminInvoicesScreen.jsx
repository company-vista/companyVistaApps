import { font } from '../../../../theme/typography';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../../../../store/hooks';
import { useThemeColors, useResolvedThemeMode } from '../../../../theme/colors';
import { computeInvoiceGrandTotal } from '../../dashboard/utils/invoiceTotals';
import {
  formatCurrency,
  formatShortDate,
  formatStatusLabel,
} from '../../dashboard/utils/dashboardFormat';
import { fetchAdminInvoices } from '../api/invoicesApi';

const INITIAL_FILTERS = {
  search: '',
  status: 'all',
  paymentStatus: 'all',
  currency: 'all',
  invoiceKind: 'all',
  dateRange: 'all',
  page: 1,
  limit: 10,
  sortBy: 'date',
  sortOrder: 'desc',
};

const PAYMENT_STATUSES = ['all', 'paid', 'unpaid', 'partial'];
const INVOICE_STATUSES = ['all', 'draft', 'sent', 'overdue', 'cancelled'];
const CURRENCIES = ['all', 'INR', 'USD'];
const DATE_RANGES = ['all', 'today', 'week', 'month', 'quarter', 'year'];

const isOverdue = invoice => {
  if (String(invoice.paymentStatus || '').toLowerCase() === 'paid') return false;
  if (String(invoice.status || '').toLowerCase() === 'overdue') return true;
  if (!invoice.dueDate) return false;
  const dueDate = new Date(invoice.dueDate);
  if (Number.isNaN(dueDate.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);
  return (
    dueDate < today &&
    ['unpaid', 'partial'].includes(
      String(invoice.paymentStatus || '').toLowerCase(),
    )
  );
};

const getPaymentStatus = invoice =>
  isOverdue(invoice)
    ? 'overdue'
    : String(invoice.paymentStatus || invoice.status || 'pending').toLowerCase();

const getStatusColors = (status, colors) => {
  switch (status) {
    case 'paid':
    case 'sent':
      return { color: colors.accent, backgroundColor: colors.accentSoft };
    case 'overdue':
      return { color: colors.danger, backgroundColor: colors.sheet };
    default:
      return { color: colors.muted, backgroundColor: colors.sheet };
  }
};

const getCompanyName = invoice =>
  invoice.company?.companyName ||
  invoice.company?.name ||
  invoice.companyInfo?.name ||
  'No company';

const AdminInvoicesScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const isDark = useResolvedThemeMode() === 'dark';
  const token = useAppSelector(state => state.auth.token);
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({});
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    currentPage: 1,
  });
  const [filters, setFilters] = useState(() => ({
    ...INITIAL_FILTERS,
    ...(route.params?.invoiceKind
      ? { invoiceKind: route.params.invoiceKind }
      : {}),
  }));
  const [searchText, setSearchText] = useState('');
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [statsError, setStatsError] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    if (route.params?.invoiceKind) {
      setFilters(previous => ({
        ...previous,
        invoiceKind: route.params.invoiceKind,
        page: 1,
      }));
    }
  }, [route.params?.invoiceKind]);

  const loadInvoices = useCallback(
    async ({ refresh = false } = {}) => {
      if (refresh) setRefreshing(true);
      else setLoading(true);
      setError('');
      try {
        const [resultState, summaryState] = await Promise.allSettled([
          fetchAdminInvoices({ token, filters }),
          fetchAdminInvoices({
            token,
            filters: { ...INITIAL_FILTERS, limit: 1000 },
          }),
        ]);
        if (resultState.status === 'rejected') throw resultState.reason;
        const result = resultState.value;
        setInvoices(result.invoices);
        setPagination(result.pagination);
        if (summaryState.status === 'fulfilled') {
          const allInvoices = summaryState.value.invoices;
          setStats({
            paidInvoices: allInvoices.filter(
              invoice =>
                String(invoice.paymentStatus || '').toLowerCase() === 'paid',
            ).length,
            unpaidInvoices: allInvoices.filter(invoice =>
              ['unpaid', 'partial'].includes(
                String(invoice.paymentStatus || '').toLowerCase(),
              ),
            ).length,
            overdueInvoices: allInvoices.filter(isOverdue).length,
          });
          setStatsError('');
        } else {
          setStats(null);
          setStatsError(summaryState.reason.message);
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
      loadInvoices();
    }, [loadInvoices]),
  );

  const pageStats = {
    total: pagination.total,
    paid: stats?.paidInvoices ?? '—',
    unpaid: stats?.unpaidInvoices ?? '—',
    overdue: stats?.overdueInvoices ?? '—',
  };

  const setFilter = (key, value) => {
    setFilters(previous => ({
      ...previous,
      [key]: value,
      page: key === 'page' ? value : 1,
      ...(key === 'currency' && value !== 'INR'
        ? { invoiceKind: 'all' }
        : {}),
    }));
  };

  const applySearch = () => setFilter('search', searchText.trim());

  const renderFilterOptions = (label, key, values) => (
    <View style={styles.filterGroup}>
      <Text style={[styles.filterLabel, { color: colors.muted }]}>{label}</Text>
      <View style={styles.filterOptions}>
        {values.map(value => {
          const active = filters[key] === value;
          return (
            <TouchableOpacity
              key={value}
              style={[
                styles.filterChip,
                {
                  backgroundColor: active ? colors.accentSoft : colors.surface,
                  borderColor: active ? colors.accent : colors.border,
                },
              ]}
              onPress={() => setFilter(key, value)}>
              <Text
                style={[
                  styles.filterChipText,
                  { color: active ? colors.accent : colors.muted },
                  active && styles.filterChipTextActive,
                ]}>
                {value === 'all' ? 'All' : formatStatusLabel(value)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderInvoice = ({ item }) => {
    const currency = String(item.currency || 'INR').toUpperCase();
    const total = computeInvoiceGrandTotal(item);
    const paidAmount =
      getPaymentStatus(item) === 'paid'
        ? total
        : Number(item.paidAmount) || 0;
    const balance = Math.max(total - paidAmount, 0);
    const paymentStatus = getPaymentStatus(item);
    const badge = getStatusColors(paymentStatus, colors);

    return (
      <View
        style={[
          styles.invoiceCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}>
        <View style={styles.invoiceHeader}>
          <TouchableOpacity
            style={styles.invoiceIdentity}
            onPress={() => setSelectedInvoice(item)}
            activeOpacity={0.75}>
            <View style={[styles.invoiceIcon, { backgroundColor: colors.accentSoft }]}>
              <Ionicons
                name="document-text-outline"
                size={19}
                color={colors.accent}
              />
            </View>
            <View style={styles.invoiceHeading}>
              <Text style={[styles.invoiceNumber, { color: colors.text }]} numberOfLines={1}>
                {item.invoiceHead || item.invoiceNumber || 'Invoice'}
              </Text>
              <Text style={[styles.companyName, { color: colors.muted }]} numberOfLines={1}>
                {getCompanyName(item)}
              </Text>
            </View>
          </TouchableOpacity>
          <View style={[styles.statusBadge, { backgroundColor: badge.backgroundColor }]}>
            <Text style={[styles.statusText, { color: badge.color }]} numberOfLines={1}>
              {formatStatusLabel(paymentStatus)}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: colors.accentSoft }]}
            onPress={() =>
              navigation.navigate('AdminEditInvoice', { invoiceId: item._id })
            }
            accessibilityRole="button"
            accessibilityLabel={`Edit invoice ${item.invoiceNumber || ''}`}
            hitSlop={6}>
            <Ionicons name="create-outline" size={18} color={colors.accent} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => setSelectedInvoice(item)}
          activeOpacity={0.75}>
          <View style={[styles.invoiceDivider, { backgroundColor: colors.border }]} />
          <View style={styles.invoiceDetails}>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: colors.subtle }]}>Invoice date</Text>
              <Text style={[styles.detailValue, { color: colors.muted }]}>
                {formatShortDate(item.invoiceDate)}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: colors.subtle }]}>Due date</Text>
              <Text
                style={[
                  styles.detailValue,
                  { color: isOverdue(item) ? colors.danger : colors.muted },
                ]}>
                {formatShortDate(item.dueDate)}
              </Text>
            </View>
          </View>
          <View style={styles.amountRow}>
            <Text style={[styles.totalAmount, { color: colors.text }]}>
              {formatCurrency(total, currency)}
            </Text>
            <Text
              style={[
                balance > 0 ? styles.balanceAmount : styles.paidAmount,
                { color: balance > 0 ? colors.danger : colors.accent },
              ]}>
              {balance > 0
                ? `Balance: ${formatCurrency(balance, currency)}`
                : 'Fully paid'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.border }]}>
        <Ionicons name="document-text-outline" size={28} color={colors.subtle} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No invoices found</Text>
      <Text style={[styles.emptyMessage, { color: colors.muted }]}>
        Try changing your search or filters, or create an invoice.
      </Text>
      <TouchableOpacity
        style={[styles.createButton, { backgroundColor: colors.buttonBackground }]}
        onPress={() => navigation.navigate('AdminCreateInvoice')}>
        <Ionicons name="add" size={17} color={colors.buttonText} />
        <Text style={[styles.createButtonText, { color: colors.buttonText }]}>
          Create invoice
        </Text>
      </TouchableOpacity>
    </View>
  );

  const detailTotal = selectedInvoice
    ? computeInvoiceGrandTotal(selectedInvoice)
    : 0;
  const detailCurrency = String(selectedInvoice?.currency || 'INR').toUpperCase();
  const detailStatus = selectedInvoice
    ? getPaymentStatus(selectedInvoice)
    : 'pending';
  const detailBadge = getStatusColors(detailStatus, colors);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <View
        style={[
          styles.header,
          {
            paddingTop: Math.max(insets.top, 10) + 8,
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.sheet }]}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={21} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Invoices</Text>
          <Text style={[styles.headerSubtitle, { color: colors.muted }]}>
            Manage invoices and payments
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.buttonBackground }]}
          onPress={() => navigation.navigate('AdminCreateInvoice')}
          accessibilityRole="button"
          accessibilityLabel="Create invoice">
          <Ionicons name="add" size={23} color={colors.buttonText} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        {[
          { title: 'Total', value: pageStats.total, icon: 'documents-outline', color: colors.accent, bg: colors.accentSoft },
          { title: 'Paid', value: pageStats.paid, icon: 'checkmark-circle-outline', color: colors.accent, bg: colors.accentSoft },
          { title: 'Unpaid', value: pageStats.unpaid, icon: 'time-outline', color: colors.muted, bg: colors.sheet },
          { title: 'Overdue', value: pageStats.overdue, icon: 'alert-circle-outline', color: colors.danger, bg: colors.sheet },
        ].map(stat => (
          <View
            key={stat.title}
            style={[
              styles.statCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}>
            <View style={[styles.statIcon, { backgroundColor: stat.bg }]}>
              <Ionicons name={stat.icon} size={16} color={stat.color} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]} numberOfLines={1}>
              {stat.value}
            </Text>
            <Text style={[styles.statTitle, { color: colors.muted }]}>{stat.title}</Text>
          </View>
        ))}
      </View>

      <View style={styles.toolbar}>
        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: colors.inputBackground,
              borderColor: colors.inputBorder,
            },
          ]}>
          <Ionicons name="search-outline" size={17} color={colors.subtle} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={applySearch}
            returnKeyType="search"
            placeholder="Search invoice or company..."
            placeholderTextColor={colors.inputPlaceholder}
          />
          {searchText ? (
            <TouchableOpacity
              onPress={() => {
                setSearchText('');
                setFilter('search', '');
              }}>
              <Ionicons name="close-circle" size={17} color={colors.subtle} />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              backgroundColor: filtersVisible ? colors.accentSoft : colors.surface,
              borderColor: filtersVisible ? colors.accent : colors.border,
            },
          ]}
          onPress={() => setFiltersVisible(visible => !visible)}
          accessibilityRole="button"
          accessibilityLabel="Toggle invoice filters">
          <Ionicons name="options-outline" size={19} color={colors.text} />
        </TouchableOpacity>
      </View>

      {filtersVisible ? (
        <ScrollView
          style={[
            styles.filtersPanel,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          nestedScrollEnabled>
          {renderFilterOptions('Payment', 'paymentStatus', PAYMENT_STATUSES)}
          {renderFilterOptions('Currency', 'currency', CURRENCIES)}
          {filters.currency === 'INR'
            ? renderFilterOptions('Invoice type', 'invoiceKind', ['all', 'gst', 'regular'])
            : null}
          {renderFilterOptions('Invoice status', 'status', INVOICE_STATUSES)}
          {renderFilterOptions('Date range', 'dateRange', DATE_RANGES)}
          {renderFilterOptions('Sort by', 'sortBy', ['date', 'dueDate', 'total', 'company'])}
          <View style={styles.filterFooter}>
            <TouchableOpacity
              onPress={() => {
                setFilters(INITIAL_FILTERS);
                setSearchText('');
              }}>
              <Text style={[styles.clearFiltersText, { color: colors.accent }]}>
                Clear filters
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sortButton}
              onPress={() =>
                setFilters(previous => ({
                  ...previous,
                  sortOrder: previous.sortOrder === 'asc' ? 'desc' : 'asc',
                  page: 1,
                }))
              }>
              <Ionicons name="swap-vertical" size={15} color={colors.text} />
              <Text style={[styles.sortText, { color: colors.text }]}>
                Date {filters.sortOrder === 'asc' ? '↑' : '↓'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : null}

      {error ? (
        <View style={[styles.errorBanner, { backgroundColor: colors.sheet }]}>
          <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
          <TouchableOpacity onPress={() => loadInvoices()}>
            <Text style={[styles.retryText, { color: colors.danger }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      {statsError ? (
        <View style={[styles.errorBanner, { backgroundColor: colors.sheet }]}>
          <Text style={[styles.errorText, { color: colors.danger }]}>
            Unable to load invoice summary: {statsError}
          </Text>
        </View>
      ) : null}

      {loading && invoices.length === 0 ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.stateText, { color: colors.muted }]}>
            Loading invoices...
          </Text>
        </View>
      ) : (
        <FlatList
          style={styles.invoiceList}
          data={invoices}
          keyExtractor={(item, index) => String(item._id || item.id || index)}
          renderItem={renderInvoice}
          contentContainerStyle={[
            styles.listContent,
            invoices.length === 0 && styles.emptyContent,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadInvoices({ refresh: true })}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
          ListEmptyComponent={renderEmpty}
        />
      )}

      {pagination.pages > 1 ? (
        <View
          style={[
            styles.pagination,
            {
              marginBottom: Math.max(insets.bottom, 8),
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}>
          <Text style={[styles.paginationText, { color: colors.muted }]}>
            Page {filters.page} of {pagination.pages} · {pagination.total} invoices
          </Text>
          <View style={styles.paginationActions}>
            <TouchableOpacity
              style={[
                styles.pageButton,
                { borderColor: colors.border },
                filters.page <= 1 && styles.pageButtonDisabled,
              ]}
              disabled={filters.page <= 1}
              onPress={() => setFilter('page', filters.page - 1)}>
              <Ionicons name="chevron-back" size={17} color={colors.text} />
              <Text style={[styles.pageButtonText, { color: colors.text }]}>
                Previous
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.pageButton,
                { borderColor: colors.border },
                filters.page >= pagination.pages && styles.pageButtonDisabled,
              ]}
              disabled={filters.page >= pagination.pages}
              onPress={() => setFilter('page', filters.page + 1)}>
              <Text style={[styles.pageButtonText, { color: colors.text }]}>Next</Text>
              <Ionicons name="chevron-forward" size={17} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      <Modal
        visible={Boolean(selectedInvoice)}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedInvoice(null)}>
        <View style={[styles.modalBackdrop, { backgroundColor: colors.backdrop }]}>
          <View
            style={[
              styles.detailModal,
              {
                paddingBottom: Math.max(insets.bottom, 20),
                backgroundColor: colors.cardElevated,
              },
            ]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleWrap}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {selectedInvoice?.invoiceHead ||
                    selectedInvoice?.invoiceNumber ||
                    'Invoice details'}
                </Text>
                <Text style={[styles.modalSubtitle, { color: colors.muted }]}>
                  {getCompanyName(selectedInvoice || {})}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.modalClose, { backgroundColor: colors.sheet }]}
                onPress={() => setSelectedInvoice(null)}>
                <Ionicons name="close" size={21} color={colors.text} />
              </TouchableOpacity>
            </View>
            {selectedInvoice ? (
              <>
                <View
                  style={[
                    styles.detailAmountCard,
                    { backgroundColor: colors.background },
                  ]}>
                  <Text style={[styles.totalAmountLabel, { color: colors.muted }]}>
                    TOTAL AMOUNT
                  </Text>
                  <Text style={[styles.detailAmount, { color: colors.text }]}>
                    {formatCurrency(detailTotal, detailCurrency)}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: detailBadge.backgroundColor },
                    ]}>
                    <Text style={[styles.statusText, { color: detailBadge.color }]}>
                      {formatStatusLabel(detailStatus)}
                    </Text>
                  </View>
                </View>
                {[
                  ['Invoice date', formatShortDate(selectedInvoice.invoiceDate)],
                  ['Due date', formatShortDate(selectedInvoice.dueDate)],
                  ['Paid', formatCurrency(Number(selectedInvoice.paidAmount) || 0, detailCurrency)],
                  ['Balance', formatCurrency(Math.max(detailTotal - (Number(selectedInvoice.paidAmount) || 0), 0), detailCurrency)],
                  ['Invoice status', formatStatusLabel(selectedInvoice.status)],
                  ['Currency', detailCurrency],
                ].map(([label, value]) => (
                  <View key={label} style={[styles.detailRow, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.detailRowLabel, { color: colors.muted }]}>
                      {label}
                    </Text>
                    <Text style={[styles.detailRowValue, { color: colors.text }]}>
                      {value}
                    </Text>
                  </View>
                ))}
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AdminInvoicesScreen;

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginRight: 10,
  },
  headerText: { flex: 1 },
  headerTitle: { fontSize: font.xl, fontWeight: '800' },
  headerSubtitle: { fontSize: font.xs, marginTop: 3 },
  addButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  statCard: {
    flex: 1,
    minWidth: 0,
    borderRadius: 11,
    padding: 8,
    borderWidth: 1,
  },
  statIcon: {
    width: 25,
    height: 25,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  statValue: { fontSize: font.lg, fontWeight: '800' },
  statTitle: { fontSize: font.xs, marginTop: 2 },
  toolbar: {
    flexDirection: 'row',
    gap: 9,
    paddingHorizontal: 16,
    paddingTop: 5,
    paddingBottom: 9,
  },
  searchBox: {
    flex: 1,
    minHeight: 42,
    borderWidth: 1,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: font.sm, paddingVertical: 8 },
  filterButton: {
    width: 42,
    height: 42,
    borderRadius: 11,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersPanel: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 13,
    borderWidth: 1,
    padding: 12,
    maxHeight: 240,
  },
  filterGroup: { marginBottom: 8 },
  filterLabel: {
    fontSize: font.caption,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  filterOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  filterChip: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
  },
  filterChipText: { fontSize: font.caption },
  filterChipTextActive: { fontWeight: '700' },
  filterFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clearFiltersText: { fontSize: font.small, fontWeight: '700' },
  sortButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sortText: { fontSize: font.xs, fontWeight: '600' },
  invoiceList: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 16 },
  emptyContent: { flexGrow: 1 },
  invoiceCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 13,
    marginBottom: 10,
  },
  invoiceHeader: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  invoiceIdentity: { flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 0 },
  invoiceIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
  },
  invoiceHeading: { flex: 1, minWidth: 0, marginRight: 7 },
  editButton: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  invoiceNumber: { fontSize: font.sm, fontWeight: '800' },
  companyName: { fontSize: font.xs, marginTop: 3 },
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    maxWidth: 82,
  },
  statusText: { fontSize: font.tiny, fontWeight: '800' },
  invoiceDivider: { height: 1, marginVertical: 10 },
  invoiceDetails: { flexDirection: 'row', gap: 14 },
  detailItem: { flex: 1 },
  detailLabel: { fontSize: font.caption, marginBottom: 3 },
  detailValue: { fontSize: font.xs, fontWeight: '600' },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  totalAmount: { fontSize: font.base, fontWeight: '800', flexShrink: 1 },
  balanceAmount: { fontSize: font.xs, fontWeight: '700', flexShrink: 1, textAlign: 'right' },
  paidAmount: { fontSize: font.xs, fontWeight: '700' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 28 },
  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },
  emptyTitle: { fontSize: font.md, fontWeight: '700' },
  emptyMessage: { fontSize: font.small, textAlign: 'center', marginTop: 6 },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginTop: 16,
  },
  createButtonText: { fontSize: font.small, fontWeight: '700' },
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  stateText: { fontSize: font.sm, marginTop: 10 },
  errorBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 6,
    padding: 10,
    borderRadius: 9,
  },
  errorText: { fontSize: font.xs, flex: 1, marginRight: 8 },
  retryText: { fontSize: font.xs, fontWeight: '700' },
  pagination: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 3,
  },
  paginationText: { fontSize: font.xs, textAlign: 'center' },
  paginationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  pageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  pageButtonDisabled: { opacity: 0.4 },
  pageButtonText: { fontSize: font.xs, fontWeight: '600' },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  detailModal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitleWrap: { flex: 1 },
  modalTitle: { fontSize: font.lg, fontWeight: '800' },
  modalSubtitle: { fontSize: font.xs, marginTop: 3 },
  modalClose: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailAmountCard: {
    alignItems: 'center',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  totalAmountLabel: { fontSize: font.caption, fontWeight: '800' },
  detailAmount: { fontSize: font.display, fontWeight: '800', marginVertical: 7 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
  },
  detailRowLabel: { fontSize: font.small },
  detailRowValue: { fontSize: font.small, fontWeight: '600' },
});
