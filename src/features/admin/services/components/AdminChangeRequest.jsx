import { font } from '../../../../theme/typography';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import { fetchAdminChangeRequests } from '../api/adminChangeRequestsApi';

const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

const getStatusConfig = colors => ({
  pending: { label: 'Pending', color: colors.muted, backgroundColor: colors.sheet },
  'in-progress': { label: 'In Progress', color: colors.accent, backgroundColor: colors.accentSoft },
  approved: { label: 'Approved', color: colors.accent, backgroundColor: colors.accentSoft },
  rejected: { label: 'Rejected', color: colors.danger, backgroundColor: colors.sheet },
});

const getUrgencyConfig = colors => ({
  low: { label: 'Low', color: colors.accent, backgroundColor: colors.accentSoft },
  medium: { label: 'Medium', color: colors.muted, backgroundColor: colors.sheet },
  high: { label: 'High', color: colors.danger, backgroundColor: colors.sheet },
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

const AdminChangeRequest = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const token = useAppSelector(state => state.auth.token);
  const colors = useThemeColors();
  const isDark = useResolvedThemeMode() === 'dark';
  const statusConfig = getStatusConfig(colors);
  const urgencyConfig = getUrgencyConfig(colors);
  const getStatusStyle = status =>
    statusConfig[String(status || '').toLowerCase()] || statusConfig.pending;
  const getUrgencyStyle = urgency =>
    urgencyConfig[String(urgency || '').toLowerCase()] || urgencyConfig.low;
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
        setRequests(await fetchAdminChangeRequests({ token }));
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

  const stats = useMemo(
    () => ({
      total: requests.length,
      pending: requests.filter(item => item.status === 'pending').length,
      inProgress: requests.filter(item => item.status === 'in-progress').length,
      approved: requests.filter(item => item.status === 'approved').length,
      rejected: requests.filter(item => item.status === 'rejected').length,
    }),
    [requests],
  );

  const filteredRequests = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return requests.filter(item => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (!query) return true;
      const haystack = [
        item.type,
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

  const renderRequest = ({ item }) => {
    const badge = getStatusStyle(item.status);
    const urgency = getUrgencyStyle(item.urgency);
    const clientName =
      `${item.clientId?.firstName || ''} ${item.clientId?.lastName || ''}`.trim() ||
      'Unknown client';
    const fields = item.fields || [];

    return (
      <Pressable
        style={[styles.requestCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() =>
          navigation.navigate('AdminChangeRequestDetails', {
            requestId: item._id || item.id,
          })
        }
        accessibilityRole="button"
        accessibilityLabel={`Review change request ${item.type || ''}`}>
        <View style={styles.cardHeader}>
          <View style={[styles.typeIcon, { backgroundColor: colors.accentSoft }]}>
            <Ionicons name="document-text-outline" size={19} color={colors.accent} />
          </View>
          <View style={styles.cardHeaderCopy}>
            <Text style={[styles.requestType, { color: colors.text }]} numberOfLines={1}>
              {item.type || 'Change Request'}
            </Text>
            <Text style={[styles.submittedText, { color: colors.muted }]}>
              Submitted {formatDate(item.createdAt)}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: badge.backgroundColor }]}>
            <Text style={[styles.statusText, { color: badge.color }]}>
              {badge.label}
            </Text>
          </View>
        </View>

        <View style={[styles.cardDetails, { borderTopColor: colors.border }]}>
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

        <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
          <View style={[styles.urgencyBadge, { backgroundColor: urgency.backgroundColor }]}>
            <Text style={[styles.urgencyText, { color: urgency.color }]}>
              {urgency.label} urgency
            </Text>
          </View>
          {fields.length > 0 ? (
            <Text style={[styles.fieldsText, { color: colors.muted }]} numberOfLines={1}>
              {fields.length} field{fields.length > 1 ? 's' : ''}
            </Text>
          ) : null}
          <Ionicons name="chevron-forward" size={18} color={colors.subtle} />
        </View>
      </Pressable>
    );
  };

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.state}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.stateText, { color: colors.muted }]}>Loading change requests...</Text>
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
        <Ionicons name="document-text-outline" size={34} color={colors.subtle} />
        <Text style={[styles.emptyTitle, { color: colors.muted }]}>No change requests found</Text>
        <Text style={[styles.emptyText, { color: colors.subtle }]}>Try adjusting the filters or search query.</Text>
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
          { label: 'In Progress', value: stats.inProgress },
          { label: 'Approved', value: stats.approved },
          { label: 'Rejected', value: stats.rejected },
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
          placeholder="Search by company, client, or type..."
          placeholderTextColor={colors.inputPlaceholder}
          style={[styles.searchInput, { color: colors.text }]}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Search change requests"
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
              <Text style={[styles.filterText, { color: colors.muted }, active && { color: colors.accent }]}>
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
          <Text style={[styles.title, { color: colors.text }]}>Change Requests</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>Review client-submitted changes</Text>
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

export default AdminChangeRequest;

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
  requestType: { fontSize: font.sm, fontWeight: '700' },
  submittedText: { fontSize: font.xs, marginTop: s(2) },
  statusBadge: {
    paddingHorizontal: s(8),
    paddingVertical: s(4),
    borderRadius: s(7),
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
  urgencyBadge: {
    paddingHorizontal: s(8),
    paddingVertical: s(3),
    borderRadius: s(7),
  },
  urgencyText: { fontSize: font.tiny, fontWeight: '700' },
  fieldsText: { flex: 1, fontSize: font.tiny },
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
