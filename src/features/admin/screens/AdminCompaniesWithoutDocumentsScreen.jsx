import { font } from '../../../theme/typography';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { useAppSelector } from '../../../store/hooks';
import {
  fetchCompaniesWithoutDocuments,
  setMissingDocumentFlag,
} from '../documents/api/adminMissingDocumentsApi';

const formatDate = value => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getStatusStyle = status => {
  switch (String(status || '').toLowerCase()) {
    case 'active':
      return { color: '#15803D', backgroundColor: '#DCFCE7' };
    case 'pending':
      return { color: '#B45309', backgroundColor: '#FEF3C7' };
    case 'in review':
      return { color: '#6D28D9', backgroundColor: '#EDE9FE' };
    case 'rejected':
      return { color: '#B91C1C', backgroundColor: '#FEE2E2' };
    case 'inactive':
      return { color: '#475569', backgroundColor: '#F1F5F9' };
    default:
      return { color: '#475569', backgroundColor: '#F1F5F9' };
  }
};

const AdminCompaniesWithoutDocumentsScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const token = useAppSelector(state => state.auth.token);
  const [companies, setCompanies] = useState([]);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [updatingCompanyId, setUpdatingCompanyId] = useState(null);

  const loadCompanies = useCallback(
    async (isRefresh = false) => {
      if (!token) {
        setError('Auth token missing. Please login again.');
        setLoading(false);
        setRefreshing(false);
        return;
      }
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError('');
      try {
        const result = await fetchCompaniesWithoutDocuments(token);
        setCompanies(result.companies);
        setTotalCompanies(result.totalCompanies);
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
      loadCompanies();
    }, [loadCompanies]),
  );

  const filteredCompanies = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return companies;
    return companies.filter(company =>
      String(company.companyName || '')
        .toLowerCase()
        .includes(query),
    );
  }, [companies, search]);

  const pendingCompanies = filteredCompanies.filter(
    company => !company.missingDocumentFlagged,
  );
  const selectedCompanies = filteredCompanies.filter(
    company => company.missingDocumentFlagged,
  );

  const toggleSelected = async company => {
    const companyId = company._id;
    const nextFlag = !company.missingDocumentFlagged;
    setCompanies(current =>
      current.map(item =>
        item._id === companyId
          ? { ...item, missingDocumentFlagged: nextFlag }
          : item,
      ),
    );
    setUpdatingCompanyId(companyId);
    try {
      await setMissingDocumentFlag({
        token,
        companyId,
        flagged: nextFlag,
      });
    } catch (updateError) {
      setCompanies(current =>
        current.map(item =>
          item._id === companyId
            ? { ...item, missingDocumentFlagged: !nextFlag }
            : item,
        ),
      );
      Alert.alert('Unable to update selection', updateError.message);
    } finally {
      setUpdatingCompanyId(null);
    }
  };

  const renderCompany = ({ item }) => {
    const status = getStatusStyle(item.registrationStatus);
    const selected = Boolean(item.missingDocumentFlagged);
    const location = [item.countryOfIncorporation, item.stateOfRegistration]
      .filter(Boolean)
      .join(' / ');

    return (
      <View
        key={item._id}
        style={[styles.companyCard, selected && styles.selectedCard]}
      >
        <TouchableOpacity
          style={styles.companyDetails}
          activeOpacity={0.75}
          onPress={() =>
            navigation.navigate('AdminCompanyDetails', {
              companyId: item._id,
              company: item,
            })
          }
        >
          <View style={styles.companyTitleRow}>
            <Text style={styles.companyName} numberOfLines={2}>
              {item.companyName || 'Unnamed company'}
            </Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: status.backgroundColor },
              ]}
            >
              <Text style={[styles.statusText, { color: status.color }]}>
                {item.registrationStatus || 'Unknown'}
              </Text>
            </View>
          </View>
          {item.registrationNumber ? (
            <Text style={styles.companyMeta} numberOfLines={1}>
              #{item.registrationNumber}
            </Text>
          ) : null}
          <Text style={styles.companyMeta} numberOfLines={1}>
            {[item.companyType, location].filter(Boolean).join(' · ') ||
              'Company details unavailable'}
          </Text>
          <Text style={styles.companyMeta}>
            Registered {formatDate(item.createdAt)}
          </Text>
        </TouchableOpacity>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.selectAction}
            accessibilityRole="checkbox"
            accessibilityState={{
              checked: selected,
              disabled: updatingCompanyId === item._id,
            }}
            accessibilityLabel={`${selected ? 'Unselect' : 'Select'} ${
              item.companyName || 'company'
            }`}
            disabled={updatingCompanyId === item._id}
            onPress={() => toggleSelected(item)}
          >
            {updatingCompanyId === item._id ? (
              <ActivityIndicator size="small" color="#4F46E5" />
            ) : (
              <View
                style={[styles.checkbox, selected && styles.checkboxSelected]}
              >
                {selected ? (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                ) : null}
              </View>
            )}
            <Text style={styles.selectText}>
              {selected ? 'Selected' : 'Select for review'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.uploadButton}
            accessibilityRole="button"
            accessibilityLabel={`Upload documents for ${
              item.companyName || 'company'
            }`}
            onPress={() =>
              navigation.navigate('UploadCompanyDocument', {
                companyId: item._id,
                company: item,
              })
            }
          >
            <Ionicons name="cloud-upload-outline" size={16} color="#FFFFFF" />
            <Text style={styles.uploadButtonText}>Upload</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSection = (title, subtitle, data, emptyText) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleWrap}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionCount}>{data.length}</Text>
        </View>
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      </View>
      {data.length ? (
        data.map(company => renderCompany({ item: company }))
      ) : (
        <Text style={styles.emptySectionText}>{emptyText}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <View
        style={[styles.header, { paddingTop: Math.max(insets.top, 10) + 8 }]}
      >
        <TouchableOpacity
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={21} color="#1E293B" />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Missing Documents</Text>
          <Text style={styles.subtitle}>
            Companies with no uploaded documents
          </Text>
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          accessibilityRole="button"
          accessibilityLabel="Refresh missing documents"
          onPress={() => loadCompanies(true)}
          disabled={refreshing}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color="#4F46E5" />
          ) : (
            <Ionicons name="refresh-outline" size={20} color="#4F46E5" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 20 + insets.bottom },
        ]}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadCompanies(true)}
            tintColor="#4F46E5"
            colors={['#4F46E5']}
          />
        }
      >
        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Ionicons name="document-text-outline" size={21} color="#4F46E5" />
          </View>
          <Text style={styles.summaryText}>
            <Text style={styles.summaryCount}>{companies.length}</Text>
            {' of '}
            <Text style={styles.summaryCount}>{totalCompanies}</Text>
            {' companies have no documents uploaded.'}
          </Text>
        </View>

        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search company name"
            placeholderTextColor="#94A3B8"
            returnKeyType="search"
          />
          {search ? (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              onPress={() => setSearch('')}
            >
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>

        {error ? (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={20} color="#B91C1C" />
            <View style={styles.errorCopy}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={() => loadCompanies()}>
                <Text style={styles.retryText}>Try again</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
        {loading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text style={styles.loadingText}>Loading companies...</Text>
          </View>
        ) : filteredCompanies.length === 0 && !error ? (
          <View style={styles.emptyCard}>
            <Ionicons
              name="checkmark-circle-outline"
              size={34}
              color="#16A34A"
            />
            <Text style={styles.emptyText}>
              {companies.length
                ? 'No companies match your search.'
                : 'Every company has at least one document uploaded.'}
            </Text>
          </View>
        ) : (
          <>
            {renderSection(
              'Pending Review',
              'Select companies after reviewing their missing documents.',
              pendingCompanies,
              'Nothing pending — everything has been reviewed.',
            )}
            {selectedCompanies.length
              ? renderSection(
                  'Selected',
                  'Marked as needing a document upload.',
                  selectedCompanies,
                  '',
                )
              : null}
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default AdminCompaniesWithoutDocumentsScreen;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: { padding: 6, marginRight: 8 },
  headerCopy: { flex: 1 },
  title: { color: '#0F172A', fontSize: font.md, fontWeight: '800' },
  subtitle: { color: '#64748B', fontSize: font.xs, marginTop: 2 },
  refreshButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
  },
  content: { padding: 16 },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    marginRight: 11,
  },
  summaryText: { flex: 1, color: '#475569', fontSize: font.sm, lineHeight: 20 },
  summaryCount: { color: '#0F172A', fontWeight: '800' },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 8,
    color: '#0F172A',
    fontSize: font.sm,
  },
  section: {
    marginBottom: 14,
    padding: 13,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeader: { marginBottom: 10 },
  sectionTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { color: '#0F172A', fontSize: font.base, fontWeight: '800' },
  sectionCount: {
    color: '#475569',
    fontSize: font.xs,
    fontWeight: '700',
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  sectionSubtitle: { color: '#64748B', fontSize: font.xs, marginTop: 4 },
  companyCard: {
    padding: 11,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  selectedCard: { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' },
  companyTitleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  companyName: {
    flex: 1,
    color: '#0F172A',
    fontSize: font.sm,
    fontWeight: '700',
  },
  statusBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 12 },
  statusText: {
    fontSize: font.caption,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  companyMeta: { color: '#64748B', fontSize: font.xs, marginTop: 5 },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  selectAction: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 34,
    flex: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    marginRight: 7,
  },
  checkboxSelected: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  selectText: { color: '#475569', fontSize: font.xs, fontWeight: '600' },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#4F46E5',
  },
  uploadButtonText: { color: '#FFFFFF', fontSize: font.xs, fontWeight: '700' },
  emptySectionText: {
    color: '#64748B',
    fontSize: font.sm,
    textAlign: 'center',
    paddingVertical: 14,
  },
  loadingState: { alignItems: 'center', paddingVertical: 35 },
  loadingText: { color: '#64748B', fontSize: font.sm, marginTop: 10 },
  emptyCard: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 34,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyText: {
    color: '#64748B',
    fontSize: font.sm,
    textAlign: 'center',
    marginTop: 9,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    marginBottom: 12,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
  },
  errorCopy: { flex: 1, marginLeft: 8 },
  errorText: { color: '#B91C1C', fontSize: font.xs },
  retryText: {
    color: '#1D4ED8',
    fontSize: font.xs,
    fontWeight: '700',
    marginTop: 7,
  },
});
