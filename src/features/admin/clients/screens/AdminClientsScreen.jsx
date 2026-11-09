import { font } from '../../../../theme/typography';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
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
import {
  deleteAdminClient,
  fetchAdminClientStats,
  fetchAdminClients,
} from '../api/adminClientsApi';

const STATUSES = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'inactive', label: 'Inactive' },
];

const ITIN_FILTERS = [
  { key: 'all', label: 'All ITIN' },
  { key: 'has', label: 'Has ITIN' },
  { key: 'none', label: 'Not Applied' },
];

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

const getStatusStyle = status => {
  switch (String(status || '').toLowerCase()) {
    case 'active':
      return { color: '#15803D', backgroundColor: '#DCFCE7' };
    case 'inactive':
      return { color: '#475569', backgroundColor: '#F1F5F9' };
    case 'pending':
      return { color: '#B45309', backgroundColor: '#FEF3C7' };
    default:
      return { color: '#475569', backgroundColor: '#F1F5F9' };
  }
};

const AdminClientsScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const token = useAppSelector(state => state.auth.token);
  const [clients, setClients] = useState([]);
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState('');
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    page: 1,
  });
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('all');
  const [itinStatus, setItinStatus] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [deletingClientId, setDeletingClientId] = useState(null);

  const loadClients = useCallback(
    async (refresh = false) => {
      if (refresh) setRefreshing(true);
      else setLoading(true);
      setError('');
      try {
        const result = await fetchAdminClients({
          token,
          page,
          search: searchQuery,
          status,
          itinStatus,
        });
        setClients(result.clients);
        setPagination(result.pagination);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [itinStatus, page, searchQuery, status, token],
  );

  const loadStats = useCallback(async () => {
    try {
      setStats(await fetchAdminClientStats({ token }));
      setStatsError('');
    } catch (statsLoadError) {
      setStatsError(statsLoadError.message);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const load = async () => {
        await loadClients();
        if (active) await loadStats();
      };
      load();
      return () => {
        active = false;
      };
    }, [loadClients, loadStats]),
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      const nextSearch = searchText.trim();
      if (nextSearch !== searchQuery) {
        setPage(1);
        setSearchQuery(nextSearch);
      }
    }, 350);
    return () => clearTimeout(timeout);
  }, [searchQuery, searchText]);

  const confirmDeleteClient = client => {
    const clientId = client._id || client.id;
    if (!clientId) {
      Alert.alert('Unable to delete client', 'Client ID is missing.');
      return;
    }

    Alert.alert(
      'Delete client?',
      `Are you sure you want to delete ${client.name || client.email || 'this client'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingClientId(clientId);
            try {
              await deleteAdminClient({ token, id: clientId });
              await Promise.all([loadClients(true), loadStats()]);
              Alert.alert('Client deleted', 'The client was deleted successfully.');
            } catch (deleteError) {
              Alert.alert(
                'Unable to delete client',
                deleteError.message || 'Please try again.',
              );
            } finally {
              setDeletingClientId(null);
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.state}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.stateText}>Loading clients...</Text>
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
            onPress={() => loadClients()}
            accessibilityRole="button">
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      );
    }
    return (
      <View style={styles.state}>
        <Ionicons name="people-outline" size={34} color="#94A3B8" />
        <Text style={styles.emptyTitle}>No clients found</Text>
      </View>
    );
  };

  const renderClient = ({ item }) => {
    const badge = getStatusStyle(item.status);
    const name = item.name || item.email || 'Unnamed client';
    const itin = String(item.itin || '').trim();
    return (
      <Pressable
        style={styles.clientCard}
        onPress={() =>
          navigation.navigate('AdminClientDetails', {
            clientId: item._id || item.id,
          })
        }
        accessibilityRole="button"
        accessibilityLabel={`View client ${name}`}>
        <View style={styles.clientHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.clientInfo}>
            <Text style={styles.clientName} numberOfLines={1}>
              {name}
            </Text>
            <Text style={styles.clientRole} numberOfLines={1}>
              {item.role || 'Not specified'}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: badge.backgroundColor }]}>
            <Text style={[styles.statusText, { color: badge.color }]}>
              {String(item.status || 'active').toUpperCase()}
            </Text>
          </View>
          <Pressable
            style={styles.editIcon}
            onPress={event => {
              event.stopPropagation();
              navigation.navigate('AdminEditClient', {
                clientId: item._id || item.id,
              });
            }}
            accessibilityRole="button"
            accessibilityLabel={`Edit client ${name}`}>
            <Ionicons name="create-outline" size={17} color="#2563EB" />
          </Pressable>
          <Pressable
            style={styles.deleteIcon}
            onPress={event => {
              event.stopPropagation();
              confirmDeleteClient(item);
            }}
            disabled={deletingClientId === (item._id || item.id)}
            accessibilityRole="button"
            accessibilityLabel={`Delete client ${name}`}>
            {deletingClientId === (item._id || item.id) ? (
              <ActivityIndicator size="small" color="#DC2626" />
            ) : (
              <Ionicons name="trash-outline" size={17} color="#DC2626" />
            )}
          </Pressable>
        </View>
        <View style={styles.cardDetails}>
          <View style={styles.detailLine}>
            <Ionicons name="mail-outline" size={15} color="#64748B" />
            <Text style={styles.detailText} numberOfLines={1}>
              {item.email || 'No email'}
            </Text>
          </View>
          <View style={styles.detailLine}>
            <Ionicons name="call-outline" size={15} color="#64748B" />
            <Text style={styles.detailText} numberOfLines={1}>
              {[item.countryCode, item.phoneNumber].filter(Boolean).join(' ') ||
                'No phone number'}
            </Text>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.itinText}>
            ITIN: {itin || 'Not Applied'}
          </Text>
          <Text style={styles.dateText}>Joined {formatDate(item.createdAt)}</Text>
        </View>
      </Pressable>
    );
  };

  const listHeader = (
    <View>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Clients</Text>
          <Text style={styles.statValue}>
            {stats?.totalClients ?? pagination.total}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Active Clients</Text>
          <Text style={styles.statValue}>{stats?.activeClients ?? '—'}</Text>
        </View>
      </View>
      {statsError ? (
        <Text style={styles.inlineError}>Client stats unavailable: {statsError}</Text>
      ) : null}
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={19} color="#94A3B8" />
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search clients..."
          placeholderTextColor="#94A3B8"
          style={styles.searchInput}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Search clients"
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
        {STATUSES.map(filter => (
          <Pressable
            key={filter.key}
            onPress={() => {
              setStatus(filter.key);
              setPage(1);
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: status === filter.key }}
            style={[styles.filterChip, status === filter.key && styles.filterChipActive]}>
            <Text
              style={[
                styles.filterText,
                status === filter.key && styles.filterTextActive,
              ]}>
              {filter.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.filterRow, styles.itinFilterRow]}>
        {ITIN_FILTERS.map(filter => (
          <Pressable
            key={filter.key}
            onPress={() => {
              setItinStatus(filter.key);
              setPage(1);
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: itinStatus === filter.key }}
            style={[
              styles.filterChip,
              itinStatus === filter.key && styles.filterChipActive,
            ]}>
            <Text
              style={[
                styles.filterText,
                itinStatus === filter.key && styles.filterTextActive,
              ]}>
              {filter.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      {error && clients.length > 0 ? (
        <Text style={styles.inlineError}>{error}</Text>
      ) : null}
      <Text style={styles.resultsText}>Showing {clients.length} of {pagination.total}</Text>
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
          <Text style={styles.title}>Clients</Text>
          <Text style={styles.subtitle}>Manage client accounts</Text>
        </View>
        <Pressable
          onPress={() => navigation.navigate('AdminCreateClient')}
          accessibilityRole="button"
          accessibilityLabel="Add client"
          style={styles.addButton}>
          <Ionicons name="add" size={25} color="#FFFFFF" />
        </Pressable>
      </View>
      <FlatList
        data={clients}
        keyExtractor={(item, index) => String(item._id || item.id || index)}
        renderItem={renderClient}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={
          pagination.pages > 1 ? (
            <View style={styles.pagination}>
              <Pressable
                style={[styles.pageButton, page <= 1 && styles.pageButtonDisabled]}
                onPress={() => setPage(current => current - 1)}
                disabled={page <= 1 || loading}
                accessibilityRole="button"
                accessibilityLabel="Previous page">
                <Ionicons name="chevron-back" size={18} color="#334155" />
              </Pressable>
              <Text style={styles.pageText}>
                Page {pagination.page || page} of {pagination.pages}
              </Text>
              <Pressable
                style={[
                  styles.pageButton,
                  page >= pagination.pages && styles.pageButtonDisabled,
                ]}
                onPress={() => setPage(current => current + 1)}
                disabled={page >= pagination.pages || loading}
                accessibilityRole="button"
                accessibilityLabel="Next page">
                <Ionicons name="chevron-forward" size={18} color="#334155" />
              </Pressable>
            </View>
          ) : null
        }
        contentContainerStyle={[
          styles.listContent,
          clients.length === 0 && styles.emptyListContent,
          { paddingBottom: s(24) + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadClients(true)}
            tintColor="#2563EB"
            colors={['#2563EB']}
          />
        }
      />
    </View>
  );
};

export default AdminClientsScreen;

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
  addButton: {
    width: s(40),
    height: s(40),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: s(12),
    backgroundColor: '#2563EB',
  },
  title: { color: '#0F172A', fontSize: font.xl, fontWeight: '800' },
  subtitle: { color: '#64748B', fontSize: font.xs, marginTop: s(2) },
  listContent: { paddingHorizontal: s(16), paddingTop: s(12) },
  emptyListContent: { flexGrow: 1 },
  statsRow: { flexDirection: 'row', gap: s(10), marginBottom: s(12) },
  statCard: {
    flex: 1,
    padding: s(12),
    borderRadius: s(12),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  statLabel: { color: '#64748B', fontSize: font.xs },
  statValue: { color: '#0F172A', fontSize: font.xl, fontWeight: '800', marginTop: s(4) },
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
  itinFilterRow: { paddingTop: 0 },
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
  inlineError: { color: '#B91C1C', fontSize: font.xs, paddingVertical: s(6) },
  clientCard: {
    padding: s(13),
    marginBottom: s(10),
    borderRadius: s(13),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  clientHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: s(42),
    height: s(42),
    borderRadius: s(12),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    marginRight: s(10),
  },
  avatarText: { color: '#4F46E5', fontSize: font.lg, fontWeight: '800' },
  clientInfo: { flex: 1, marginRight: s(8) },
  clientName: { color: '#0F172A', fontSize: font.sm, fontWeight: '700' },
  clientRole: { color: '#64748B', fontSize: font.xs, marginTop: s(2) },
  statusBadge: { paddingHorizontal: s(8), paddingVertical: s(4), borderRadius: s(7) },
  statusText: { fontSize: font.tiny, fontWeight: '700' },
  editIcon: {
    width: s(30),
    height: s(30),
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: s(6),
    borderRadius: s(8),
    backgroundColor: '#EFF6FF',
  },
  deleteIcon: {
    width: s(30),
    height: s(30),
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: s(6),
    borderRadius: s(8),
    backgroundColor: '#FEF2F2',
  },
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
    justifyContent: 'space-between',
    gap: s(8),
    paddingTop: s(8),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
  },
  itinText: { flex: 1, color: '#475569', fontSize: font.tiny },
  dateText: { color: '#64748B', fontSize: font.tiny },
  state: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: s(24) },
  stateText: { color: '#64748B', fontSize: font.sm, marginTop: s(10) },
  errorText: { color: '#B91C1C', fontSize: font.sm, textAlign: 'center', marginTop: s(10) },
  emptyTitle: { color: '#64748B', fontSize: font.sm, marginTop: s(10) },
  retryButton: {
    marginTop: s(12),
    paddingHorizontal: s(16),
    paddingVertical: s(8),
    borderRadius: s(8),
    backgroundColor: '#2563EB',
  },
  retryText: { color: '#FFFFFF', fontSize: font.sm, fontWeight: '600' },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(16),
    paddingVertical: s(14),
  },
  pageButton: {
    width: s(36),
    height: s(36),
    borderRadius: s(10),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pageButtonDisabled: { opacity: 0.45 },
  pageText: { color: '#475569', fontSize: font.xs, fontWeight: '600' },
});
