import { font } from '../../../../theme/typography';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../../../../store/hooks';
import { s } from '../../../../theme/responsive';
import {
  fetchAdminServiceRequests,
  updateAdminServiceRequest,
} from '../api/adminServiceRequestsApi';

const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'quoted', label: 'Quoted' },
  { key: 'paid', label: 'Paid' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
  { key: 'rejected', label: 'Rejected' },
];

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'quoted', label: 'Quoted' },
  { value: 'paid', label: 'Paid' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Rejected' },
];

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#B45309', backgroundColor: '#FEF3C7' },
  quoted: { label: 'Quoted', color: '#1D4ED8', backgroundColor: '#DBEAFE' },
  paid: { label: 'Paid', color: '#15803D', backgroundColor: '#DCFCE7' },
  'in-progress': { label: 'In Progress', color: '#4338CA', backgroundColor: '#E0E7FF' },
  completed: { label: 'Completed', color: '#047857', backgroundColor: '#D1FAE5' },
  rejected: { label: 'Rejected', color: '#B91C1C', backgroundColor: '#FEE2E2' },
};

const getStatusStyle = status =>
  STATUS_CONFIG[String(status || '').toLowerCase()] || STATUS_CONFIG.pending;

const formatDate = value => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const formatPrice = value => {
  const price = Number(value);
  if (!Number.isFinite(price)) return '—';
  return `$${price.toLocaleString('en-US')}`;
};

const ServiceRequestCard = ({ item, onUpdated }) => {
  const token = useAppSelector(state => state.auth.token);
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState(item.status || 'pending');
  const [adminNote, setAdminNote] = useState(item.adminNote || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setStatus(item.status || 'pending');
    setAdminNote(item.adminNote || '');
  }, [item._id, item.status, item.adminNote]);

  const badge = getStatusStyle(item.status);
  const clientName =
    `${item.clientId?.firstName || ''} ${item.clientId?.lastName || ''}`.trim() ||
    'No client linked';

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await updateAdminServiceRequest({
        token,
        id: item._id || item.id,
        status,
        adminNote,
      });
      onUpdated({ ...item, ...updated });
      Alert.alert('Saved', 'Service request updated successfully.');
    } catch (saveError) {
      Alert.alert('Unable to save changes', saveError.message || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.requestCard}>
      <Pressable
        onPress={() => setExpanded(value => !value)}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`Service request ${item.serviceName || ''}`}>
        <View style={styles.cardHeader}>
          <View style={styles.typeIcon}>
            <Ionicons name="construct-outline" size={19} color="#4F46E5" />
          </View>
          <View style={styles.cardHeaderCopy}>
            <Text style={styles.serviceName} numberOfLines={1}>
              {item.serviceName || 'Service request'}
            </Text>
            <Text style={styles.categoryText} numberOfLines={1}>
              {item.category || 'Uncategorized'}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: badge.backgroundColor }]}>
            <Text style={[styles.statusText, { color: badge.color }]}>{badge.label}</Text>
          </View>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color="#94A3B8"
          />
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.detailLine}>
            <Ionicons name="business-outline" size={15} color="#64748B" />
            <Text style={styles.detailText} numberOfLines={1}>
              {item.companyId?.companyName || 'Unknown company'}
            </Text>
          </View>
          <View style={styles.detailLine}>
            <Ionicons name="person-outline" size={15} color="#64748B" />
            <Text style={styles.detailText} numberOfLines={1}>
              {clientName}
            </Text>
          </View>
          <View style={styles.detailLine}>
            <Ionicons name="mail-outline" size={15} color="#64748B" />
            <Text style={styles.detailText} numberOfLines={1}>
              {item.clientId?.email || 'No email'}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.modeBadge}>
            <Text style={styles.modeText}>
              {item.mode === 'direct_payment' ? 'Direct Pay' : 'Quote'}
            </Text>
          </View>
          <Text style={styles.priceText}>{formatPrice(item.suggestedPrice)}</Text>
          <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
        </View>
      </Pressable>

      {expanded ? (
        <View style={styles.expandedPanel}>
          {item.note ? (
            <View style={styles.block}>
              <Text style={styles.fieldLabel}>Client Note</Text>
              <View style={styles.noteBox}>
                <Text style={styles.noteText}>{item.note}</Text>
              </View>
            </View>
          ) : null}

          <View style={styles.block}>
            <Text style={styles.fieldLabel}>Admin Note</Text>
            <TextInput
              value={adminNote}
              onChangeText={setAdminNote}
              placeholder="Add a note for the client..."
              placeholderTextColor="#94A3B8"
              multiline
              textAlignVertical="top"
              style={styles.noteInput}
            />
          </View>

          <View style={styles.block}>
            <Text style={styles.fieldLabel}>Status</Text>
            <View style={styles.statusOptions}>
              {STATUS_OPTIONS.map(option => {
                const active = status === option.value;
                const config = getStatusStyle(option.value);
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => setStatus(option.value)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    style={[
                      styles.statusOption,
                      active && {
                        borderColor: config.color,
                        backgroundColor: config.backgroundColor,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.statusOptionText,
                        active && { color: config.color },
                      ]}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={[styles.saveButton, saving && styles.buttonDisabled]}
            accessibilityRole="button">
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="save-outline" size={17} color="#FFFFFF" />
            )}
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
};

const AdminServicesRequest = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const token = useAppSelector(state => state.auth.token);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchText, setSearchText] = useState('');

  const loadRequests = useCallback(
    async (refresh = false) => {
      if (refresh) setRefreshing(true);
      else setLoading(true);
      setError('');
      try {
        setRequests(await fetchAdminServiceRequests({ token }));
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
      loadRequests();
    }, [loadRequests]),
  );

  const handleUpdated = useCallback(updated => {
    setRequests(current =>
      current.map(item =>
        (item._id || item.id) === (updated._id || updated.id)
          ? { ...item, ...updated }
          : item,
      ),
    );
  }, []);

  const stats = useMemo(
    () => ({
      total: requests.length,
      pending: requests.filter(item => item.status === 'pending').length,
      quoted: requests.filter(item => item.status === 'quoted').length,
      paid: requests.filter(item => item.status === 'paid').length,
      completed: requests.filter(item => item.status === 'completed').length,
    }),
    [requests],
  );

  const filteredRequests = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return requests.filter(item => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (!query) return true;
      const haystack = [
        item.serviceName,
        item.category,
        item.companyId?.companyName,
        item.clientId?.firstName,
        item.clientId?.lastName,
        item.clientId?.email,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [requests, searchText, statusFilter]);

  const renderRequest = ({ item }) => (
    <ServiceRequestCard item={item} onUpdated={handleUpdated} />
  );

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.state}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.stateText}>Loading service requests...</Text>
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.state}>
          <Ionicons name="alert-circle-outline" size={32} color="#DC2626" />
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            style={styles.retryButton}
            onPress={() => loadRequests()}
            accessibilityRole="button">
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      );
    }
    return (
      <View style={styles.state}>
        <Ionicons name="construct-outline" size={34} color="#94A3B8" />
        <Text style={styles.emptyTitle}>No service requests found</Text>
        <Text style={styles.emptyText}>Try adjusting the filters or search query.</Text>
      </View>
    );
  };

  const listHeader = (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statsRow}>
        {[
          { label: 'Total', value: stats.total },
          { label: 'Pending', value: stats.pending },
          { label: 'Quoted', value: stats.quoted },
          { label: 'Paid', value: stats.paid },
          { label: 'Completed', value: stats.completed },
        ].map(stat => (
          <View key={stat.label} style={styles.statCard}>
            <Text style={styles.statValue}>{loading ? '—' : stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={19} color="#94A3B8" />
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search by company, client, or service..."
          placeholderTextColor="#94A3B8"
          style={styles.searchInput}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Search service requests"
        />
        {searchText ? (
          <Pressable
            onPress={() => setSearchText('')}
            accessibilityRole="button"
            accessibilityLabel="Clear search">
            <Ionicons name="close-circle" size={19} color="#94A3B8" />
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}>
        {STATUS_FILTERS.map(filter => {
          const active = statusFilter === filter.key;
          return (
            <Pressable
              key={filter.key}
              onPress={() => setStatusFilter(filter.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={[styles.filterChip, active && styles.filterChipActive]}>
              <Text style={[styles.filterText, active && styles.filterTextActive]}>
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {error && requests.length > 0 ? (
        <Text style={styles.inlineError}>{error}</Text>
      ) : null}
      <Text style={styles.resultsText}>
        Showing {filteredRequests.length} of {requests.length} requests
      </Text>
    </View>
  );

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <View style={[styles.header, { paddingTop: Math.max(insets.top, s(12)) }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.backButton}>
          <Ionicons name="arrow-back" size={21} color="#1E293B" />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Service Requests</Text>
          <Text style={styles.subtitle}>Quotes and direct service purchases</Text>
        </View>
      </View>
      <FlatList
        data={filteredRequests}
        keyExtractor={(item, index) => String(item._id || item.id || index)}
        renderItem={renderRequest}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={[
          styles.listContent,
          filteredRequests.length === 0 && styles.emptyListContent,
          { paddingBottom: s(24) + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadRequests(true)}
            tintColor="#2563EB"
            colors={['#2563EB']}
          />
        }
      />
    </View>
  );
};

export default AdminServicesRequest;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(16),
    paddingBottom: s(12),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: s(38),
    height: s(38),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: s(10),
    backgroundColor: '#F1F5F9',
    marginRight: s(10),
  },
  headerCopy: { flex: 1 },
  title: { color: '#0F172A', fontSize: font.xl, fontWeight: '800' },
  subtitle: { color: '#64748B', fontSize: font.xs, marginTop: s(2) },
  listContent: { paddingHorizontal: s(16), paddingTop: s(12) },
  emptyListContent: { flexGrow: 1 },
  statsRow: { flexDirection: 'row', gap: s(10), paddingBottom: s(12) },
  statCard: {
    minWidth: s(86),
    paddingHorizontal: s(14),
    paddingVertical: s(11),
    borderRadius: s(12),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  statValue: { color: '#0F172A', fontSize: font.xl, fontWeight: '800' },
  statLabel: { color: '#64748B', fontSize: font.xs, marginTop: s(3) },
  searchBox: {
    minHeight: s(44),
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    paddingHorizontal: s(12),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: s(10),
  },
  searchInput: { flex: 1, color: '#0F172A', fontSize: font.sm, paddingVertical: s(8) },
  filterRow: { flexDirection: 'row', gap: s(8), paddingVertical: s(10) },
  filterChip: {
    minHeight: s(34),
    paddingHorizontal: s(12),
    justifyContent: 'center',
    borderRadius: s(18),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  filterChipActive: { backgroundColor: '#EFF6FF', borderColor: '#93C5FD' },
  filterText: { color: '#64748B', fontSize: font.xs, fontWeight: '600' },
  filterTextActive: { color: '#1D4ED8' },
  resultsText: { color: '#64748B', fontSize: font.xs, marginBottom: s(8) },
  inlineError: { color: '#B91C1C', fontSize: font.xs, paddingBottom: s(6) },
  requestCard: {
    padding: s(13),
    marginBottom: s(10),
    borderRadius: s(13),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  typeIcon: {
    width: s(42),
    height: s(42),
    borderRadius: s(12),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    marginRight: s(10),
  },
  cardHeaderCopy: { flex: 1, marginRight: s(8) },
  serviceName: { color: '#0F172A', fontSize: font.sm, fontWeight: '700' },
  categoryText: { color: '#64748B', fontSize: font.xs, marginTop: s(2) },
  statusBadge: {
    paddingHorizontal: s(8),
    paddingVertical: s(4),
    borderRadius: s(7),
    marginRight: s(6),
  },
  statusText: { fontSize: font.tiny, fontWeight: '700' },
  cardDetails: {
    gap: s(7),
    paddingVertical: s(10),
    marginTop: s(10),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
  },
  detailLine: { flexDirection: 'row', alignItems: 'center', gap: s(7) },
  detailText: { flex: 1, color: '#475569', fontSize: font.xs },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    paddingTop: s(8),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
  },
  modeBadge: {
    paddingHorizontal: s(8),
    paddingVertical: s(3),
    borderRadius: s(7),
    backgroundColor: '#F1F5F9',
  },
  modeText: { color: '#475569', fontSize: font.tiny, fontWeight: '700' },
  priceText: { flex: 1, color: '#0F172A', fontSize: font.sm, fontWeight: '700' },
  dateText: { color: '#64748B', fontSize: font.tiny },
  expandedPanel: {
    marginTop: s(11),
    paddingTop: s(11),
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  block: { marginBottom: s(12) },
  fieldLabel: {
    color: '#94A3B8',
    fontSize: font.tiny,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: s(6),
  },
  noteBox: {
    padding: s(11),
    borderRadius: s(10),
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  noteText: { color: '#334155', fontSize: font.sm, lineHeight: s(20) },
  noteInput: {
    minHeight: s(78),
    padding: s(11),
    borderRadius: s(10),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    color: '#1E293B',
    fontSize: font.sm,
  },
  statusOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: s(7) },
  statusOption: {
    paddingHorizontal: s(11),
    paddingVertical: s(7),
    borderRadius: s(16),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  statusOptionText: { color: '#64748B', fontSize: font.xs, fontWeight: '600' },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(7),
    paddingVertical: s(11),
    borderRadius: s(10),
    backgroundColor: '#4F46E5',
  },
  saveButtonText: { color: '#FFFFFF', fontSize: font.sm, fontWeight: '700' },
  buttonDisabled: { opacity: 0.55 },
  state: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: s(24) },
  stateText: { color: '#64748B', fontSize: font.sm, marginTop: s(10) },
  errorText: { color: '#B91C1C', fontSize: font.sm, textAlign: 'center', marginTop: s(10) },
  emptyTitle: { color: '#64748B', fontSize: font.sm, fontWeight: '600', marginTop: s(10) },
  emptyText: { color: '#94A3B8', fontSize: font.xs, marginTop: s(4) },
  retryButton: {
    marginTop: s(12),
    paddingHorizontal: s(16),
    paddingVertical: s(8),
    borderRadius: s(8),
    backgroundColor: '#2563EB',
  },
  retryText: { color: '#FFFFFF', fontSize: font.sm, fontWeight: '600' },
});
