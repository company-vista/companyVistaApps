import { font } from '../../../theme/typography';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { API_BASE_URL } from '../../../config/api';
import { useAppSelector } from '../../../store/hooks';
import DocumentCard from './components/DocumentCard';

const isMailOrLetterDocument = item => {
  const documentType = [
    item?.sourceGroup,
    item?.documentType,
    item?.type,
    item?.documentTypeKey,
    item?.category,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return documentType.includes('mail') || documentType.includes('letter');
};

const isDraftDocument = item =>
  item?.isDraft === true ||
  String(item?.isDraft).toLowerCase() === 'true' ||
  String(item?.status || '').toLowerCase() === 'draft';

const isItrDocument = item => {
  const documentDetails = [
    item?.sourceGroup,
    item?.documentType,
    item?.type,
    item?.documentTypeKey,
    item?.category,
    item?.originalFileName,
    item?.fileName,
    item?.title,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return /\bitr(?:\s*[-_]?\s*\d+)?\b|income\s+tax\s+return/.test(documentDetails);
};

const getLockedCompanyName = item =>
  item?.company?.companyName ||
  item?.company?.name ||
  item?.companyName ||
  item?.companyId?.companyName ||
  item?.companyId?.name ||
  'Company';

const formatLockedDate = value => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
};

const AdminDocumentsScreen = () => {
  const navigation = useNavigation();
  const token = useAppSelector(state => state.auth.token);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [lockedDocuments, setLockedDocuments] = useState([]);
  const [lockedLoading, setLockedLoading] = useState(false);
  const [lockedError, setLockedError] = useState('');
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [documentFilter, setDocumentFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

  const fetchDocuments = async () => {
    if (!token) {
      setError('Auth token missing');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/documents`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-auth-token': token,
        },
      });
      const data = response.data?.data || response.data?.documents || response.data || [];
      setDocuments(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [token]);

  useEffect(() => {
    let isMounted = true;
    const fetchLockedDocuments = async () => {
      if (!token) {
        setLockedError('Auth token missing');
        return;
      }

      setLockedLoading(true);
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/locked-documents`,
          {
            headers: {
              Authorization: `******`,
              'x-auth-token': token,
            },
          },
        );
        if (!isMounted) return;
        const data = response.data?.data;
        if (!Array.isArray(data)) {
          throw new Error('Invalid locked documents response');
        }
        setLockedDocuments(data);
        setLockedError('');
      } catch (requestError) {
        if (isMounted) {
          setLockedError(
            requestError?.response?.data?.message ||
              requestError?.message ||
              'Failed to load locked documents',
          );
        }
      } finally {
        if (isMounted) setLockedLoading(false);
      }
    };

    fetchLockedDocuments();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleDelete = async (doc) => {
    if (!doc._id && !doc.id) {
      Alert.alert('Error', 'Invalid document');
      return;
    }
    try {
      setDeletingId(doc._id || doc.id);
      const deleteUrl = doc.deleteUrl || `/api/documents/${doc._id || doc.id}`;
      const fullUrl = deleteUrl.startsWith('http') ? deleteUrl : `${API_BASE_URL}${deleteUrl}`;
      await axios.delete(fullUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-auth-token': token,
        },
        withCredentials: true,
      });
      setDocuments(prev => prev.filter(d => (d._id || d.id) !== (doc._id || doc.id)));
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to delete document');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredDocuments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let result = Array.isArray(documents) ? documents : [];
    if (activeTab === 'locked') return [];
    if (activeTab === 'mailsAndLetters') {
      result = result.filter(isMailOrLetterDocument);
    }
    if (documentFilter === 'draft') {
      result = result.filter(isDraftDocument);
    } else if (documentFilter === 'itr') {
      result = result.filter(isItrDocument);
    }
    if (typeFilter !== 'all') {
      result = result.filter(item => {
        const docType = item.documentType || item.type || item.documentTypeKey || item.category || '';
        return String(docType) === String(typeFilter);
      });
    }
    if (!query) return result;
    return result.filter(item => {
      const title = (item.originalFileName || item.fileName || item.title || '').toLowerCase();
      const companyName = (item.company?.companyName || item.companyName || '').toLowerCase();
      const docType = (item.documentType || item.type || '').toLowerCase();
      const uploadedBy = (item.uploadedBy || item.uploadedByName || item.createdBy?.name || '').toLowerCase();
      return title.includes(query) || companyName.includes(query) || docType.includes(query) || uploadedBy.includes(query);
    });
  }, [activeTab, documents, documentFilter, searchQuery, typeFilter]);

  const filteredLockedDocuments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return lockedDocuments;
    return lockedDocuments.filter(item => {
      const companyName = getLockedCompanyName(item).toLowerCase();
      const dates = (Array.isArray(item.documentDates) ? item.documentDates : [])
        .map(formatLockedDate)
        .join(' ')
        .toLowerCase();
      return companyName.includes(query) || dates.includes(query);
    });
  }, [lockedDocuments, searchQuery]);

  const renderItem = ({ item }) => (
    <DocumentCard item={item} token={token} onDelete={handleDelete} deletingId={deletingId} />
  );

  const renderLockedItem = ({ item, index }) => {
    const dates = Array.isArray(item.documentDates) ? item.documentDates : [];
    const isUnlocked =
      Array.isArray(item.unlockedIndices) && item.unlockedIndices.length > 0;
    return (
      <View style={styles.lockedCard}>
        <View style={styles.lockedCardHeader}>
          <View style={styles.lockedIconWrap}>
            <Ionicons
              name={isUnlocked ? 'lock-open-outline' : 'lock-closed-outline'}
              size={18}
              color={isUnlocked ? '#16A34A' : '#DC2626'}
            />
          </View>
          <View style={styles.lockedInfo}>
            <Text style={styles.lockedCompany} numberOfLines={2}>
              {getLockedCompanyName(item)}
            </Text>
            <Text style={styles.lockedDate}>
              Created: {formatLockedDate(item.createdAt) || '—'}
            </Text>
          </View>
          <View
            style={[
              styles.lockedStatus,
              isUnlocked ? styles.unlockedStatus : styles.lockedStatusBadge,
            ]}>
            <Text
              style={[
                styles.lockedStatusText,
                isUnlocked ? styles.unlockedStatusText : styles.lockedStatusTextColor,
              ]}>
              {isUnlocked ? 'Unlocked' : 'Locked'}
            </Text>
          </View>
        </View>
        {dates.length > 0 ? (
          <View style={styles.lockedDates}>
            <Text style={styles.lockedDatesLabel}>Document dates</Text>
            {dates.map((date, dateIndex) => (
              <Text
                key={`${item._id || item.id || index}-${dateIndex}`}
                style={styles.lockedDateItem}>
                {formatLockedDate(date) || '—'}
              </Text>
            ))}
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Documents</Text>
        {activeTab === 'locked' ? (
          !lockedLoading && !lockedError ? (
            <Text style={styles.countText}>
              {filteredLockedDocuments.length}{' '}
              {filteredLockedDocuments.length === 1
                ? 'locked document'
                : 'locked documents'}
            </Text>
          ) : null
        ) : !loading && !error ? (
          <Text style={styles.countText}>
            {filteredDocuments.length}{' '}
            {filteredDocuments.length === 1 ? 'document' : 'documents'}
            {activeTab === 'mailsAndLetters'
              ? ' • Mails & Letters'
              : typeFilter !== 'all'
                ? ` • ${typeFilter}`
                : ' • All Docs'}
          </Text>
        ) : null}
      </View>
      <ScrollView
        horizontal
        style={styles.tabsScroll}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsRow}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityState={{ selected: activeTab === 'all' }}
          style={[styles.tabBtn, activeTab === 'all' && styles.tabBtnActive]}
          activeOpacity={0.7}
          onPress={() => {
            setTypeFilter('all');
            setActiveTab('all');
          }}>
          <Text
            style={[
              styles.tabBtnText,
              activeTab === 'all' && styles.tabBtnTextActive,
            ]}>
            All Docs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityState={{ selected: activeTab === 'mailsAndLetters' }}
          style={[
            styles.tabBtn,
            activeTab === 'mailsAndLetters' && styles.tabBtnActive,
          ]}
          activeOpacity={0.7}
          onPress={() => {
            setTypeFilter('all');
            setActiveTab('mailsAndLetters');
          }}>
          <Text
            style={[
              styles.tabBtnText,
              activeTab === 'mailsAndLetters' && styles.tabBtnTextActive,
            ]}>
            Mails & Letters
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          style={styles.tabBtn}
          activeOpacity={0.7}
          onPress={() => {
            try {
              navigation.navigate('UploadCompanyDocument');
            } catch (e) {
              Alert.alert('Error', 'Unable to open upload screen');
            }
          }}>
          <Text style={styles.tabBtnText}>Upload Docs</Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityState={{ selected: activeTab === 'locked' }}
          style={[styles.tabBtn, activeTab === 'locked' && styles.tabBtnActive]}
          activeOpacity={0.7}
          onPress={() => {
            setTypeFilter('all');
            setActiveTab('locked');
          }}>
          <Text
            style={[
              styles.tabBtnText,
              activeTab === 'locked' && styles.tabBtnTextActive,
            ]}>
            Locked Docs
          </Text>
        </TouchableOpacity>
      </ScrollView>
      <View style={styles.searchWrapper}>
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search documents..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          {activeTab !== 'locked' ? <TouchableOpacity
            style={[styles.filterBtn, documentFilter !== 'all' && styles.filterBtnActive]}
            accessibilityRole="button"
            activeOpacity={0.7}
            onPress={() => {
              Alert.alert('Filter documents', '', [
                {
                  text: 'Draft Docs',
                  onPress: () => {
                    setTypeFilter('all');
                    setDocumentFilter('draft');
                  },
                },
                {
                  text: 'ITR',
                  onPress: () => {
                    setTypeFilter('all');
                    setDocumentFilter('itr');
                  },
                },
                { text: 'Cancel', style: 'cancel' },
              ], { cancelable: true });
            }}>
            <Ionicons name="filter-outline" size={18} color={documentFilter !== 'all' ? '#1E3A8A' : '#475569'} />
          </TouchableOpacity> : null}
        </View>
      </View>
      {documentFilter !== 'all' || typeFilter !== 'all' ? (
        <View style={styles.activeFilterRow}>
          <Text style={styles.activeFilterText}>
            Filtered: {documentFilter === 'draft' ? 'Draft Docs' : documentFilter === 'itr' ? 'ITR' : typeFilter}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setTypeFilter('all');
              setDocumentFilter('all');
            }}>
            <Text style={styles.clearFilterText}>Clear</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      {activeTab === 'locked' ? (
        lockedLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="small" color="#1E3A8A" />
          </View>
        ) : lockedError ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>{lockedError}</Text>
          </View>
        ) : filteredLockedDocuments.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.text}>No locked documents found</Text>
          </View>
        ) : (
          <FlatList
            data={filteredLockedDocuments}
            keyExtractor={(item, index) =>
              String(item._id || item.id || index)
            }
            renderItem={renderLockedItem}
            contentContainerStyle={styles.list}
          />
        )
      ) : loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="small" color="#1E3A8A" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : filteredDocuments.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.text}>No documents found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredDocuments}
          keyExtractor={(item, index) => item._id || item.id || String(index)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

export default AdminDocumentsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: font.xxl,
    fontWeight: '600',
    color: '#1E293B',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: font.base,
    color: '#64748B',
  },
  errorText: {
    fontSize: font.bodySmall,
    color: '#DC2626',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  lockedCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  lockedCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  lockedIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedInfo: {
    flex: 1,
  },
  lockedCompany: {
    color: '#1E293B',
    fontSize: font.bodySmall,
    fontWeight: '700',
  },
  lockedDate: {
    color: '#64748B',
    fontSize: font.xs,
    marginTop: 3,
  },
  lockedStatus: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
  },
  lockedStatusBadge: {
    backgroundColor: '#FEF2F2',
  },
  unlockedStatus: {
    backgroundColor: '#F0FDF4',
  },
  lockedStatusText: {
    fontSize: font.xs,
    fontWeight: '700',
  },
  lockedStatusTextColor: {
    color: '#DC2626',
  },
  unlockedStatusText: {
    color: '#16A34A',
  },
  lockedDates: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 12,
    paddingTop: 10,
    gap: 5,
  },
  lockedDatesLabel: {
    color: '#475569',
    fontSize: font.xs,
    fontWeight: '600',
    marginBottom: 2,
  },
  lockedDateItem: {
    color: '#64748B',
    fontSize: font.sm,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  tabsScroll: {
    flexGrow: 0,
    minHeight: 52,
  },
  tabBtn: {
    minWidth: 140,
    height: 42,
    flexShrink: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnText: {
    fontSize: font.sm,
    lineHeight: font.base,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
    includeFontPadding: false,
  },
  tabBtnActive: {
    borderColor: '#1E3A8A',
    backgroundColor: '#EFF6FF',
  },
  tabBtnTextActive: {
    color: '#1E3A8A',
  },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  activeFilterText: {
    fontSize: font.small,
    color: '#475569',
  },
  clearFilterText: {
    fontSize: font.small,
    color: '#1E3A8A',
    fontWeight: '600',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    height: 48,
    gap: 8,
  },
  filterBtn: {
    width: 48,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtnActive: {
    borderColor: '#1E3A8A',
    backgroundColor: '#EFF6FF',
  },
  searchInput: {
    flex: 1,
    fontSize: font.bodySmall,
    color: '#1E293B',
    paddingVertical: 0,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: font.xxl,
    fontWeight: '700',
    color: '#1E293B',
  },
  countText: {
    fontSize: font.sm,
    color: '#64748B',
  },
});
