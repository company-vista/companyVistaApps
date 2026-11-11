import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { font } from '../../../../theme/typography';
import { useAppSelector } from '../../../../store/hooks';
import {
  fetchAdminTransaction,
  fetchCompanyInvoices,
  fetchTransactionCompanies,
  updateAdminTransaction,
} from '../api/transactionsApi';

const STATUSES = ['completed', 'pending', 'failed', 'processing'];
const TYPES = [
  { value: 'invoice_payment', label: 'Invoice' },
  { value: 'advance_payment', label: 'Advance' },
  { value: 'refund', label: 'Refund' },
  { value: 'credit_note', label: 'Credit note' },
];
const PAYMENT_METHODS = [
  { value: 'upi', label: 'UPI' },
  { value: 'credit_card', label: 'Credit card' },
  { value: 'debit_card', label: 'Debit card' },
  { value: 'bank_transfer', label: 'Bank transfer' },
  { value: 'cash', label: 'Cash' },
  { value: 'cheque', label: 'Cheque' },
];
const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD'];
const GATEWAYS = ['razorpay', 'stripe', 'manual'];

const getId = value =>
  value && typeof value === 'object' ? value._id || value.id || '' : value || '';

const getCompanyName = company =>
  company?.companyName || company?.name || 'Unknown company';

const getDateValue = value => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const getInitialPayment = transaction => {
  const companyReference = transaction.company || transaction.companyId;
  const company =
    companyReference && typeof companyReference === 'object'
      ? companyReference
      : {};
  const invoice =
    transaction.invoiceId && typeof transaction.invoiceId === 'object'
      ? transaction.invoiceId
      : transaction.invoice && typeof transaction.invoice === 'object'
        ? transaction.invoice
        : {};
  const invoiceTotal = Number(invoice.total || invoice.totalAmount || invoice.amount || 0);
  const invoicePaid =
    String(invoice.paymentStatus || '').toLowerCase() === 'paid'
      ? invoiceTotal
      : Number(invoice.paidAmount || invoice.paid || 0);
  return {
    amount: String(transaction.amount ?? ''),
    date: getDateValue(transaction.date || transaction.createdAt),
    status: transaction.status || 'completed',
    type: transaction.type || 'invoice_payment',
    currency: String(transaction.currency || 'INR').toUpperCase(),
    description: transaction.description || '',
    notes: transaction.notes || '',
    companyId: getId(transaction.companyId || transaction.company),
    companyName:
      company.companyName ||
      company.name ||
      transaction.companyName ||
      'Unknown company',
    companyEmail: company.email || transaction.companyEmail || '',
    invoiceId: getId(transaction.invoiceId),
    invoiceNumber: invoice.invoiceNumber || transaction.invoiceNumber || '',
    invoiceOutstanding: Number(
      invoice.outstanding ??
        transaction.invoiceOutstanding ??
        Math.max(invoiceTotal - invoicePaid, 0),
    ),
    invoiceStatus: String(
      invoice.paymentStatus || transaction.invoiceStatus || '',
    ).toUpperCase(),
    paymentMethod: transaction.paymentMethod || 'upi',
    referenceId: transaction.referenceId || '',
    transactionId: transaction.transactionId || '',
    gateway: transaction.gateway || 'razorpay',
    bankName: transaction.bankName || '',
    accountLast4: transaction.accountLast4 || '',
    sendReceipt: Boolean(transaction.meta?.sendReceipt),
    notifyCompany: Boolean(transaction.meta?.notifyCompany),
  };
};

const AdminEditTransactionScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const token = useAppSelector(state => state.auth.token);
  const transactionId = route.params?.id;
  const [payment, setPayment] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [companyQuery, setCompanyQuery] = useState('');
  const [invoiceQuery, setInvoiceQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    const loadForm = async () => {
      if (!transactionId) {
        setLoadError('Transaction ID is missing.');
        setLoading(false);
        Alert.alert('Unable to edit transaction', 'Transaction ID is missing.');
        return;
      }

      try {
        const transaction = await fetchAdminTransaction({ token, id: transactionId });
        if (!active) return;
        const initialPayment = getInitialPayment(transaction);
        setPayment(initialPayment);
        setCompanyQuery(initialPayment.companyName);

        try {
          const companyList = await fetchTransactionCompanies(token);
          if (!active) return;
          setCompanies(companyList);
        } catch (error) {
          if (active) {
            Alert.alert('Unable to load companies', error.message);
          }
        }

        if (initialPayment.companyId) {
          try {
            const companyInvoices = await fetchCompanyInvoices({
              token,
              companyId: initialPayment.companyId,
            });
            if (!active) return;
            setInvoices(companyInvoices);
          } catch (error) {
            if (active) {
              Alert.alert('Unable to load invoices', error.message);
            }
          }
        }
        if (!active) return;
        setInvoiceQuery(initialPayment.invoiceNumber);
      } catch (error) {
        if (active) {
          setLoadError(error.message);
          Alert.alert('Unable to load transaction', error.message);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadForm();
    return () => {
      active = false;
    };
  }, [token, transactionId]);

  const filteredCompanies = useMemo(() => {
    const query = companyQuery.trim().toLowerCase();
    if (!query || payment?.companyId && companyQuery === payment.companyName) {
      return [];
    }
    return companies
      .filter(company => {
        const name = getCompanyName(company).toLowerCase();
        const email = String(company.email || company.companyEmail || '').toLowerCase();
        return name.includes(query) || email.includes(query);
      })
      .slice(0, 8);
  }, [companies, companyQuery, payment]);

  const filteredInvoices = useMemo(() => {
    const query = invoiceQuery.trim().toLowerCase();
    return invoices
      .filter(invoice => {
        if (!query) return true;
        return String(invoice.invoiceNumber || '').toLowerCase().includes(query);
      })
      .slice(0, 8);
  }, [invoiceQuery, invoices]);

  const updateField = (field, value) =>
    setPayment(current => ({ ...current, [field]: value }));

  const selectCompany = async company => {
    const companyId = getId(company);
    setPayment(current => ({
      ...current,
      companyId,
      companyName: getCompanyName(company),
      companyEmail: company.email || company.companyEmail || '',
      invoiceId: '',
      invoiceNumber: '',
      invoiceOutstanding: 0,
      invoiceStatus: '',
    }));
    setCompanyQuery(getCompanyName(company));
    setInvoiceQuery('');
    setInvoices([]);
    try {
      setInvoices(await fetchCompanyInvoices({ token, companyId }));
    } catch (error) {
      Alert.alert('Unable to load invoices', error.message);
    }
  };

  const selectInvoice = invoice => {
    const total = Number(invoice.total || invoice.totalAmount || invoice.amount || 0);
    const paid =
      String(invoice.paymentStatus || '').toLowerCase() === 'paid'
        ? total
        : Number(invoice.paidAmount || invoice.paid || 0);
    setPayment(current => ({
      ...current,
      invoiceId: getId(invoice),
      invoiceNumber: invoice.invoiceNumber || '',
      invoiceOutstanding: Math.max(total - paid, 0),
      invoiceStatus: paid >= total ? 'PAID' : paid > 0 ? 'PARTIAL' : 'UNPAID',
      amount:
        current.invoiceId && current.invoiceId === getId(invoice)
          ? current.amount
          : String(Math.max(total - paid, 0) || total),
      currency: invoice.currency || current.currency,
    }));
    setInvoiceQuery(invoice.invoiceNumber || '');
  };

  const submitUpdate = async () => {
    const amount = Number.parseFloat(payment.amount);
    if (!payment.companyId) {
      Alert.alert('Company required', 'Please select a company.');
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      Alert.alert('Invalid amount', 'Enter a payment amount greater than zero.');
      return;
    }
    if (!payment.date.trim() || !payment.referenceId.trim()) {
      Alert.alert('Missing details', 'Payment date and reference ID are required.');
      return;
    }
    if (
      payment.invoiceId &&
      payment.invoiceStatus !== 'PAID' &&
      amount > Number(payment.invoiceOutstanding)
    ) {
      Alert.alert(
        'Amount exceeds outstanding balance',
        `Maximum amount is ${Number(payment.invoiceOutstanding).toLocaleString('en-IN', {
          style: 'currency',
          currency: payment.currency,
        })}.`,
      );
      return;
    }

    setSaving(true);
    try {
      await updateAdminTransaction({
        token,
        id: transactionId,
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
      Alert.alert('Payment updated', 'The transaction was updated successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Unable to update transaction', error.message);
    } finally {
      setSaving(false);
    }
  };

  const renderInput = (label, field, options = {}) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, options.multiline && styles.multiline]}
        value={String(payment?.[field] ?? '')}
        onChangeText={value => updateField(field, value)}
        placeholder={options.placeholder || ''}
        placeholderTextColor="#94A3B8"
        keyboardType={options.keyboardType || 'default'}
        autoCapitalize={options.autoCapitalize || 'sentences'}
        multiline={options.multiline}
        textAlignVertical={options.multiline ? 'top' : 'center'}
      />
    </View>
  );

  const renderOptions = (label, field, options) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.optionRow}>
        {options.map(option => {
          const value = typeof option === 'string' ? option : option.value;
          const title = typeof option === 'string' ? option : option.label;
          const selected = payment?.[field] === value;
          return (
            <TouchableOpacity
              key={value}
              style={[styles.option, selected && styles.optionSelected]}
              onPress={() => updateField(field, value)}>
              <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                {title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading transaction...</Text>
      </View>
    );
  }

  if (loadError || !payment) {
    return (
      <View style={styles.loadingScreen}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
        <Text style={styles.errorText}>
          {loadError || 'Transaction details are unavailable.'}
        </Text>
        <TouchableOpacity style={styles.backToListButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backToListText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) + 8 }]}>
        <TouchableOpacity
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={21} color="#1E293B" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>Edit transaction</Text>
          <Text style={styles.subtitle}>Update payment record</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 28 + insets.bottom }]}
        keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Company & invoice</Text>
          {payment.companyId && companyQuery === payment.companyName ? (
            <View style={styles.selectedRow}>
              <View style={styles.selectedCopy}>
                <Text style={styles.selectedName}>{payment.companyName}</Text>
                {!!payment.companyEmail && (
                  <Text style={styles.helperText}>{payment.companyEmail}</Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => {
                  updateField('companyId', '');
                  updateField('invoiceId', '');
                  updateField('invoiceNumber', '');
                  setCompanyQuery('');
                  setInvoiceQuery('');
                  setInvoices([]);
                }}>
                <Text style={styles.link}>Change</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.label}>Search company *</Text>
              <TextInput
                style={styles.input}
                value={companyQuery}
                onChangeText={setCompanyQuery}
                placeholder="Type a company name or email"
                placeholderTextColor="#94A3B8"
              />
              {filteredCompanies.map(company => (
                <TouchableOpacity
                  key={String(getId(company))}
                  style={styles.result}
                  onPress={() => selectCompany(company)}>
                  <Text style={styles.resultTitle}>{getCompanyName(company)}</Text>
                  <Text style={styles.helperText}>
                    {company.email || company.companyEmail || ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </>
          )}

          {payment.companyId ? (
            <>
              <Text style={[styles.label, styles.spacedLabel]}>Invoice (optional)</Text>
              <TextInput
                style={styles.input}
                value={invoiceQuery}
                onChangeText={setInvoiceQuery}
                placeholder="Search invoice number"
                placeholderTextColor="#94A3B8"
              />
              {filteredInvoices.map(invoice => (
                <TouchableOpacity
                  key={String(getId(invoice))}
                  style={[
                    styles.result,
                    payment.invoiceId === getId(invoice) && styles.resultSelected,
                  ]}
                  onPress={() => selectInvoice(invoice)}>
                  <Text style={styles.resultTitle}>
                    {invoice.invoiceNumber || `Invoice ${String(getId(invoice)).slice(-8)}`}
                  </Text>
                </TouchableOpacity>
              ))}
              {payment.invoiceId ? (
                <TouchableOpacity
                  onPress={() => {
                    updateField('invoiceId', '');
                    updateField('invoiceNumber', '');
                    setInvoiceQuery('');
                  }}>
                  <Text style={styles.link}>Clear selected invoice</Text>
                </TouchableOpacity>
              ) : null}
            </>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction details</Text>
          {renderInput('Amount *', 'amount', {
            keyboardType: 'decimal-pad',
            placeholder: '0.00',
          })}
          {renderInput('Date (YYYY-MM-DD) *', 'date', { placeholder: 'YYYY-MM-DD' })}
          {renderOptions('Currency', 'currency', CURRENCIES)}
          {renderOptions('Status', 'status', STATUSES)}
          {renderOptions('Type', 'type', TYPES)}
          {renderOptions('Payment method', 'paymentMethod', PAYMENT_METHODS)}
          {renderInput('Description', 'description', { placeholder: 'Payment description' })}
          {renderInput('Notes', 'notes', {
            placeholder: 'Additional notes',
            multiline: true,
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment reference</Text>
          {renderInput('Reference ID *', 'referenceId', {
            placeholder: 'Payment reference',
            autoCapitalize: 'characters',
          })}
          {renderInput('Transaction ID', 'transactionId', {
            placeholder: 'Defaults to reference ID',
            autoCapitalize: 'characters',
          })}
          {renderOptions('Gateway', 'gateway', GATEWAYS)}
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
              onPress={() => updateField(option.field, !payment[option.field])}>
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
          onPress={submitUpdate}
          disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
          )}
          <Text style={styles.submitText}>
            {saving ? 'Saving changes...' : 'Save changes'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default AdminEditTransactionScreen;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: { marginTop: 10, color: '#64748B', fontSize: font.sm },
  errorText: {
    color: '#B91C1C',
    fontSize: font.sm,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  backToListButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 9,
    backgroundColor: '#DBEAFE',
  },
  backToListText: { color: '#1D4ED8', fontSize: font.sm, fontWeight: '700' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: { padding: 6, marginRight: 10 },
  headerText: { flex: 1 },
  title: { color: '#0F172A', fontSize: font.md, fontWeight: '800' },
  subtitle: { color: '#64748B', fontSize: font.xs, marginTop: 2 },
  content: { padding: 16, gap: 14 },
  section: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: font.base,
    fontWeight: '800',
    marginBottom: 12,
  },
  field: { marginBottom: 12 },
  label: { color: '#334155', fontSize: font.xs, fontWeight: '700', marginBottom: 6 },
  spacedLabel: { marginTop: 10 },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 9,
    paddingHorizontal: 11,
    paddingVertical: 9,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
    fontSize: font.sm,
  },
  multiline: { minHeight: 84, textAlignVertical: 'top' },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  option: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 18,
    paddingHorizontal: 11,
    paddingVertical: 7,
    backgroundColor: '#FFFFFF',
  },
  optionSelected: { backgroundColor: '#DBEAFE', borderColor: '#2563EB' },
  optionText: { color: '#475569', fontSize: font.xs, fontWeight: '600' },
  optionTextSelected: { color: '#1D4ED8' },
  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 9,
    backgroundColor: '#F8FAFC',
    padding: 11,
  },
  selectedCopy: { flex: 1 },
  selectedName: { color: '#0F172A', fontSize: font.sm, fontWeight: '700' },
  helperText: { color: '#64748B', fontSize: font.xs, marginTop: 3 },
  link: { color: '#2563EB', fontSize: font.xs, fontWeight: '700', paddingVertical: 8 },
  result: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    marginTop: 6,
  },
  resultSelected: { backgroundColor: '#EFF6FF', borderColor: '#2563EB' },
  resultTitle: { color: '#1E293B', fontSize: font.sm, fontWeight: '600' },
  checkRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },
  checkboxActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  checkLabel: { color: '#334155', fontSize: font.sm },
  submitButton: {
    minHeight: 48,
    borderRadius: 11,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  disabledButton: { opacity: 0.65 },
  submitText: { color: '#FFFFFF', fontSize: font.sm, fontWeight: '800' },
});
