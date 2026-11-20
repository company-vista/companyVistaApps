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
import { useThemeColors, useResolvedThemeMode } from '../../../../theme/colors';
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

const getStatusConfig = colors => ({
  pending: { label: 'Pending', color: colors.muted, backgroundColor: colors.sheet },
  quoted: { label: 'Quoted', color: colors.accent, backgroundColor: colors.accentSoft },
  paid: { label: 'Paid', color: colors.accent, backgroundColor: colors.accentSoft },
  'in-progress': { label: 'In Progress', color: colors.accent, backgroundColor: colors.accentSoft },
  completed: { label: 'Completed', color: colors.accent, backgroundColor: colors.accentSoft },
  rejected: { label: 'Rejected', color: colors.danger, backgroundColor: colors.sheet },
});

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
  const colors = useThemeColors();
  const statusConfig = getStatusConfig(colors);
  const getStatusStyle = status =>
    statusConfig[String(status || '').toLowerCase()] || statusConfig.pending;
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
    <View
      style={[styles.requestCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Pressable
        onPress={() => setExpanded(value => !value)}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`Service request ${item.serviceName || ''}`}>
        <View style={styles.cardHeader}>
          <View style={[styles.typeIcon, { backgroundColor: colors.accentSoft }]}>
            <Ionicons name="construct-outline" size={19} color={colors.accent} />
          </View>
          <View style={styles.cardHeaderCopy}>
            <Text style={[styles.serviceName, { color: colors.text }]} numberOfLines={1}>
              {item.serviceName || 'Service request'}
            </Text>
            <Text style={[styles.categoryText, { color: colors.muted }]} numberOfLines={1}>
              {item.category || 'Uncategorized'}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: badge.backgroundColor }]}>
            <Text style={[styles.statusText, { color: badge.color }]}>{badge.label}</Text>
          </View>
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.subtle} />
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.detailLine}>
            <Ionicons name="business-outline" size={15} color={colors.muted} />
            <Text style={[styles.detailText, { color: colors.muted }]} numberOfLines={1}>
              {item.companyId?.companyName || 'Unknown company'}
            </Text>
          </View>
          <View style={styles.detailLine}>
            <Ionicons name="person-outline" size={15} color={colors.muted} />
            <Text style={[styles.detailText, { color: colors.muted }]} numberOfLines={1}>
              {clientName}
            </Text>
          </View>
          <View style={styles.detailLine}>
            <Ionicons name="mail-outline" size={15} color={colors.muted} />
            <Text style={[styles.detailText, { color: colors.muted }]} numberOfLines={1}>
              {item.clientId?.email || 'No email'}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={[styles.modeBadge, { backgroundColor: colors.sheet }]}>
            <Text style={[styles.modeText, { color: colors.muted }]}>
              {item.mode === 'direct_payment' ? 'Direct Pay' : 'Quote'}
            </Text>
          </View>
          <Text style={[styles.priceText, { color: colors.text }]}>{formatPrice(item.suggestedPrice)}</Text>
          <Text style={[styles.dateText, { color: colors.muted }]}>{formatDate(item.createdAt)}</Text>
        </View>
      </Pressable>

      {expanded ? (
        <View style={[styles.expandedPanel, { borderTopColor: colors.border }]}>
          {item.note ? (
            <View style={styles.block}>
              <Text style={[styles.fieldLabel, { color: colors.subtle }]}>Client Note</Text>
              <View
                style={[
                  styles.noteBox,
                  { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder },
                ]}>
                <Text style={[styles.noteText, { color: colors.text }]}>{item.note}</Text>
              </View>
            </View>
          ) : null}

          <View style={styles.block}>
            <Text style={[styles.fieldLabel, { color: colors.subtle }]}>Admin Note</Text>
            <TextInput
              value={adminNote}
              onChangeText={setAdminNote}
              placeholder="Add a note for the client..."
              placeholderTextColor={colors.inputPlaceholder}
              multiline
              textAlignVertical="top"
              style={[
                styles.noteInput,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                },
              ]}
            />
          </View>

          <View style={styles.block}>
            <Text style={[styles.fieldLabel, { color: colors.subtle }]}>Status</Text>
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
                      { backgroundColor: colors.surface, borderColor: colors.border },
                      active && {
                        borderColor: config.color,
                        backgroundColor: config.backgroundColor,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.statusOptionText,
                        { color: colors.muted },
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
            style={[
              styles.saveButton,
              { backgroundColor: colors.accent },
              saving && styles.buttonDisabled,
            ]}
            accessibilityRole="button">
            {saving ? (
              <ActivityIndicator size="small" color={colors.buttonText} />
            ) : (
              <Ionicons name="save-outline" size={17} color={colors.buttonText} />
            )}
            <Text style={[styles.saveButtonText, { color: colors.buttonText }]}>
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
  const colors = useThemeColors();
  const isDark = useResolvedThemeMode() === 'dark';
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
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.stateText, { color: colors.muted }]}>Loading service requests...</Text>
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.state}>
          <Ionicons name="alert-circle-outline" size={32} color={colors.danger} />
          <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
          <Pressable
            style={[styles.retryButton, { backgroundColor: colors.accent }]}
            onPress={() => loadRequests()}
            accessibilityRole="button">
            <Text style={[styles.retryText, { color: colors.buttonText }]}>Try again</Text>
          </Pressable>
        </View>
      );
    }
    return (
      <View style={styles.state}>
        <Ionicons name="construct-outline" size={34} color={colors.subtle} />
        <Text style={[styles.emptyTitle, { color: colors.muted }]}>No service requests found</Text>
        <Text style={[styles.emptyText, { color: colors.subtle }]}>
          Try adjusting the filters or search query.
        </Text>
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
          <View
            key={stat.label}
            style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>{loading ? '—' : stat.value}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>{stat.label}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="search-outline" size={19} color={colors.subtle} />
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search by company, client, or service..."
          placeholderTextColor={colors.inputPlaceholder}
          style={[styles.searchInput, { color: colors.text }]}
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
            <Ionicons name="close-circle" size={19} color={colors.subtle} />
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
              style={[
                styles.filterChip,
                { backgroundColor: colors.surface, borderColor: colors.border },
                active && { backgroundColor: colors.accentSoft, borderColor: colors.accent },
              ]}>
              <Text
                style={[
                  styles.filterText,
                  { color: colors.muted },
                  active && { color: colors.accent },
                ]}>
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {error && requests.length > 0 ? (
        <Text style={[styles.inlineError, { color: colors.danger }]}>{error}</Text>
      ) : null}
      <Text style={[styles.resultsText, { color: colors.muted }]}>
        Showing {filteredRequests.length} of {requests.length} requests
      </Text>
    </View>
  );

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
            paddingTop: Math.max(insets.top, s(12)),
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={[styles.backButton, { backgroundColor: colors.sheet }]}>
          <Ionicons name="arrow-back" size={21} color={colors.text} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={[styles.title, { color: colors.text }]}>Service Requests</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Quotes and direct service purchases
          </Text>
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
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      />
    </View>
  );
};

export default AdminServicesRequest;

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(16),
    paddingBottom: s(12),
    borderBottomWidth: 1,
  },
  backButton: {
    width: s(38),
    height: s(38),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: s(10),
    marginRight: s(10),
  },
  headerCopy: { flex: 1 },
  title: { fontSize: font.xl, fontWeight: '800' },
  subtitle: { fontSize: font.xs, marginTop: s(2) },
  listContent: { paddingHorizontal: s(16), paddingTop: s(12) },
  emptyListContent: { flexGrow: 1 },
  statsRow: { flexDirection: 'row', gap: s(10), paddingBottom: s(12) },
  statCard: {
    minWidth: s(86),
    paddingHorizontal: s(14),
    paddingVertical: s(11),
    borderRadius: s(12),
    borderWidth: 1,
  },
  statValue: { fontSize: font.xl, fontWeight: '800' },
  statLabel: { fontSize: font.xs, marginTop: s(3) },
  searchBox: {
    minHeight: s(44),
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    paddingHorizontal: s(12),
    borderWidth: 1,
    borderRadius: s(10),
  },
  searchInput: { flex: 1, fontSize: font.sm, paddingVertical: s(8) },
  filterRow: { flexDirection: 'row', gap: s(8), paddingVertical: s(10) },
  filterChip: {
    minHeight: s(34),
    paddingHorizontal: s(12),
    justifyContent: 'center',
    borderRadius: s(18),
    borderWidth: 1,
  },
  filterText: { fontSize: font.xs, fontWeight: '600' },
  resultsText: { fontSize: font.xs, marginBottom: s(8) },
  inlineError: { fontSize: font.xs, paddingBottom: s(6) },
  requestCard: {
    padding: s(13),
    marginBottom: s(10),
    borderRadius: s(13),
    borderWidth: 1,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  typeIcon: {
    width: s(42),
    height: s(42),
    borderRadius: s(12),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: s(10),
  },
  cardHeaderCopy: { flex: 1, marginRight: s(8) },
  serviceName: { fontSize: font.sm, fontWeight: '700' },
  categoryText: { fontSize: font.xs, marginTop: s(2) },
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
  },
  detailLine: { flexDirection: 'row', alignItems: 'center', gap: s(7) },
  detailText: { flex: 1, fontSize: font.xs },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    paddingTop: s(8),
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  modeBadge: {
    paddingHorizontal: s(8),
    paddingVertical: s(3),
    borderRadius: s(7),
  },
  modeText: { fontSize: font.tiny, fontWeight: '700' },
  priceText: { flex: 1, fontSize: font.sm, fontWeight: '700' },
  dateText: { fontSize: font.tiny },
  expandedPanel: {
    marginTop: s(11),
    paddingTop: s(11),
    borderTopWidth: 1,
  },
  block: { marginBottom: s(12) },
  fieldLabel: {
    fontSize: font.tiny,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: s(6),
  },
  noteBox: {
    padding: s(11),
    borderRadius: s(10),
    borderWidth: 1,
  },
  noteText: { fontSize: font.sm, lineHeight: s(20) },
  noteInput: {
    minHeight: s(78),
    padding: s(11),
    borderRadius: s(10),
    borderWidth: 1,
    fontSize: font.sm,
  },
  statusOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: s(7) },
  statusOption: {
    paddingHorizontal: s(11),
    paddingVertical: s(7),
    borderRadius: s(16),
    borderWidth: 1,
  },
  statusOptionText: { fontSize: font.xs, fontWeight: '600' },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(7),
    paddingVertical: s(11),
    borderRadius: s(10),
  },
  saveButtonText: { fontSize: font.sm, fontWeight: '700' },
  buttonDisabled: { opacity: 0.55 },
  state: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: s(24) },
  stateText: { fontSize: font.sm, marginTop: s(10) },
  errorText: { fontSize: font.sm, textAlign: 'center', marginTop: s(10) },
  emptyTitle: { fontSize: font.sm, fontWeight: '600', marginTop: s(10) },
  emptyText: { fontSize: font.xs, marginTop: s(4) },
  retryButton: {
    marginTop: s(12),
    paddingHorizontal: s(16),
    paddingVertical: s(8),
    borderRadius: s(8),
  },
  retryText: { fontSize: font.sm, fontWeight: '600' },
});
