import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../../../../store/hooks';
import {
  deleteCompany,
  fetchCompanies,
  getCachedCompanies,
  invalidateCompaniesCache,
} from '../api/companyApi';

const CATEGORY_BY_TAB = {
  All: 'formed',
  Prospects: 'prospect',
  External: 'external',
};

const STATUS_STYLES = {
  active: { statusColor: '#059669', bgColor: '#ECFDF5' },
  pending: { statusColor: '#D97706', bgColor: '#FEF3C7' },
  inactive: { statusColor: '#475569', bgColor: '#F1F5F9' },
  'in review': { statusColor: '#2563EB', bgColor: '#EFF6FF' },
  rejected: { statusColor: '#DC2626', bgColor: '#FEF2F2' },
  completed: { statusColor: '#7C3AED', bgColor: '#F5F3FF' },
};

const getStatusStyle = status => {
  const key = String(status || '').toLowerCase().replace(/_/g, ' ');
  return STATUS_STYLES[key] || { statusColor: '#64748B', bgColor: '#F1F5F9' };
};

const CompanyManagementScreen = () => {
  const navigation = useNavigation();
  const token = useAppSelector(state => state.auth.token);
  const [activeTab, setActiveTab] = useState('All');
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState(
    () => getCachedCompanies({ category: 'formed' }) || [],
  );
  const [loading, setLoading] = useState(
    () => (getCachedCompanies({ category: 'formed' }) || []).length === 0,
  );
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadCompanies = useCallback(
    async ({ isRefresh = false } = {}) => {
      if (!token) {
        setError('Auth token missing. Please login again.');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const category = CATEGORY_BY_TAB[activeTab];
      const cached = getCachedCompanies({ category, search: searchTerm });

      if (cached) {
        setCompanies(cached);
        setLoading(false);
      } else if (!isRefresh) {
        setLoading(true);
        setCompanies([]);
      }

      try {
        const list = await fetchCompanies({
          token,
          category,
          search: searchTerm,
        });
        setCompanies(list);
        setError('');
      } catch (err) {
        if (!cached) {
          setCompanies([]);
          setError(err?.message || 'Failed to load companies. Please try again.');
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, activeTab, searchTerm],
  );

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  const loadCompaniesRef = useRef(loadCompanies);
  useEffect(() => {
    loadCompaniesRef.current = loadCompanies;
  }, [loadCompanies]);

  const hasFocused = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (!hasFocused.current) {
        hasFocused.current = true;
        return;
      }
      loadCompaniesRef.current({ isRefresh: true });
    }, []),
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchTerm(searchInput.trim());
    }, 350);
    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const mappedCompanies = useMemo(
    () =>
      companies.map(company => {
        const name =
          company.companyName || company.alternateCompanyName || 'Unnamed Company';
        const status = company.registrationStatus || 'pending';
        const { statusColor, bgColor } = getStatusStyle(status);
        const country = company.countryOfIncorporation || 'N/A';
        const state = company.stateOfRegistration;
        const shareholderCount = company.shareholders?.length || 0;
        return {
          id: company._id || company.id,
          name,
          type: company.companyType || 'N/A',
          country: state ? `${country} (${state})` : country,
          shareholders: `${shareholderCount} shareholder${shareholderCount === 1 ? '' : 's'}`,
          status: String(status).replace(/_/g, ' ').toUpperCase(),
          statusColor,
          bgColor,
          raw: company,
        };
      }),
    [companies],
  );

  const stats = useMemo(() => {
    const countByStatus = status =>
      companies.filter(
        company =>
          String(company.registrationStatus || '').toLowerCase() === status,
      ).length;
    return {
      total: companies.length,
      active: countByStatus('active'),
      pending: countByStatus('pending'),
      inactive: countByStatus('inactive'),
    };
  }, [companies]);

  const handleDelete = item => {
    Alert.alert(
      'Delete company',
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCompany({ token, companyId: item.id });
              invalidateCompaniesCache();
              loadCompanies({ isRefresh: true });
            } catch (err) {
              Alert.alert('Delete failed', err?.message || 'Please try again.');
            }
          },
        },
      ],
    );
  };

  const renderCompany = ({ item }) => (
    <View style={styles.companyCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardLeft}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarText}>{(item.name || '?')[0]}</Text>
          </View>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.companyType}>{item.type}</Text>
          </View>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: item.bgColor }]}>
          <Text style={[styles.statusText, { color: item.statusColor }]} numberOfLines={1}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.cardDetailsSection}>
        <View style={styles.footerDetail}>
          <Ionicons name="globe-outline" size={14} color="#64748B" />
          <Text style={styles.footerText} numberOfLines={1}>{item.country}</Text>
        </View>
        <View style={styles.footerDetail}>
          <Ionicons name="people-outline" size={14} color="#64748B" />
          <Text style={styles.footerText}>{item.shareholders}</Text>
        </View>
      </View>

      {/* Action Buttons Row (View, Edit, Delete) */}
      <View style={styles.cardActionsFooter}>
        <TouchableOpacity
          style={styles.actionItem}
          onPress={() =>
            navigation.navigate('AdminCompanyDetails', {
              companyId: item.id,
              company: item.raw,
            })
          }>
          <Ionicons name="eye-outline" size={15} color="#4F46E5" />
          <Text style={[styles.actionText, { color: '#4F46E5' }]}>View</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionItem}
          onPress={() =>
            navigation.navigate('EditCompany', {
              companyId: item.id,
              company: item.raw,
            })
          }>
          <Ionicons name="create-outline" size={15} color="#2563EB" />
          <Text style={[styles.actionText, { color: '#2563EB' }]}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem} onPress={() => handleDelete(item)}>
          <Ionicons name="trash-outline" size={15} color="#DC2626" />
          <Text style={[styles.actionText, { color: '#DC2626' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.stateBox}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.stateText}>Loading companies...</Text>
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.stateBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadCompanies()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.stateBox}>
        <Ionicons name="business-outline" size={32} color="#94A3B8" />
        <Text style={styles.stateText}>No companies found</Text>
      </View>
    );
  };

  const listHeader = (
    <>
      {/* Top Action Buttons */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.topActionsContainer}>
        <TouchableOpacity style={styles.primaryActionButton}>
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Register Company</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryActionButton}>
          <Ionicons name="document-text-outline" size={16} color="#E11D48" />
          <Text style={[styles.actionButtonText, { color: '#E11D48' }]}>Missing Docs</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryActionButton}>
          <Ionicons name="create-outline" size={16} color="#9333EA" />
          <Text style={[styles.actionButtonText, { color: '#9333EA' }]}>Bulk Edit</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Horizontal Stats Cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: '#FFFFFF' }]}>
          <Text style={styles.statLabel}>Total</Text>
          <Text style={styles.statValue}>{stats.total}</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#ECFDF5' }]}>
          <Text style={[styles.statLabel, { color: '#059669' }]}>Active</Text>
          <Text style={[styles.statValue, { color: '#059669' }]}>{stats.active}</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
          <Text style={[styles.statLabel, { color: '#D97706' }]}>Pending</Text>
          <Text style={[styles.statValue, { color: '#D97706' }]}>{stats.pending}</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#FFFFFF' }]}>
          <Text style={styles.statLabel}>Inactive</Text>
          <Text style={styles.statValue}>{stats.inactive}</Text>
        </View>
      </ScrollView>

      {/* Filter Tabs */}
      <View style={styles.tabsContainer}>
        {['All', 'Prospects', 'External'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab === 'All' ? 'All Companies' : tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search & Filter Bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#64748B" />
          <TextInput
            placeholder="Search company or location..."
            placeholderTextColor="#64748B"
            style={styles.searchInput}
            value={searchInput}
            onChangeText={setSearchInput}
          />
        </View>
        <TouchableOpacity style={styles.filterIconButton}>
          <Ionicons name="options-outline" size={20} color="#334155" />
        </TouchableOpacity>
      </View>

      <Text style={styles.resultsCount}>
        {loading ? 'Loading companies...' : `Showing ${mappedCompanies.length} companies`}
      </Text>
    </>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <FlatList
        data={loading ? [] : mappedCompanies}
        keyExtractor={(item, index) => String(item.id || index)}
        renderItem={renderCompany}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadCompanies({ isRefresh: true })}
            colors={['#4F46E5']}
            tintColor="#4F46E5"
          />
        }
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  topActionsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  primaryActionButton: {
    flexDirection: 'row',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
    elevation: 2,
  },
  secondaryActionButton: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statCard: {
    width: 110,
    padding: 12,
    borderRadius: 10,
    marginRight: 10,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statLabel: {
    color: '#64748B',
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    padding: 4,
    marginBottom: 14,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTabButton: {
    backgroundColor: '#FFFFFF',
    elevation: 1,
  },
  tabText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#0F172A',
    fontWeight: 'bold',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
    height: 42,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    color: '#0F172A',
    fontSize: 13,
    marginLeft: 8,
  },
  filterIconButton: {
    backgroundColor: '#FFFFFF',
    width: 42,
    height: 42,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  resultsCount: {
    color: '#64748B',
    fontSize: 12,
    marginBottom: 12,
  },
  companyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  avatarBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: 'bold',
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: 'bold',
  },
  companyType: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    maxWidth: 130,
  },
  statusText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  cardDetailsSection: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  footerDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    color: '#64748B',
    fontSize: 11,
    marginLeft: 4,
  },
  cardActionsFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  stateBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  stateText: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 10,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 12,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default CompanyManagementScreen;
