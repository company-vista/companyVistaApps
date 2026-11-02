import { font } from '../../../../theme/typography';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
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
import {
  createExpenseHead,
  deleteExpenseHead,
  fetchExpenseHeads,
  updateExpenseHead,
} from '../api/expensesApi';

const CATEGORIES = [
  'Office Supplies',
  'Travel',
  'Software',
  'Hardware',
  'Marketing',
  'Utilities',
  'Other',
];
const COUNTRIES = ['US', 'UK', 'CA', 'IN', 'AU', 'AE'];

const EMPTY_FORM = {
  name: '',
  category: '',
  country: '',
  isActive: true,
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

const AdminExpenseHeadsScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const token = useAppSelector(state => state.auth.token);
  const [expenseHeads, setExpenseHeads] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingHead, setEditingHead] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const loadHeads = useCallback(
    async ({ refresh = false } = {}) => {
      if (refresh) setRefreshing(true);
      else setLoading(true);
      setError('');
      try {
        const data = await fetchExpenseHeads(token);
        setExpenseHeads(data);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token],
  );

  useFocusEffect(
    useCallback(() => {
      loadHeads();
    }, [loadHeads]),
  );

  const filteredHeads = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return expenseHeads;
    return expenseHeads.filter(head =>
      [head.name, head.category, head.country]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [expenseHeads, search]);

  const updateForm = (key, value) =>
    setForm(previous => ({ ...previous, [key]: value }));

  const openCreate = () => {
    setEditingHead(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setModalVisible(true);
  };

  const openEdit = head => {
    setEditingHead(head);
    setForm({
      name: head.name || '',
      category: head.category || '',
      country: head.country || '',
      isActive: head.isActive !== false,
    });
    setErrors({});
    setModalVisible(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalVisible(false);
    setEditingHead(null);
    setErrors({});
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Name is required';
    if (!form.category) nextErrors.category = 'Category is required';
    if (!form.country) nextErrors.country = 'Country is required';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: form.name.trim(),
        category: form.category,
        country: form.country,
        isActive: form.isActive,
      };
      if (editingHead) {
        await updateExpenseHead({ token, id: editingHead._id, payload });
      } else {
        await createExpenseHead({ token, payload });
      }
      setModalVisible(false);
      setEditingHead(null);
      await loadHeads({ refresh: true });
    } catch (saveError) {
      Alert.alert('Unable to save expense head', saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = head => {
    Alert.alert(
      'Delete expense head?',
      `${head.name}. This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(head._id);
            try {
              await deleteExpenseHead({ token, id: head._id });
              await loadHeads({ refresh: true });
            } catch (deleteError) {
              Alert.alert('Unable to delete expense head', deleteError.message);
            } finally {
              setDeletingId('');
            }
          },
        },
      ],
    );
  };

  const renderHead = ({ item }) => {
    const isActive = item.isActive !== false;
    return (
      <View style={styles.headCard}>
        <View style={styles.cardHeader}>
          <View style={styles.headIcon}>
            <Ionicons name="pricetag-outline" size={18} color="#2563EB" />
          </View>
          <View style={styles.headMain}>
            <Text style={styles.headTitle} numberOfLines={1}>
              {item.name || 'Expense head'}
            </Text>
            <Text style={styles.headMeta} numberOfLines={1}>
              {[item.category, item.country].filter(Boolean).join(' · ') || '—'}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              isActive ? styles.activeBadge : styles.inactiveBadge,
            ]}>
            <Text
              style={[
                styles.statusText,
                isActive ? styles.activeText : styles.inactiveText,
              ]}>
              {isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="folder-outline" size={13} color="#64748B" />
            <Text style={styles.metaText} numberOfLines={1}>
              {item.category || 'Uncategorized'}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="globe-outline" size={13} color="#64748B" />
            <Text style={styles.metaText}>{item.country || '—'}</Text>
          </View>
        </View>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={13} color="#64748B" />
            <Text style={styles.metaText}>Created {formatDate(item.createdAt)}</Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => openEdit(item)}
            accessibilityRole="button"
            accessibilityLabel="Edit expense head">
            <Ionicons name="create-outline" size={16} color="#2563EB" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => confirmDelete(item)}
            disabled={deletingId === item._id}
            accessibilityRole="button"
            accessibilityLabel="Delete expense head">
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
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) + 8 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={21} color="#1E293B" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Expense Heads</Text>
          <Text style={styles.headerSubtitle}>Manage expense categories</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={openCreate}
          accessibilityRole="button"
          accessibilityLabel="Add expense head">
          <Ionicons name="add" size={23} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total</Text>
          <Text style={styles.summaryValue}>{expenseHeads.length}</Text>
          <Text style={styles.summaryHint}>expense heads</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Active</Text>
          <Text style={styles.summaryValue}>
            {expenseHeads.filter(head => head.isActive !== false).length}
          </Text>
          <Text style={styles.summaryHint}>available for expenses</Text>
        </View>
      </View>

      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={17} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search expense heads..."
            placeholderTextColor="#94A3B8"
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={17} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => loadHeads()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {loading && expenseHeads.length === 0 ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.stateText}>Loading expense heads...</Text>
        </View>
      ) : (
        <FlatList
          style={styles.headList}
          data={filteredHeads}
          keyExtractor={(item, index) => String(item._id || index)}
          renderItem={renderHead}
          contentContainerStyle={[
            styles.listContent,
            filteredHeads.length === 0 && styles.emptyContent,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadHeads({ refresh: true })}
              tintColor="#2563EB"
              colors={['#2563EB']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="pricetags-outline" size={28} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>No expense heads found</Text>
              <Text style={styles.emptyMessage}>
                Create your first expense head to start recording expenses.
              </Text>
              <TouchableOpacity style={styles.emptyAction} onPress={openCreate}>
                <Ionicons name="add" size={17} color="#FFFFFF" />
                <Text style={styles.emptyActionText}>Add expense head</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            style={styles.modalKeyboard}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={[styles.modalCard, { paddingBottom: 16 + insets.bottom }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingHead ? 'Edit Expense Head' : 'Create Expense Head'}
                </Text>
                <TouchableOpacity
                  onPress={closeModal}
                  accessibilityRole="button"
                  accessibilityLabel="Close dialog">
                  <Ionicons name="close" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.modalContent}>
                <View style={styles.field}>
                  <Text style={styles.label}>Name *</Text>
                  <TextInput
                    style={[styles.input, errors.name && styles.inputError]}
                    value={form.name}
                    onChangeText={value => updateForm('name', value)}
                    placeholder="Enter expense head name"
                    placeholderTextColor="#94A3B8"
                  />
                  {errors.name ? (
                    <Text style={styles.fieldError}>{errors.name}</Text>
                  ) : null}
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Category *</Text>
                  <View style={styles.choiceRow}>
                    {CATEGORIES.map(category => {
                      const active = form.category === category;
                      return (
                        <TouchableOpacity
                          key={category}
                          style={[styles.choice, active && styles.choiceActive]}
                          onPress={() => updateForm('category', category)}>
                          <Text
                            style={[
                              styles.choiceText,
                              active && styles.choiceTextActive,
                            ]}>
                            {category}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  {errors.category ? (
                    <Text style={styles.fieldError}>{errors.category}</Text>
                  ) : null}
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Country *</Text>
                  <View style={styles.choiceRow}>
                    {COUNTRIES.map(country => {
                      const active = form.country === country;
                      return (
                        <TouchableOpacity
                          key={country}
                          style={[styles.choice, active && styles.choiceActive]}
                          onPress={() => updateForm('country', country)}>
                          <Text
                            style={[
                              styles.choiceText,
                              active && styles.choiceTextActive,
                            ]}>
                            {country}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  {errors.country ? (
                    <Text style={styles.fieldError}>{errors.country}</Text>
                  ) : null}
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Status</Text>
                  <View style={styles.choiceRow}>
                    {[
                      { value: true, label: 'Active' },
                      { value: false, label: 'Inactive' },
                    ].map(option => {
                      const active = form.isActive === option.value;
                      return (
                        <TouchableOpacity
                          key={option.label}
                          style={[styles.choice, active && styles.choiceActive]}
                          onPress={() => updateForm('isActive', option.value)}>
                          <Text
                            style={[
                              styles.choiceText,
                              active && styles.choiceTextActive,
                            ]}>
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelModalButton}
                  onPress={closeModal}
                  disabled={saving}>
                  <Text style={styles.cancelModalText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveButton, saving && styles.disabledButton]}
                  onPress={save}
                  disabled={saving}>
                  {saving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={18}
                      color="#FFFFFF"
                    />
                  )}
                  <Text style={styles.saveButtonText}>
                    {saving ? 'Saving...' : editingHead ? 'Update' : 'Create'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
};

export default AdminExpenseHeadsScreen;

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
  headList: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 20 },
  emptyContent: { flexGrow: 1 },
  headCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 13,
    marginBottom: 10,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headMain: { flex: 1, minWidth: 0 },
  headTitle: { color: '#0F172A', fontSize: font.sm, fontWeight: '800' },
  headMeta: { color: '#64748B', fontSize: font.caption, marginTop: 3 },
  statusBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4 },
  activeBadge: { backgroundColor: '#DCFCE7' },
  inactiveBadge: { backgroundColor: '#FEE2E2' },
  statusText: { fontSize: font.tiny, fontWeight: '800' },
  activeText: { color: '#15803D' },
  inactiveText: { color: '#B91C1C' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 10 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 5 },
  metaItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { color: '#64748B', fontSize: font.caption, flexShrink: 1 },
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalKeyboard: { width: '100%', maxHeight: '92%' },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxHeight: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: { color: '#0F172A', fontSize: font.md, fontWeight: '800' },
  modalContent: { padding: 16 },
  field: { marginBottom: 16 },
  label: { color: '#334155', fontSize: font.xs, fontWeight: '700', marginBottom: 6 },
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
  inputError: { borderColor: '#DC2626' },
  fieldError: { color: '#DC2626', fontSize: font.caption, marginTop: 4 },
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
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  cancelModalButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 11,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelModalText: { color: '#64748B', fontSize: font.sm, fontWeight: '700' },
  saveButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 11,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  disabledButton: { opacity: 0.6 },
  saveButtonText: { color: '#FFFFFF', fontSize: font.sm, fontWeight: '800' },
});
