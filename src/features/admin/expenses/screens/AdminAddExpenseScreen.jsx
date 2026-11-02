import { font } from '../../../../theme/typography';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../../../../store/hooks';
import {
  createAdminExpense,
  fetchAdminExpense,
  fetchExpenseHeads,
  updateAdminExpense,
} from '../api/expensesApi';

const CURRENCIES = ['USD', 'GBP', 'EUR', 'INR'];
const COUNTRIES = ['US', 'UK', 'CA', 'IN', 'AU', 'AE'];
const SERVICE_TYPES = [
  { value: 'company_registration', label: 'Company registration' },
  { value: 'tax_filing', label: 'Tax filing' },
  { value: 'accounting', label: 'Accounting' },
  { value: 'legal', label: 'Legal' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'other', label: 'Other' },
];
const PAYMENT_METHODS = [
  { value: 'bank', label: 'Bank transfer' },
  { value: 'card', label: 'Card' },
  { value: 'cash', label: 'Cash' },
  { value: 'online', label: 'Online' },
  { value: 'cheque', label: 'Cheque' },
];

const todayString = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

const EMPTY_FORM = {
  expenseHeadId: '',
  amount: '',
  currency: 'USD',
  country: 'US',
  serviceType: 'other',
  paymentMethod: 'bank',
  expenseDate: todayString(),
  notes: '',
};

const AdminAddExpenseScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const token = useAppSelector(state => state.auth.token);
  const expenseId = route.params?.expenseId;
  const isEditing = Boolean(expenseId);
  const [form, setForm] = useState(EMPTY_FORM);
  const [expenseHeads, setExpenseHeads] = useState([]);
  const [headSearch, setHeadSearch] = useState('');
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const selectedHead = expenseHeads.find(
    head => String(head._id) === String(form.expenseHeadId),
  );
  const filteredHeads = useMemo(() => {
    const query = headSearch.trim().toLowerCase();
    return expenseHeads.filter(head =>
      String(head.name || '').toLowerCase().includes(query),
    );
  }, [expenseHeads, headSearch]);

  useEffect(() => {
    let active = true;
    const loadForm = async () => {
      setLoading(true);
      setError('');
      try {
        const [heads, expense] = await Promise.all([
          fetchExpenseHeads(token),
          isEditing ? fetchAdminExpense({ token, id: expenseId }) : Promise.resolve(null),
        ]);
        if (!active) return;
        setExpenseHeads(heads);
        if (expense) {
          const expenseHeadId =
            expense.expenseHeadId?._id || expense.expenseHeadId || '';
          setForm({
            expenseHeadId: String(expenseHeadId),
            amount: String(expense.amount ?? ''),
            currency: expense.currency || 'USD',
            country: expense.country || 'US',
            serviceType: expense.serviceType || 'other',
            paymentMethod: expense.paymentMethod || 'bank',
            expenseDate: expense.expenseDate
              ? String(expense.expenseDate).slice(0, 10)
              : todayString(),
            notes: expense.notes || '',
          });
          setHeadSearch(expense.expenseHeadId?.name || '');
        }
      } catch (loadError) {
        if (active) setError(loadError.message);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadForm();
    return () => {
      active = false;
    };
  }, [expenseId, isEditing, token]);

  useEffect(() => {
    if (selectedHead) setHeadSearch(selectedHead.name || '');
  }, [selectedHead]);

  const updateForm = (key, value) =>
    setForm(previous => ({ ...previous, [key]: value }));

  const save = async () => {
    if (!form.expenseHeadId) {
      Alert.alert('Expense head required', 'Please select an expense head.');
      return;
    }
    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      Alert.alert('Invalid amount', 'Enter an amount greater than zero.');
      return;
    }
    if (!form.expenseDate) {
      Alert.alert('Expense date required', 'Please select an expense date.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        amount,
        expenseDate: new Date(`${form.expenseDate}T00:00:00`).toISOString(),
      };
      if (isEditing) {
        await updateAdminExpense({ token, id: expenseId, payload });
      } else {
        await createAdminExpense({ token, payload });
      }
      Alert.alert(
        isEditing ? 'Expense updated' : 'Expense created',
        isEditing
          ? 'The expense was updated successfully.'
          : 'The expense was created successfully.',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const renderChoices = (label, key, values) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label} *</Text>
      <View style={styles.choiceRow}>
        {values.map(option => {
          const value = typeof option === 'string' ? option : option.value;
          const title = typeof option === 'string' ? option : option.label;
          const active = form[key] === value;
          return (
            <TouchableOpacity
              key={value}
              style={[styles.choice, active && styles.choiceActive]}
              onPress={() => updateForm(key, value)}>
              <Text style={[styles.choiceText, active && styles.choiceTextActive]}>
                {title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 8) }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={21} color="#1E293B" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Edit Expense' : 'Add Expense'}
          </Text>
          <Text style={styles.headerSubtitle}>Record an admin expense</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headsButton}
            onPress={() => navigation.navigate('AdminExpenses')}
            accessibilityRole="button"
            accessibilityLabel="View expenses">
            <Ionicons name="receipt-outline" size={17} color="#2563EB" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headsButton}
            onPress={() => navigation.navigate('AdminExpenseHeads')}
            accessibilityRole="button"
            accessibilityLabel="Manage expense heads">
            <Ionicons name="list-outline" size={18} color="#2563EB" />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading expense details...</Text>
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.content}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: 24 + insets.bottom },
            ]}>
            {error ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                  <Ionicons name="receipt-outline" size={17} color="#FFFFFF" />
                </View>
                <Text style={styles.sectionTitle}>Expense details</Text>
              </View>

              <View style={styles.field}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Expense head *</Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('AdminExpenseHeads')}>
                    <Text style={styles.manageLink}>Manage</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.input}
                  value={selectedHead?.name || headSearch}
                  onChangeText={value => {
                    setHeadSearch(value);
                    if (form.expenseHeadId) updateForm('expenseHeadId', '');
                  }}
                  placeholder="Search expense head"
                  placeholderTextColor="#94A3B8"
                />
                {headSearch.trim() ? (
                  <View style={styles.headResults}>
                    {filteredHeads.length ? (
                      filteredHeads.slice(0, 8).map(head => (
                        <TouchableOpacity
                          key={head._id}
                          style={styles.headResult}
                          onPress={() => {
                            updateForm('expenseHeadId', head._id);
                            setHeadSearch(head.name || '');
                          }}>
                          <Text style={styles.headResultName}>{head.name}</Text>
                          <Text style={styles.headResultMeta}>
                            {[head.category, head.country].filter(Boolean).join(' · ')}
                          </Text>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <Text style={styles.noHeadsText}>No matching expense head.</Text>
                    )}
                  </View>
                ) : expenseHeads.length === 0 ? (
                  <Text style={styles.hint}>
                    No active expense heads. Create one using Manage.
                  </Text>
                ) : (
                  <Text style={styles.hint}>
                    Select an existing expense head by searching above.
                  </Text>
                )}
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Amount *</Text>
                <TextInput
                  style={styles.input}
                  value={form.amount}
                  onChangeText={value => updateForm('amount', value)}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              {renderChoices('Currency', 'currency', CURRENCIES)}
              {renderChoices('Country', 'country', COUNTRIES)}
              {renderChoices('Service type', 'serviceType', SERVICE_TYPES)}
              {renderChoices('Payment method', 'paymentMethod', PAYMENT_METHODS)}

              <View style={styles.field}>
                <Text style={styles.label}>Expense date *</Text>
                <TextInput
                  style={styles.input}
                  value={form.expenseDate}
                  onChangeText={value => updateForm('expenseDate', value)}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#94A3B8"
                />
                <Text style={styles.hint}>Enter date in YYYY-MM-DD format.</Text>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Notes</Text>
                <TextInput
                  style={[styles.input, styles.notesInput]}
                  value={form.notes}
                  onChangeText={value => updateForm('notes', value)}
                  placeholder="Add notes..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  maxLength={500}
                  textAlignVertical="top"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.disabledButton]}
              onPress={save}
              disabled={saving}>
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Ionicons name="checkmark-circle-outline" size={19} color="#FFFFFF" />
              )}
              <Text style={styles.saveButtonText}>
                {saving ? 'Saving...' : isEditing ? 'Update expense' : 'Create expense'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              disabled={saving}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </View>
  );
};

export default AdminAddExpenseScreen;

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
  headerActions: { flexDirection: 'row', gap: 7 },
  headsButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1 },
  scrollContent: { padding: 16 },
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#64748B', fontSize: font.sm, marginTop: 10 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sectionIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },
  sectionTitle: { color: '#0F172A', fontSize: font.bodySmall, fontWeight: '800' },
  field: { marginBottom: 14 },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: { color: '#334155', fontSize: font.xs, fontWeight: '700', marginBottom: 6 },
  manageLink: { color: '#2563EB', fontSize: font.xs, fontWeight: '700' },
  input: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 11,
    color: '#1E293B',
    fontSize: font.sm,
  },
  notesInput: { minHeight: 84, paddingTop: 10 },
  hint: { color: '#94A3B8', fontSize: font.caption, marginTop: 5 },
  headResults: {
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 9,
    overflow: 'hidden',
  },
  headResult: {
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headResultName: { color: '#1E293B', fontSize: font.small, fontWeight: '600' },
  headResultMeta: { color: '#64748B', fontSize: font.caption, marginTop: 2 },
  noHeadsText: { color: '#64748B', fontSize: font.xs, padding: 10 },
  choiceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  choice: {
    minHeight: 32,
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  choiceActive: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  choiceText: { color: '#64748B', fontSize: font.caption },
  choiceTextActive: { color: '#1D4ED8', fontWeight: '700' },
  saveButton: {
    minHeight: 46,
    borderRadius: 11,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 14,
  },
  disabledButton: { opacity: 0.6 },
  saveButtonText: { color: '#FFFFFF', fontSize: font.sm, fontWeight: '800' },
  cancelButton: { padding: 12, alignItems: 'center' },
  cancelButtonText: { color: '#64748B', fontSize: font.small, fontWeight: '700' },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderRadius: 9,
    padding: 10,
    marginBottom: 12,
  },
  errorText: { color: '#B91C1C', fontSize: font.xs },
});
