import { font } from '../../../../theme/typography';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
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
import LeadsCard from '../components/LeadsCard';
import {
  createCompanyVistaLead,
  fetchCompanyVistaLeads,
} from '../api/companyVistaLeadsApi';

const CHANNELS = [
  { key: '', label: 'All', countKey: 'all' },
  { key: 'manual', label: 'Manual', countKey: 'manual' },
  { key: 'website', label: 'Website', countKey: 'website' },
  { key: 'bulk_b2c', label: 'Bulk Email · B2C', countKey: 'bulk_b2c' },
  { key: 'bulk_b2b', label: 'Bulk Email · B2B', countKey: 'bulk_b2b' },
  { key: 'dnf', label: 'DNF', countKey: 'dnf', separated: true },
];

const EMPTY_LEAD_FORM = {
  name: '',
  email: '',
  phone: '',
  country: '',
  entity_type: '',
  company_name: '',
};

const LEAD_FORM_FIELDS = [
  { key: 'name', label: 'Full Name', required: true },
  { key: 'email', label: 'Email Address', keyboardType: 'email-address' },
  { key: 'phone', label: 'Phone Number', keyboardType: 'phone-pad' },
  { key: 'country', label: 'Country' },
  { key: 'entity_type', label: 'Entity Type' },
  { key: 'company_name', label: 'Company Name' },
];

const CompanyVistaLeadsScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const token = useAppSelector(state => state.auth.token);
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [page, setPage] = useState(1);
  const [activeChannel, setActiveChannel] = useState('');
  const [channelCounts, setChannelCounts] = useState({});
  const [searchText, setSearchText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [leadForm, setLeadForm] = useState(EMPTY_LEAD_FORM);
  const [isSavingLead, setIsSavingLead] = useState(false);

  const loadLeads = useCallback(
    async ({
      refresh = false,
      requestedPage = page,
      requestedChannel = activeChannel,
      requestedSearch = searchQuery,
    } = {}) => {
      if (refresh) setRefreshing(true);
      else setLoading(true);
      setError('');

      try {
        const result = await fetchCompanyVistaLeads(token, {
          page: requestedPage,
          limit: pagination.limit,
          channel: requestedChannel,
          search: requestedSearch,
        });
        setLeads(result.leads);
        setPagination(result.pagination);
        setChannelCounts(result.channelCounts);
        setPage(result.pagination.page);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeChannel, page, pagination.limit, searchQuery, token],
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

  useFocusEffect(
    useCallback(() => {
      loadLeads();
    }, [loadLeads]),
  );

  const handleCreateLead = async () => {
    if (isSavingLead) return;
    if (!leadForm.name.trim()) {
      Alert.alert('Name required', 'Please enter the lead name.');
      return;
    }

    setIsSavingLead(true);
    try {
      await createCompanyVistaLead({ token, payload: leadForm });
      setLeadForm(EMPTY_LEAD_FORM);
      setIsAddModalVisible(false);
      setActiveChannel('manual');
      setPage(1);
      setSearchText('');
      setSearchQuery('');
      await loadLeads({
        requestedPage: 1,
        requestedChannel: 'manual',
        requestedSearch: '',
      });
      Alert.alert('Lead added', 'The lead was added successfully.');
    } catch (createError) {
      Alert.alert('Unable to add lead', createError.message);
    } finally {
      setIsSavingLead(false);
    }
  };

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.state}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.stateText}>Loading leads...</Text>
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
            onPress={() => loadLeads()}
            accessibilityRole="button">
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      );
    }
    return (
      <View style={styles.state}>
        <Ionicons name="people-outline" size={34} color="#94A3B8" />
        <Text style={styles.emptyTitle}>No Leads Found</Text>
      </View>
    );
  };

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
          <Text style={styles.title}>VisaVista Leads</Text>
          <Text style={styles.subtitle}>Total Leads: {pagination.total}</Text>
        </View>
        <Pressable
          style={styles.addButton}
          onPress={() => setIsAddModalVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Add lead">
          <Ionicons name="add" size={25} color="#FFFFFF" />
        </Pressable>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={19} color="#94A3B8" />
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search name, email, phone..."
          placeholderTextColor="#94A3B8"
          style={styles.searchInput}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Search leads"
        />
        {searchText.length > 0 ? (
          <Pressable
            onPress={() => setSearchText('')}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            hitSlop={8}>
            <Ionicons name="close-circle" size={19} color="#94A3B8" />
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.channelTabsViewport}
        contentContainerStyle={styles.channelTabs}>
        {CHANNELS.map(channel => (
          <React.Fragment key={channel.key || 'all'}>
            {channel.separated ? <View style={styles.channelDivider} /> : null}
            <Pressable
              onPress={() => {
                if (activeChannel === channel.key) return;
                setActiveChannel(channel.key);
                setPage(1);
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: activeChannel === channel.key }}
              style={[
                styles.channelTab,
                activeChannel === channel.key && styles.channelTabActive,
                channel.separated && styles.dnfTab,
                activeChannel === channel.key &&
                  channel.key === 'dnf' &&
                  styles.dnfTabActive,
              ]}>
              <Text
                allowFontScaling={false}
                style={[
                  styles.channelTabLabel,
                  activeChannel === channel.key && styles.channelTabLabelActive,
                  channel.key === 'dnf' && styles.dnfTabLabel,
                  activeChannel === channel.key &&
                    channel.key === 'dnf' &&
                    styles.dnfTabLabelActive,
                ]}>
                {channel.label}
              </Text>
              <View
                style={[
                  styles.channelCountBadge,
                  activeChannel === channel.key && styles.channelTabCountActive,
                  channel.key === 'dnf' && styles.dnfTabCount,
                  activeChannel === channel.key &&
                    channel.key === 'dnf' &&
                    styles.dnfTabCountActive,
                ]}>
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.channelTabCount,
                    channel.key === 'dnf' && styles.dnfTabCountText,
                    activeChannel === channel.key && styles.channelTabCountActiveText,
                  ]}>
                  {channelCounts[channel.countKey] ?? 0}
                </Text>
              </View>
            </Pressable>
          </React.Fragment>
        ))}
      </ScrollView>

      <FlatList
        style={styles.leadsList}
        data={leads}
        keyExtractor={(item, index) => String(item._id || `lead-${index}`)}
        renderItem={({ item }) => <LeadsCard lead={item} />}
        ListFooterComponent={
          pagination.pages > 1 ? (
            <View style={styles.pagination}>
              <Pressable
                style={[styles.pageButton, page <= 1 && styles.pageButtonDisabled]}
                onPress={() => setPage(currentPage => currentPage - 1)}
                disabled={page <= 1 || loading}
                accessibilityRole="button"
                accessibilityLabel="Previous page">
                <Ionicons name="chevron-back" size={18} color="#334155" />
              </Pressable>
              <Text style={styles.pageText}>
                Page {pagination.page} of {pagination.pages}
              </Text>
              <Pressable
                style={[
                  styles.pageButton,
                  page >= pagination.pages && styles.pageButtonDisabled,
                ]}
                onPress={() => setPage(currentPage => currentPage + 1)}
                disabled={page >= pagination.pages || loading}
                accessibilityRole="button"
                accessibilityLabel="Next page">
                <Ionicons name="chevron-forward" size={18} color="#334155" />
              </Pressable>
            </View>
          ) : null
        }
        ListHeaderComponent={
          error && leads.length ? (
            <Text style={styles.refreshError}>{error}</Text>
          ) : null
        }
        contentContainerStyle={[
          styles.listContent,
          !leads.length && styles.emptyListContent,
          { paddingBottom: s(24) + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadLeads({ refresh: true })}
            tintColor="#2563EB"
            colors={['#2563EB']}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />

      <Modal
        visible={isAddModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!isSavingLead) setIsAddModalVisible(false);
        }}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => {
              if (!isSavingLead) setIsAddModalVisible(false);
            }}
          />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Enter Lead Details</Text>
              <Pressable
                onPress={() => setIsAddModalVisible(false)}
                disabled={isSavingLead}
                accessibilityRole="button"
                accessibilityLabel="Close add lead modal"
                hitSlop={8}>
                <Ionicons name="close" size={22} color="#64748B" />
              </Pressable>
            </View>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              {LEAD_FORM_FIELDS.map(field => (
                <View key={field.key} style={styles.formField}>
                  <Text style={styles.formLabel}>
                    {field.label}
                    {field.required ? ' *' : ''}
                  </Text>
                  <TextInput
                    value={leadForm[field.key]}
                    onChangeText={value =>
                      setLeadForm(previous => ({
                        ...previous,
                        [field.key]: value,
                      }))
                    }
                    placeholder={field.label}
                    placeholderTextColor="#94A3B8"
                    keyboardType={field.keyboardType || 'default'}
                    autoCapitalize={
                      field.keyboardType === 'email-address' ? 'none' : 'words'
                    }
                    autoCorrect={field.keyboardType !== 'email-address'}
                    editable={!isSavingLead}
                    style={styles.formInput}
                  />
                </View>
              ))}
            </ScrollView>
            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setIsAddModalVisible(false)}
                disabled={isSavingLead}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.saveButton, isSavingLead && styles.saveButtonDisabled]}
                onPress={handleCreateLead}
                disabled={isSavingLead}>
                {isSavingLead ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Lead</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default CompanyVistaLeadsScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(16),
    paddingBottom: s(14),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: s(40),
    height: s(40),
    borderRadius: s(10),
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: s(12),
  },
  headerCopy: {
    flex: 1,
  },
  addButton: {
    width: s(40),
    height: s(40),
    borderRadius: s(10),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
  },
  title: {
    fontSize: font.xl,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: font.xs,
    color: '#64748B',
    marginTop: s(2),
  },
  searchContainer: {
    minHeight: s(44),
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
    marginHorizontal: s(16),
    marginTop: s(12),
    marginBottom: s(4),
    paddingHorizontal: s(12),
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: s(10),
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    flex: 1,
    paddingVertical: s(8),
    color: '#0F172A',
    fontSize: font.sm,
  },
  channelTabsViewport: {
    flexGrow: 0,
    height: s(80),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  channelTabs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    paddingHorizontal: s(12),
    height: s(58),
  },
  channelTab: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    gap: s(8),
    height: s(38),
    paddingHorizontal: s(12),
    borderRadius: s(20),
    backgroundColor: '#F1F5F9',
  },
  channelTabActive: {
    backgroundColor: '#4F35F2',
    color: '#FFFFFF',
  },
  channelTabLabel: {
    fontSize: font.xs,
    lineHeight: s(16),
    includeFontPadding: false,
    fontWeight: '600',
    color: '#334155',
  },
  channelTabLabelActive: {
    color: '#FFFFFF',
  },
  channelCountBadge: {
    minWidth: s(22),
    height: s(24),
    paddingHorizontal: s(5),
    borderRadius: s(12),
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelTabCount: {
    color: '#475569',
    fontSize: font.tiny,
    lineHeight: s(13),
    fontWeight: '700',
    textAlign: 'center',
    includeFontPadding: false,
  },
  channelTabCountActiveText: {
    color: '#FFFFFF',
  },
  channelTabCountActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  channelDivider: {
    width: StyleSheet.hairlineWidth,
    height: s(23),
    marginHorizontal: s(2),
    backgroundColor: '#CBD5E1',
  },
  dnfTab: {
    backgroundColor: '#FFF1F2',
  },
  dnfTabActive: {
    backgroundColor: '#E11D48',
  },
  dnfTabLabel: {
    color: '#BE123C',
  },
  dnfTabLabelActive: {
    color: '#FFFFFF',
  },
  dnfTabCount: {
    backgroundColor: '#FFFFFF',
  },
  dnfTabCountActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: '#FFFFFF',
  },
  dnfTabCountText: {
    color: '#BE123C',
  },
  dnfTabCountTextActive: {
    color: '#FFFFFF',
  },
  leadsList: {
    marginTop: s(12),
  },
  listContent: {
    paddingHorizontal: s(16),
    paddingTop: s(24),
    paddingBottom: s(16),
    gap: s(14),
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: s(16),
    paddingVertical: s(10),
  },
  pageButton: {
    width: s(38),
    height: s(38),
    borderRadius: s(10),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageButtonDisabled: {
    opacity: 0.4,
  },
  pageText: {
    fontSize: font.sm,
    color: '#475569',
    fontWeight: '600',
  },
  state: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: s(28),
    gap: s(10),
  },
  stateText: {
    fontSize: font.sm,
    color: '#64748B',
  },
  emptyTitle: {
    fontSize: font.lg,
    fontWeight: '600',
    color: '#334155',
  },
  errorText: {
    fontSize: font.sm,
    color: '#B91C1C',
    textAlign: 'center',
  },
  refreshError: {
    fontSize: font.xs,
    color: '#B91C1C',
    padding: s(10),
    borderRadius: s(8),
    backgroundColor: '#FEE2E2',
  },
  retryButton: {
    paddingHorizontal: s(16),
    paddingVertical: s(9),
    borderRadius: s(8),
    backgroundColor: '#2563EB',
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: font.sm,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: s(20),
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '85%',
    padding: s(20),
    borderRadius: s(16),
    backgroundColor: '#FFFFFF',
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: s(16),
  },
  modalTitle: {
    fontSize: font.xl,
    fontWeight: '700',
    color: '#0F172A',
  },
  formField: {
    marginBottom: s(14),
  },
  formLabel: {
    marginBottom: s(6),
    fontSize: font.sm,
    fontWeight: '600',
    color: '#334155',
  },
  formInput: {
    minHeight: s(44),
    paddingHorizontal: s(12),
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: s(9),
    color: '#0F172A',
    fontSize: font.sm,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: s(10),
    marginTop: s(10),
  },
  cancelButton: {
    minWidth: s(86),
    minHeight: s(42),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: s(8),
    backgroundColor: '#F1F5F9',
  },
  cancelButtonText: {
    color: '#334155',
    fontSize: font.sm,
    fontWeight: '600',
  },
  saveButton: {
    minWidth: s(104),
    minHeight: s(42),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: s(8),
    backgroundColor: '#2563EB',
  },
  saveButtonDisabled: {
    opacity: 0.65,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: font.sm,
    fontWeight: '600',
  },
});
