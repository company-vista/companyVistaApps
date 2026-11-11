import { font } from '../../../../theme/typography';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../../../../store/hooks';
import TransactionEditButton from '../components/TransactionEditButton';
import {
  createAdminTransaction,
  deleteAdminTransaction,
  fetchAdminTransaction,
  fetchAdminTransactions,
  fetchCompanyInvoices,
  fetchTransactionCompanies,
} from '../api/transactionsApi';

const INITIAL_FILTERS = {
  search: '',
  status: 'all',
  type: 'all',
  paymentMethod: 'all',
  startDate: '',
  endDate: '',
  page: 1,
  limit: 10,
  sortBy: 'date',
  sortOrder: 'desc',
};

const PAYMENT_METHODS = [
  { value: 'upi', label: 'UPI' },
  { value: 'credit_card', label: 'Credit card' },
  { value: 'debit_card', label: 'Debit card' },
  { value: 'bank_transfer', label: 'Bank transfer' },
  { value: 'cash', label: 'Cash' },
  { value: 'cheque', label: 'Cheque' },
];

const CURRENCIES = [
  { value: 'INR', symbol: '₹' },
  { value: 'USD', symbol: '$' },
  { value: 'EUR', symbol: '€' },
  { value: 'GBP', symbol: '£' },
  { value: 'AUD', symbol: 'A$' },
  { value: 'CAD', symbol: 'C$' },
  { value: 'SGD', symbol: 'S$' },
];

const todayString = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const newPaymentForm = () => ({
  amount: '',
  date: todayString(),
  status: 'completed',
  type: 'invoice_payment',
  currency: 'INR',
  description: '',
  notes: '',
  companyId: '',
  invoiceId: '',
  paymentMethod: 'upi',
  referenceId: '',
  transactionId: '',
  gateway: 'razorpay',
  bankName: '',
  accountLast4: '',
  sendReceipt: true,
  notifyCompany: true,
});

const getCompanyName = company =>
  company?.companyName || company?.name || 'Unknown company';

const getRelatedCompany = raw => {
  const invoice =
    raw?.invoice && typeof raw.invoice === 'object'
      ? raw.invoice
      : raw?.invoiceId && typeof raw.invoiceId === 'object'
        ? raw.invoiceId
        : null;
  const company =
    raw?.company && typeof raw.company === 'object'
      ? raw.company
      : invoice?.company && typeof invoice.company === 'object'
        ? invoice.company
        : {};
  const client =
    raw?.clientId && typeof raw.clientId === 'object'
      ? raw.clientId
      : raw?.client && typeof raw.client === 'object'
        ? raw.client
        : {};
  return {
    name: company.companyName || company.name || client.company || client.name || 'N/A',
    email: company.email || client.email || '',
    invoice,
  };
};

const currencyText = (amount, currency = 'INR') => {
  const validCurrency = CURRENCIES.some(item => item.value === currency)
    ? currency
    : 'INR';
  return Number(amount || 0).toLocaleString('en-IN', {
    style: 'currency',
    currency: validCurrency,
    maximumFractionDigits: 2,
  });
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

const statusColor = status => {
  switch (String(status || '').toLowerCase()) {
    case 'completed':
    case 'success':
      return { backgroundColor: '#DCFCE7', color: '#15803D' };
    case 'pending':
      return { backgroundColor: '#FEF3C7', color: '#B45309' };
    case 'failed':
      return { backgroundColor: '#FEE2E2', color: '#B91C1C' };
    case 'refunded':
      return { backgroundColor: '#F3E8FF', color: '#7E22CE' };
    case 'processing':
      return { backgroundColor: '#DBEAFE', color: '#1D4ED8' };
    default:
      return { backgroundColor: '#F1F5F9', color: '#475569' };
  }
};

const getTypeLabel = type => {
  switch (String(type || '').toLowerCase()) {
    case 'invoice_payment':
      return 'Invoice payment';
    case 'advance_payment':
      return 'Advance payment';
    case 'refund':
      return 'Refund';
    case 'credit_note':
      return 'Credit note';
    default:
      return type || 'Payment';
  }
};

const generateReference = () => {
  const timestamp = String(Date.now()).slice(-8);
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `PAY-${timestamp}-${random}`;
};

const AdminTransactionsScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const token = useAppSelector(state => state.auth.token);
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    currentPage: 1,
  });
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [searchText, setSearchText] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [createVisible, setCreateVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [payment, setPayment] = useState(newPaymentForm);
  const [companies, setCompanies] = useState([]);
  const [companyQuery, setCompanyQuery] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [invoiceQuery, setInvoiceQuery] = useState('');
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadTransactions = useCallback(
    async ({ refresh = false } = {}) => {
      if (refresh) setRefreshing(true);
      else setLoading(true);
      setError('');
      try {
        const result = await fetchAdminTransactions({ token, filters });
        setTransactions(result.transactions);
        setPagination(result.pagination);
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
      loadTransactions();
    }, [loadTransactions]),
  );

  const stats = useMemo(
    () => ({
      amountByCurrency: transactions.reduce(
        (totals, transaction) => {
          const currency = String(transaction.currency || 'INR').toUpperCase();
          if (currency === 'INR' || currency === 'USD') {
            totals[currency] += Number(transaction.amount) || 0;
          }
          return totals;
        },
        { INR: 0, USD: 0 },
      ),
      completed: transactions.filter(
        item => String(item.status).toLowerCase() === 'completed',
      ).length,
      failed: transactions.filter(
        item => String(item.status).toLowerCase() === 'failed',
      ).length,
    }),
    [transactions],
  );

  const setFilter = (key, value) => {
    setFilters(previous => ({
      ...previous,
      [key]: value,
      page: key === 'page' ? value : 1,
    }));
  };

  const openCreatePayment = async () => {
    setPayment(newPaymentForm());
    setCompanyQuery('');
    setInvoiceQuery('');
    setInvoices([]);
    setCreateVisible(true);
    if (companies.length) return;
    setCompaniesLoading(true);
    try {
      setCompanies(await fetchTransactionCompanies(token));
    } catch (loadError) {
      Alert.alert('Unable to load companies', loadError.message);
    } finally {
      setCompaniesLoading(false);
    }
  };

  const filteredCompanies = useMemo(() => {
    const query = companyQuery.trim().toLowerCase();
    if (!query || payment.companyId) return [];
    return companies
      .filter(company => {
        const name = getCompanyName(company).toLowerCase();
        const email = String(company.email || company.companyEmail || '').toLowerCase();
        return name.includes(query) || email.includes(query);
      })
      .slice(0, 8);
  }, [companies, companyQuery, payment.companyId]);

  const filteredInvoices = useMemo(() => {
    const query = invoiceQuery.trim().toLowerCase();
    if (!query) return invoices.slice(0, 8);
    return invoices
      .filter(invoice =>
        String(invoice.invoiceNumber || '').toLowerCase().includes(query),
      )
      .slice(0, 8);
  }, [invoiceQuery, invoices]);

  const selectCompany = async company => {
    const companyId = company._id || company.id;
    setPayment(previous => ({ ...previous, companyId, invoiceId: '' }));
    setCompanyQuery(getCompanyName(company));
    setInvoiceQuery('');
    setInvoices([]);
    setInvoicesLoading(true);
    try {
      setInvoices(await fetchCompanyInvoices({ token, companyId }));
    } catch (loadError) {
      Alert.alert('Unable to load invoices', loadError.message);
    } finally {
      setInvoicesLoading(false);
    }
  };

  const selectInvoice = invoice => {
    const total = Number(invoice.total || invoice.totalAmount || invoice.amount || 0);
    const paid =
      invoice.paymentStatus === 'paid'
        ? total
        : Number(invoice.paidAmount || invoice.paid || 0);
    const outstanding = Math.max(total - paid, 0);
    const invoiceStatus = paid >= total ? 'PAID' : paid > 0 ? 'PARTIAL' : 'UNPAID';
    setPayment(previous => ({
      ...previous,
      invoiceId: invoice._id,
      invoiceAmount: total,
      invoiceOutstanding: outstanding,
      invoiceStatus,
      amount: String(outstanding || total),
      currency: invoice.currency || previous.currency,
      description: `Payment for Invoice ${invoice.invoiceNumber || ''}`.trim(),
    }));
    setInvoiceQuery(invoice.invoiceNumber || '');
  };

  const submitPayment = async () => {
    const amount = Number.parseFloat(payment.amount);
    if (!payment.companyId) {
      Alert.alert('Company required', 'Please select a company.');
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      Alert.alert('Invalid amount', 'Enter a payment amount greater than zero.');
      return;
    }
    if (
      payment.invoiceId &&
      payment.invoiceStatus !== 'PAID' &&
      amount > Number(payment.invoiceOutstanding)
    ) {
      Alert.alert(
        'Amount exceeds outstanding balance',
        `Maximum amount is ${currencyText(payment.invoiceOutstanding, payment.currency)}.`,
      );
      return;
    }
    if (!payment.date.trim() || !payment.referenceId.trim()) {
      Alert.alert('Missing details', 'Payment date and reference ID are required.');
      return;
    }
    setSaving(true);
    try {
      await createAdminTransaction({
        token,
        payload: {
          amount,
          date: payment.date,
          status: payment.status,
          type: payment.type,
          currency: payment.currency,
          description: payment.description,
          notes: payment.notes,
          companyId: payment.companyId,
          invoiceId: payment.invoiceId || null,
          paymentMethod: payment.paymentMethod,
          referenceId: payment.referenceId,
          transactionId: payment.transactionId || payment.referenceId,
          gateway: payment.gateway,
          bankName: payment.bankName || null,
          accountLast4: payment.accountLast4 || null,
          meta: {
            sendReceipt: payment.sendReceipt,
            notifyCompany: payment.notifyCompany,
          },
        },
      });
      setCreateVisible(false);
      setFilters(previous => ({ ...previous, page: 1 }));
      Alert.alert('Payment recorded', 'The transaction was saved successfully.');
    } catch (saveError) {
      Alert.alert('Unable to record payment', saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const openDetails = async item => {
    setSelectedTransaction(item);
    setDetailVisible(true);
    setDetailLoading(true);
    try {
      setSelectedTransaction(
        await fetchAdminTransaction({ token, id: item._id }),
      );
    } catch (detailError) {
      Alert.alert('Unable to load transaction', detailError.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const confirmDelete = item => {
    Alert.alert(
      'Delete transaction?',
      'This payment record will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAdminTransaction({ token, id: item._id });
              setDetailVisible(false);
              await loadTransactions({ refresh: true });
            } catch (deleteError) {
              Alert.alert('Unable to delete transaction', deleteError.message);
            }
          },
        },
      ],
    );
  };

  const companiesById = useMemo(
    () =>
      new Map(
        companies.map(company => [
          String(company._id || company.id),
          company,
        ]),
      ),
    [companies],
  );

  const renderTransaction = ({ item }) => {
    const related = getRelatedCompany(item);
    const company =
      item.company && typeof item.company === 'object'
        ? item.company
        : companiesById.get(String(item.companyId));
    const companyName = company ? getCompanyName(company) : related.name;
    const badge = statusColor(item.status);
    const gatewayPayment =
      item.source === 'PAYMENT' ||
      Boolean(item.razorpayPaymentId || item.razorpayOrderId || item.paymentId);

    return (
      <View style={styles.transactionCard}>
        <TouchableOpacity
          onPress={() => openDetails(item)}
          activeOpacity={0.75}>
          <View style={styles.transactionTop}>
            <View style={styles.transactionIcon}>
              <Ionicons
                name={
                  String(item.status).toLowerCase() === 'completed'
                    ? 'checkmark-circle-outline'
                    : String(item.status).toLowerCase() === 'failed'
                      ? 'close-circle-outline'
                      : 'time-outline'
                }
                size={22}
                color={badge.color}
              />
            </View>
            <View style={styles.transactionMain}>
              <Text style={styles.transactionAmount}>
                {currencyText(item.amount, item.currency)}
              </Text>
              <Text style={styles.transactionType}>{getTypeLabel(item.type)}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: badge.backgroundColor }]}>
              <Text style={[styles.statusText, { color: badge.color }]}>
                {item.status || 'pending'}
              </Text>
            </View>
          </View>
          <View style={styles.transactionDivider} />
          <View style={styles.transactionMetaRow}>
            <Ionicons name="business-outline" size={14} color="#64748B" />
            <Text style={styles.transactionMeta} numberOfLines={1}>{companyName}</Text>
          </View>
          <View style={styles.transactionMetaRow}>
            <Ionicons name="calendar-outline" size={14} color="#64748B" />
            <Text style={styles.transactionMeta}>{formatDate(item.date || item.createdAt)}</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.transactionFooter}>
          <Text style={styles.referenceText} numberOfLines={1}>
            Ref: {item.referenceId || item.transactionId || 'No reference'}
          </Text>
          <Text style={styles.methodText} numberOfLines={1}>
            {String(item.paymentMethod || item.gateway || 'Unknown').replaceAll('_', ' ')}
          </Text>
          {!gatewayPayment ? (
            <>
              <TransactionEditButton
                onPress={() =>
                  navigation.navigate('AdminEditTransaction', { id: item._id })
                }
              />
              <TouchableOpacity
                style={styles.deleteButton}
                accessibilityRole="button"
                accessibilityLabel="Delete transaction"
                onPress={() => confirmDelete(item)}>
                <Ionicons name="trash-outline" size={16} color="#DC2626" />
              </TouchableOpacity>
            </>
          ) : null}
        </View>
      </View>
    );
  };

  const updatePayment = (field, value) =>
    setPayment(previous => ({ ...previous, [field]: value }));

  const renderInput = (label, field, options = {}) => (
    <View style={styles.formField}>
      <Text style={styles.formLabel}>{label}</Text>
      <TextInput
        style={[styles.formInput, options.multiline && styles.formTextarea]}
        value={String(payment[field] ?? '')}
        onChangeText={value => updatePayment(field, value)}
        placeholder={options.placeholder || ''}
        placeholderTextColor="#94A3B8"
        keyboardType={options.keyboardType || 'default'}
        multiline={options.multiline}
        textAlignVertical={options.multiline ? 'top' : 'center'}
        autoCapitalize={options.autoCapitalize || 'sentences'}
      />
    </View>
  );

  const renderOptionRow = (label, field, options) => (
    <View style={styles.formField}>
      <Text style={styles.formLabel}>{label}</Text>
      <View style={styles.optionRow}>
        {options.map(option => {
          const value = typeof option === 'string' ? option : option.value;
          const title = typeof option === 'string' ? option : option.label;
          const active = payment[field] === value;
          return (
            <TouchableOpacity
              key={value}
              style={[styles.optionChip, active && styles.optionChipActive]}
              onPress={() => updatePayment(field, value)}>
              <Text style={[styles.optionText, active && styles.optionTextActive]}>
                {title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderCreateModal = () => (
    <Modal
      visible={createVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => !saving && setCreateVisible(false)}>
      <View style={[styles.modalScreen, { paddingTop: Math.max(insets.top, 12) }]}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.modalClose}
            onPress={() => !saving && setCreateVisible(false)}>
            <Ionicons name="close" size={22} color="#334155" />
          </TouchableOpacity>
          <View style={styles.modalTitleWrap}>
            <Text style={styles.modalTitle}>New transaction</Text>
            <Text style={styles.modalSubtitle}>Record a company payment</Text>
          </View>
        </View>
        <ScrollView
          contentContainerStyle={[styles.modalBody, { paddingBottom: 30 + insets.bottom }]}
          keyboardShouldPersistTaps="handled">
          <View style={styles.formCard}>
            <Text style={styles.formSectionTitle}>Company & invoice</Text>
            {payment.companyId ? (
              <View style={styles.selectedCompany}>
                <View style={styles.companyAvatar}>
                  <Text style={styles.companyInitial}>
                    {companyQuery.charAt(0).toUpperCase() || 'C'}
                  </Text>
                </View>
                <Text style={styles.selectedCompanyName} numberOfLines={1}>
                  {companyQuery}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    updatePayment('companyId', '');
                    updatePayment('invoiceId', '');
                    setCompanyQuery('');
                    setInvoiceQuery('');
                    setInvoices([]);
                  }}>
                  <Text style={styles.clearText}>Change</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
              <Text style={styles.formLabel}>Search company *</Text>
              <TextInput
                style={styles.formInput}
                  value={companyQuery}
                  onChangeText={setCompanyQuery}
                  placeholder="Type a company name or email"
                  placeholderTextColor="#94A3B8"
                  accessibilityLabel="Search company"
                />
                {companiesLoading ? (
                  <ActivityIndicator color="#2563EB" style={styles.loadingInline} />
                ) : null}
                {filteredCompanies.map(company => (
                  <TouchableOpacity
                    key={String(company._id || company.id)}
                    style={styles.selectResult}
                    onPress={() => selectCompany(company)}>
                    <Text style={styles.selectResultName}>{getCompanyName(company)}</Text>
                    <Text style={styles.selectResultDetail}>
                      {company.email || company.companyEmail || ''}
                    </Text>
                  </TouchableOpacity>
                ))}
              </>
            )}
            {payment.companyId ? (
              <>
                <Text style={styles.formLabel}>Select invoice (optional)</Text>
                <TextInput
                  style={styles.formInput}
                  value={invoiceQuery}
                  onChangeText={setInvoiceQuery}
                  placeholder={invoicesLoading ? 'Loading invoices...' : 'Search invoice number'}
                  placeholderTextColor="#94A3B8"
                  accessibilityLabel="Search invoice"
                />
                {invoicesLoading ? (
                  <ActivityIndicator color="#2563EB" style={styles.loadingInline} />
                ) : null}
                {!invoicesLoading && invoices.length === 0 ? (
                  <Text style={styles.helperText}>No invoices available for this company.</Text>
                ) : null}
                {filteredInvoices.map(invoice => (
                  <TouchableOpacity
                    key={String(invoice._id)}
                    style={[
                      styles.selectResult,
                      payment.invoiceId === invoice._id && styles.selectedResult,
                    ]}
                    onPress={() => selectInvoice(invoice)}>
                    <Text style={styles.selectResultName}>
                      {invoice.invoiceNumber || `Invoice ${String(invoice._id).slice(-8)}`}
                    </Text>
                    <Text style={styles.selectResultDetail}>
                      Outstanding: {currencyText(
                        Math.max(
                          Number(invoice.total || invoice.totalAmount || invoice.amount || 0) -
                            Number(invoice.paidAmount || invoice.paid || 0),
                          0,
                        ),
                        invoice.currency || payment.currency,
                      )}
                    </Text>
                  </TouchableOpacity>
                ))}
                {payment.invoiceId ? (
                  <TouchableOpacity
                    style={styles.clearInvoice}
                    onPress={() => {
                      updatePayment('invoiceId', '');
                      setInvoiceQuery('');
                    }}>
                    <Text style={styles.clearText}>Clear selected invoice</Text>
                  </TouchableOpacity>
                ) : null}
              </>
            ) : null}
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formSectionTitle}>Transaction details</Text>
            <View style={styles.formTwoColumns}>
              {renderInput('Amount *', 'amount', {
                keyboardType: 'decimal-pad',
                placeholder: '0.00',
              })}
              {renderOptionRow(
                'Currency',
                'currency',
                CURRENCIES.map(item => item.value),
              )}
            </View>
            {renderInput('Date (YYYY-MM-DD) *', 'date', { placeholder: todayString() })}
            {renderOptionRow('Status', 'status', ['completed', 'pending', 'failed', 'processing'])}
            {renderOptionRow('Type', 'type', [
              { value: 'invoice_payment', label: 'Invoice' },
              { value: 'advance_payment', label: 'Advance' },
              { value: 'refund', label: 'Refund' },
            ])}
            {renderOptionRow(
              'Payment method',
              'paymentMethod',
              PAYMENT_METHODS,
            )}
            {renderInput('Description', 'description', {
              placeholder: 'Payment description',
            })}
            {renderInput('Notes', 'notes', {
              placeholder: 'Additional notes',
              multiline: true,
            })}
          </View>

          <View style={styles.formCard}>
            <View style={styles.referenceHeader}>
              <Text style={styles.formSectionTitle}>Payment reference</Text>
              <TouchableOpacity
                onPress={() => {
                  const referenceId = generateReference();
                  setPayment(previous => ({
                    ...previous,
                    referenceId,
                    transactionId: referenceId,
                  }));
                }}>
                <Text style={styles.generateText}>Generate</Text>
              </TouchableOpacity>
            </View>
            {renderInput('Reference ID *', 'referenceId', {
              placeholder: 'Payment reference',
              autoCapitalize: 'characters',
            })}
            {renderInput('Transaction ID', 'transactionId', {
              placeholder: 'Optional; defaults to reference ID',
              autoCapitalize: 'characters',
            })}
            {renderOptionRow('Gateway', 'gateway', ['razorpay', 'stripe', 'manual'])}
            {payment.paymentMethod === 'bank_transfer'
              ? renderInput('Bank name', 'bankName', { placeholder: 'Bank name' })
              : null}
            {payment.paymentMethod.includes('card')
              ? renderInput('Card last 4 digits', 'accountLast4', {
                  placeholder: '1234',
                  keyboardType: 'number-pad',
                })
              : null}
            {[
              { field: 'sendReceipt', label: 'Send receipt to company' },
              { field: 'notifyCompany', label: 'Notify company' },
            ].map(option => (
              <TouchableOpacity
                key={option.field}
                style={styles.checkRow}
                onPress={() => updatePayment(option.field, !payment[option.field])}>
                <View style={[styles.checkbox, payment[option.field] && styles.checkboxActive]}>
                  {payment[option.field] ? (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  ) : null}
                </View>
                <Text style={styles.checkLabel}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.submitButton, saving && styles.disabledButton]}
            onPress={submitPayment}
            disabled={saving}>
            {saving ? <ActivityIndicator color="#FFFFFF" /> : <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />}
            <Text style={styles.submitButtonText}>
              {saving ? 'Saving transaction...' : 'Record transaction'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );

  const renderDetailsModal = () => {
    if (!selectedTransaction) return null;
    const company = getRelatedCompany({
      ...selectedTransaction,
      invoice:
        selectedTransaction.invoice ||
        (typeof selectedTransaction.invoiceId === 'object'
          ? selectedTransaction.invoiceId
          : null),
    });
    const method = selectedTransaction.paymentMethod || selectedTransaction.gateway || 'Unknown';
    return (
      <Modal
        visible={detailVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setDetailVisible(false)}>
        <View style={[styles.modalScreen, { paddingTop: Math.max(insets.top, 12) }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setDetailVisible(false)}>
              <Ionicons name="close" size={22} color="#334155" />
            </TouchableOpacity>
            <View style={styles.modalTitleWrap}>
              <Text style={styles.modalTitle}>Transaction details</Text>
              <Text style={styles.modalSubtitle}>Payment record information</Text>
            </View>
          </View>
          {detailLoading ? (
            <View style={styles.centerState}>
              <ActivityIndicator color="#2563EB" />
              <Text style={styles.stateText}>Loading transaction...</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.detailBody}>
              <View style={styles.detailAmountCard}>
                <Text style={styles.detailLabel}>AMOUNT</Text>
                <Text style={styles.detailAmount}>
                  {currencyText(selectedTransaction.amount, selectedTransaction.currency)}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: statusColor(selectedTransaction.status).backgroundColor }]}>
                  <Text style={[styles.statusText, { color: statusColor(selectedTransaction.status).color }]}>
                    {selectedTransaction.status || 'pending'}
                  </Text>
                </View>
              </View>
              {[
                ['Company', company.name],
                ['Email', company.email || '—'],
                ['Date', formatDate(selectedTransaction.date || selectedTransaction.createdAt)],
                ['Type', getTypeLabel(selectedTransaction.type)],
                ['Payment method', method.replaceAll('_', ' ')],
                ['Reference', selectedTransaction.referenceId || '—'],
                ['Transaction ID', selectedTransaction.transactionId || selectedTransaction.razorpayPaymentId || '—'],
                ['Invoice', company.invoice?.invoiceNumber || '—'],
                ['Description', selectedTransaction.description || '—'],
                ['Notes', selectedTransaction.notes || '—'],
                ['Gateway', selectedTransaction.gateway || '—'],
              ].map(([label, value]) => (
                <View key={label} style={styles.detailRow}>
                  <Text style={styles.detailRowLabel}>{label}</Text>
                  <Text style={styles.detailRowValue}>{String(value)}</Text>
                </View>
              ))}
              {!(
                selectedTransaction.source === 'PAYMENT' ||
                selectedTransaction.razorpayPaymentId ||
                selectedTransaction.razorpayOrderId ||
                selectedTransaction.paymentId
              ) ? (
                <TouchableOpacity
                  style={styles.deleteDetailButton}
                  onPress={() => confirmDelete(selectedTransaction)}>
                  <Ionicons name="trash-outline" size={17} color="#B91C1C" />
                  <Text style={styles.deleteDetailText}>Delete transaction</Text>
                </TouchableOpacity>
              ) : null}
            </ScrollView>
          )}
        </View>
      </Modal>
    );
  };

  const filterBadgeCount = [
    filters.status !== 'all',
    filters.type !== 'all',
    filters.paymentMethod !== 'all',
    Boolean(filters.startDate),
    Boolean(filters.endDate),
  ].filter(Boolean).length;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) + 8 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={21} color="#1E293B" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Transactions</Text>
          <Text style={styles.headerSubtitle}>Manage all payment transactions</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={openCreatePayment}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={17} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={() => setFilter('search', searchText.trim())}
            returnKeyType="search"
            placeholder="Search reference, company..."
            placeholderTextColor="#94A3B8"
          />
          {searchText ? (
            <TouchableOpacity
              onPress={() => {
                setSearchText('');
                setFilter('search', '');
              }}>
              <Ionicons name="close-circle" size={17} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity
          style={[styles.filterButton, filterVisible && styles.filterButtonActive]}
          onPress={() => setFilterVisible(value => !value)}>
          <Ionicons name="options-outline" size={17} color={filterVisible ? '#2563EB' : '#475569'} />
          {filterBadgeCount > 0 ? (
            <View style={styles.filterCount}><Text style={styles.filterCountText}>{filterBadgeCount}</Text></View>
          ) : null}
        </TouchableOpacity>
      </View>

      {filterVisible ? (
        <View style={styles.filtersPanel}>
          {[
            { label: 'Status', key: 'status', options: ['all', 'completed', 'pending', 'failed', 'processing', 'refunded'] },
            { label: 'Type', key: 'type', options: ['all', 'invoice_payment', 'advance_payment', 'refund', 'credit_note'] },
            { label: 'Payment method', key: 'paymentMethod', options: ['all', 'upi', 'credit_card', 'debit_card', 'bank_transfer', 'cash', 'cheque'] },
          ].map(group => (
            <View key={group.key} style={styles.filterGroup}>
              <Text style={styles.filterLabel}>{group.label}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.filterOptions}>
                  {group.options.map(option => {
                    const active = filters[group.key] === option;
                    return (
                      <TouchableOpacity
                        key={option}
                        style={[styles.filterChip, active && styles.filterChipActive]}
                        onPress={() => setFilter(group.key, option)}>
                        <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                          {option === 'all' ? 'All' : option.replaceAll('_', ' ')}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          ))}
          <View style={styles.filterDates}>
            <View style={styles.filterDateField}>
              <Text style={styles.filterLabel}>From date</Text>
              <TextInput
                style={styles.dateInput}
                value={filters.startDate}
                onChangeText={value => setFilter('startDate', value)}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94A3B8"
              />
            </View>
            <View style={styles.filterDateField}>
              <Text style={styles.filterLabel}>To date</Text>
              <TextInput
                style={styles.dateInput}
                value={filters.endDate}
                onChangeText={value => setFilter('endDate', value)}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Sort by</Text>
            <View style={styles.filterOptions}>
              {['date', 'amount', 'status', 'companyName'].map(option => {
                const active = filters.sortBy === option;
                return (
                  <TouchableOpacity
                    key={option}
                    style={[styles.filterChip, active && styles.filterChipActive]}
                    onPress={() =>
                      setFilters(previous => ({
                        ...previous,
                        sortBy: option,
                        page: 1,
                      }))
                    }>
                    <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                      {option === 'companyName' ? 'Company' : option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          <View style={styles.filterFooter}>
            <TouchableOpacity
              onPress={() => {
                setFilters(INITIAL_FILTERS);
                setSearchText('');
              }}>
              <Text style={styles.clearFiltersText}>Clear filters</Text>
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
              <Ionicons name="swap-vertical" size={15} color="#334155" />
              <Text style={styles.sortText}>
                Date {filters.sortOrder === 'asc' ? '↑' : '↓'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      <View style={styles.statsRow}>
        {[
          { title: 'Transactions', value: pagination.total, icon: 'receipt-outline', color: '#2563EB', bg: '#DBEAFE' },
          { title: 'USD amount', value: currencyText(stats.amountByCurrency.USD, 'USD'), icon: 'cash-outline', color: '#059669', bg: '#D1FAE5' },
          { title: 'INR amount', value: currencyText(stats.amountByCurrency.INR, 'INR'), icon: 'cash-outline', color: '#059669', bg: '#D1FAE5' },
          { title: 'Completed', value: stats.completed, icon: 'checkmark-circle-outline', color: '#16A34A', bg: '#DCFCE7' },
          { title: 'Failed', value: stats.failed, icon: 'close-circle-outline', color: '#DC2626', bg: '#FEE2E2' },
        ].map(stat => (
          <View key={stat.title} style={styles.statCard}>
            <View style={styles.statMain}>
              <View style={[styles.statIcon, { backgroundColor: stat.bg }]}>
                <Ionicons name={stat.icon} size={16} color={stat.color} />
              </View>
              <Text style={styles.statValue} numberOfLines={1}>{stat.value}</Text>
            </View>
            <Text style={styles.statTitle} numberOfLines={1}>{stat.title}</Text>
          </View>
        ))}
      </View>

      {loading && transactions.length === 0 ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.stateText}>Loading transactions...</Text>
        </View>
      ) : error && transactions.length === 0 ? (
        <View style={styles.centerState}>
          <Ionicons name="alert-circle-outline" size={34} color="#DC2626" />
          <Text style={styles.errorTitle}>Unable to load transactions</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadTransactions()}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          style={styles.transactionList}
          data={transactions}
          keyExtractor={item => String(item._id)}
          renderItem={renderTransaction}
          contentContainerStyle={[
            styles.listContent,
            transactions.length === 0 && styles.emptyContent,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadTransactions({ refresh: true })}
              tintColor="#2563EB"
              colors={['#2563EB']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="wallet-outline" size={28} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>No transactions found</Text>
              <Text style={styles.emptyMessage}>Create a transaction or adjust your search filters.</Text>
              <TouchableOpacity style={styles.emptyAction} onPress={openCreatePayment}>
                <Ionicons name="add" size={17} color="#FFFFFF" />
                <Text style={styles.emptyActionText}>New transaction</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
      {pagination.pages > 1 ? (
        <View
          style={[
            styles.pagination,
            { marginBottom: Math.max(insets.bottom, 8) },
          ]}>
          <Text style={styles.paginationText}>
            Page {filters.page} of {pagination.pages} · {pagination.total} transactions
          </Text>
          <View style={styles.paginationActions}>
            <TouchableOpacity
              style={[styles.pageButton, filters.page <= 1 && styles.pageButtonDisabled]}
              disabled={filters.page <= 1}
              onPress={() => setFilter('page', filters.page - 1)}>
              <Ionicons name="chevron-back" size={17} color="#334155" />
              <Text style={styles.pageButtonText}>Previous</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.pageButton,
                filters.page >= pagination.pages && styles.pageButtonDisabled,
              ]}
              disabled={filters.page >= pagination.pages}
              onPress={() => setFilter('page', filters.page + 1)}>
              <Text style={styles.pageButtonText}>Next</Text>
              <Ionicons name="chevron-forward" size={17} color="#334155" />
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
      {renderCreateModal()}
      {renderDetailsModal()}
    </View>
  );
};

export default AdminTransactionsScreen;

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
  toolbar: {
    flexDirection: 'row',
    gap: 9,
    paddingHorizontal: 16,
    paddingTop: 13,
    paddingBottom: 10,
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
    paddingHorizontal: 11,
    gap: 8,
  },
  searchInput: { flex: 1, color: '#0F172A', fontSize: font.sm, paddingVertical: 8 },
  filterButton: {
    width: 42,
    height: 42,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: { backgroundColor: '#EFF6FF', borderColor: '#93C5FD' },
  filterCount: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    backgroundColor: '#2563EB',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterCountText: { color: '#FFFFFF', fontSize: font.caption, fontWeight: '800' },
  filtersPanel: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
  },
  filterGroup: { marginBottom: 11 },
  filterDates: { flexDirection: 'row', gap: 9, marginBottom: 10 },
  filterDateField: { flex: 1 },
  dateInput: {
    height: 36,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    color: '#334155',
    fontSize: font.xs,
    paddingHorizontal: 9,
  },
  filterLabel: {
    color: '#64748B',
    fontSize: font.caption,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 7,
  },
  filterOptions: { flexDirection: 'row', gap: 6 },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  filterChipActive: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  filterChipText: { color: '#64748B', fontSize: font.xs, textTransform: 'capitalize' },
  filterChipTextActive: { color: '#1D4ED8', fontWeight: '700' },
  filterFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 3,
  },
  clearFiltersText: { color: '#2563EB', fontSize: font.small, fontWeight: '700' },
  sortButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sortText: { color: '#334155', fontSize: font.xs, fontWeight: '600' },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  statCard: {
    flexGrow: 1,
    flexBasis: '46%',
    minWidth: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 9,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statMain: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  statIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: { color: '#0F172A', fontSize: font.lg, fontWeight: '800', flex: 1, minWidth: 0 },
  statTitle: { color: '#64748B', fontSize: font.xs, marginTop: 3 },
  transactionList: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 20 },
  emptyContent: { flexGrow: 1 },
  transactionCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 13,
    marginBottom: 10,
  },
  transactionTop: { flexDirection: 'row', alignItems: 'center' },
  transactionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  transactionMain: { flex: 1 },
  transactionAmount: { color: '#0F172A', fontSize: font.md, fontWeight: '800' },
  transactionType: { color: '#64748B', fontSize: font.xs, marginTop: 2 },
  statusBadge: { borderRadius: 20, paddingHorizontal: 9, paddingVertical: 5 },
  statusText: { fontSize: font.caption, fontWeight: '800', textTransform: 'capitalize' },
  transactionDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 10 },
  transactionMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 6,
  },
  transactionMeta: { color: '#475569', fontSize: font.xs, flex: 1 },
  transactionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  referenceText: { color: '#94A3B8', fontSize: font.caption, flex: 1, minWidth: 0 },
  methodText: {
    color: '#64748B',
    fontSize: font.xs,
    maxWidth: '35%',
    flexShrink: 1,
    textAlign: 'right',
    textTransform: 'capitalize',
  },
  deleteButton: {
    padding: 4,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  stateText: { color: '#64748B', fontSize: font.sm, marginTop: 10 },
  errorTitle: { color: '#1E293B', fontSize: font.base, fontWeight: '700', marginTop: 10 },
  errorMessage: { color: '#64748B', fontSize: font.small, textAlign: 'center', marginTop: 5 },
  retryButton: { padding: 10, marginTop: 5 },
  retryText: { color: '#2563EB', fontSize: font.sm, fontWeight: '700' },
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
  pagination: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 3,
  },
  paginationText: { color: '#64748B', fontSize: font.xs, textAlign: 'center' },
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
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  pageButtonDisabled: { opacity: 0.4 },
  pageButtonText: { color: '#334155', fontSize: font.xs, fontWeight: '600' },
  modalScreen: { flex: 1, backgroundColor: '#F8FAFC' },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalClose: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  modalTitleWrap: { flex: 1 },
  modalTitle: { color: '#0F172A', fontSize: font.md, fontWeight: '800' },
  modalSubtitle: { color: '#64748B', fontSize: font.xs, marginTop: 3 },
  modalBody: { padding: 15 },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  formSectionTitle: { color: '#1E293B', fontSize: font.sm, fontWeight: '800', marginBottom: 12 },
  formField: { flex: 1, minWidth: 0, marginBottom: 12 },
  formLabel: {
    color: '#64748B',
    fontSize: font.caption,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  formInput: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 11,
    paddingVertical: 9,
    color: '#0F172A',
    fontSize: font.sm,
  },
  formTextarea: { minHeight: 78, textAlignVertical: 'top' },
  formTwoColumns: { flexDirection: 'row', gap: 9 },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  optionChip: {
    minHeight: 32,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  optionChipActive: { backgroundColor: '#EFF6FF', borderColor: '#60A5FA' },
  optionText: { color: '#64748B', fontSize: font.caption, fontWeight: '600', textTransform: 'capitalize' },
  optionTextActive: { color: '#1D4ED8', fontWeight: '800' },
  selectedCompany: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  companyAvatar: {
    width: 33,
    height: 33,
    borderRadius: 10,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
  },
  companyInitial: { color: '#1D4ED8', fontSize: font.bodySmall, fontWeight: '800' },
  selectedCompanyName: { flex: 1, color: '#1E293B', fontSize: font.small, fontWeight: '700' },
  clearText: { color: '#2563EB', fontSize: font.xs, fontWeight: '700' },
  selectResult: {
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  selectedResult: { backgroundColor: '#EFF6FF' },
  selectResultName: { color: '#1E293B', fontSize: font.small, fontWeight: '700' },
  selectResultDetail: { color: '#64748B', fontSize: font.caption, marginTop: 3 },
  loadingInline: { paddingVertical: 8 },
  helperText: { color: '#94A3B8', fontSize: font.xs, marginBottom: 10 },
  clearInvoice: { alignSelf: 'flex-start', paddingVertical: 8 },
  referenceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  generateText: { color: '#2563EB', fontSize: font.xs, fontWeight: '800', marginBottom: 12 },
  checkRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },
  checkboxActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  checkLabel: { color: '#334155', fontSize: font.small, fontWeight: '600' },
  submitButton: {
    minHeight: 48,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 2,
  },
  submitButtonText: { color: '#FFFFFF', fontSize: font.sm, fontWeight: '800' },
  disabledButton: { opacity: 0.55 },
  detailBody: { padding: 16, paddingBottom: 32 },
  detailAmountCard: {
    alignItems: 'center',
    backgroundColor: '#1E3A8A',
    borderRadius: 15,
    padding: 20,
    marginBottom: 14,
  },
  detailLabel: { color: '#BFDBFE', fontSize: font.caption, fontWeight: '800', letterSpacing: 1 },
  detailAmount: { color: '#FFFFFF', fontSize: font.displayLarge, fontWeight: '800', marginVertical: 9 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  detailRowLabel: { color: '#64748B', fontSize: font.small, flex: 0.8 },
  detailRowValue: { color: '#1E293B', fontSize: font.small, fontWeight: '600', flex: 1.2, textAlign: 'right' },
  deleteDetailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    padding: 13,
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    marginTop: 18,
  },
  deleteDetailText: { color: '#B91C1C', fontSize: font.small, fontWeight: '700' },
});
