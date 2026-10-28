import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { API_BASE_URL } from '../../../config/api';
import { useAppSelector } from '../../../store/hooks';
import DocumentCard from './components/DocumentCard';

const AdminDocumentsScreen = () => {
  const navigation = useNavigation();
  const token = useAppSelector(state => state.auth.token);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

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
  }, [documents, searchQuery, typeFilter]);

  const renderItem = ({ item }) => (
    <DocumentCard item={item} token={token} onDelete={handleDelete} deletingId={deletingId} />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Documents</Text>
        {!loading && !error ? (
          <Text style={styles.countText}>
            {filteredDocuments.length} {filteredDocuments.length === 1 ? 'document' : 'documents'}{typeFilter !== 'all' ? ` • ${typeFilter}` : ''}
          </Text>
        ) : null}
      </View>
      <View style={styles.actionButtonsRow}>
        <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7} onPress={() => {
          try {
            navigation.navigate('UploadCompanyDocument');
          } catch (e) {
            Alert.alert('Error', 'Unable to open upload screen');
          }
        }}>
          <Text style={styles.actionBtnText}>Upload Docs</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7} onPress={() => Alert.alert('Draft Docs', 'Coming soon')}>
          <Text style={styles.actionBtnText}>Draft Docs</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7} onPress={() => Alert.alert('Locked Docs', 'Coming soon')}>
          <Text style={styles.actionBtnText}>Locked Docs</Text>
        </TouchableOpacity>
      </View>
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
          <TouchableOpacity
            style={[styles.filterBtn, typeFilter !== 'all' && styles.filterBtnActive]}
            activeOpacity={0.7}
            onPress={() => {
              const types = Array.from(
                new Set(
                  (Array.isArray(documents) ? documents : [])
                    .map(item => item.documentType || item.type || item.documentTypeKey || item.category)
                    .filter(Boolean)
                )
              ).sort((a, b) => String(a).localeCompare(String(b)));
              const options = [
                { text: 'All Types', onPress: () => setTypeFilter('all') },
                ...types.map(t => ({ text: String(t), onPress: () => setTypeFilter(String(t)) })),
                { text: 'Cancel', style: 'cancel' },
              ];
              Alert.alert('Filter by Type', '', options, { cancelable: true });
            }}>
            <Ionicons name="filter-outline" size={18} color={typeFilter !== 'all' ? '#1E3A8A' : '#475569'} />
          </TouchableOpacity>
        </View>
      </View>
      {typeFilter !== 'all' ? (
        <View style={styles.activeFilterRow}>
          <Text style={styles.activeFilterText}>Filtered: {typeFilter}</Text>
          <TouchableOpacity onPress={() => setTypeFilter('all')}>
            <Text style={styles.clearFilterText}>Clear</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      {loading ? (
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
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 14,
    color: '#64748B',
  },
  errorText: {
    fontSize: 13,
    color: '#DC2626',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
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
    fontSize: 11,
    color: '#475569',
  },
  clearFilterText: {
    fontSize: 11,
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
    height: 40,
    gap: 8,
  },
  filterBtn: {
    width: 40,
    height: 40,
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
    fontSize: 13,
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
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  countText: {
    fontSize: 12,
    color: '#64748B',
  },
});
