import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { font } from '../../../../theme/typography';
import { useAppSelector } from '../../../../store/hooks';
import {
  fetchCompanyRequests,
  updateCompanyStatus,
} from '../api/companyApi';
import ScreenShell from '../components/ScreenShell';
import TopNav from '../components/TopNav';

const STATUS_META = {
  pending: {
    label: 'Pending',
    color: '#92400E',
    bg: '#FFF8E7',
    dot: '#F59E0B',
  },
  'in review': {
    label: 'In Review',
    color: '#1E40AF',
    bg: '#EFF6FF',
    dot: '#3B82F6',
  },
  active: {
    label: 'Approved',
    color: '#065F46',
    bg: '#ECFDF5',
    dot: '#10B981',
  },
  delivered: {
    label: 'Delivered',
    color: '#4C1D95',
    bg: '#F5F3FF',
    dot: '#8B5CF6',
  },
  rejected: {
    label: 'Rejected',
    color: '#991B1B',
    bg: '#FEF2F2',
    dot: '#EF4444',
  },
};

const STATUS_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'In Review', value: 'in review' },
  { label: 'Approved', value: 'active' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Rejected', value: 'rejected' },
];

const getStatusMeta = status =>
  STATUS_META[String(status || '').toLowerCase()] || {
    label: status || 'Pending',
    color: '#475569',
    bg: '#F1F5F9',
    dot: '#94A3B8',
  };

const getApplicantName = company => {
  const data = company.registrationRequestData || {};
  const director = Array.isArray(data.directors) ? data.directors[0] : null;
  return (
    data.applicantName ||
    [director?.firstName, director?.lastName].filter(Boolean).join(' ') ||
    'Not provided'
  );
};

const getSubmittedDate = company => {
  const value = company.submittedAt || company.createdAt;
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const StatusBadge = ({ status }) => {
  const meta = getStatusMeta(status);
  return (
    <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
      <View style={[styles.statusDot, { backgroundColor: meta.dot }]} />
      <Text style={[styles.statusText, { color: meta.color }]}>
        {meta.label}
      </Text>
    </View>
  );
};

const AdminCompanyRequestsScreen = () => {
  const navigation = useNavigation();
  const token = useAppSelector(state => state.auth.token);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState('');
  const [messageModal, setMessageModal] = useState({
    visible: false,
    companyId: '',
    status: '',
  });
  const [messageText, setMessageText] = useState('');

  const loadRequests = useCallback(
    async ({ isRefresh = false } = {}) => {
      if (!token) {
        setError('Auth token missing. Please login again.');
        setLoading(false);
        setRefreshing(false);
        return;
      }
      if (!isRefresh) setLoading(true);
      try {
        const list = await fetchCompanyRequests({ token });
        setRequests(list);
        setError('');
      } catch (err) {
        setError(
          err?.message || 'Failed to load company requests. Please try again.',
        );
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

  const stats = useMemo(() => {
    const countByStatus = status =>
      requests.filter(
        request =>
          String(request.registrationStatus || '').toLowerCase() === status,
      ).length;
    return {
      total: requests.length,
      pending: countByStatus('pending'),
      review: countByStatus('in review'),
      approved: countByStatus('active'),
      rejected: countByStatus('rejected'),
    };
  }, [requests]);

  const filteredRequests = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return requests.filter(request => {
      const status = String(request.registrationStatus || '').toLowerCase();
      if (statusFilter !== 'all' && status !== statusFilter) return false;
      if (!query) return true;
      const haystack = [
        request.companyName,
        request.countryOfIncorporation,
        request.companyType,
        request.principalActivity,
        getApplicantName(request),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [requests, searchTerm, statusFilter]);

  const openDetails = request => {
    navigation.navigate('AdminCompanyDetails', {
      companyId: request._id || request.id,
      company: request,
    });
  };

  const openMessageModal = (companyId, status) => {
    setMessageText('');
    setMessageModal({ visible: true, companyId, status });
  };

  const closeMessageModal = () => {
    if (updatingId) return;
    setMessageModal({ visible: false, companyId: '', status: '' });
    setMessageText('');
  };

  const handleStatusUpdate = async () => {
    const { companyId, status } = messageModal;
    if (!companyId || !status) return;
    setUpdatingId(companyId);
    try {
      const updated = await updateCompanyStatus({
        token,
        companyId,
        status,
        message: messageText.trim(),
      });
      const nextStatus = updated?.registrationStatus || status;
      setRequests(current =>
        current.map(item =>
          item._id === companyId || item.id === companyId
            ? { ...item, ...(updated || {}), registrationStatus: nextStatus }
            : item,
        ),
      );
      setMessageModal({ visible: false, companyId: '', status: '' });
      setMessageText('');
      Alert.alert('Status updated', `Request marked as ${getStatusMeta(nextStatus).label}.`);
    } catch (err) {
      Alert.alert(
        'Update failed',
        err?.message || 'Unable to update the request status.',
      );
    } finally {
      setUpdatingId('');
    }
  };

  const renderRequest = ({ item }) => {
    const status = String(item.registrationStatus || 'pending').toLowerCase();
    const directors = Array.isArray(item.registrationRequestData?.directors)
      ? item.registrationRequestData.directors.length
      : 0;
    const isCompleted = status === 'active' || status === 'delivered';
    const isUpdating = updatingId === (item._id || item.id);

    return (
      <View style={styles.card}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => openDetails(item)}
          accessibilityRole="button">
          <View style={styles.cardHeader}>
            <View style={styles.companyIcon}>
              <Ionicons name="business" size={18} color="#4F46E5" />
            </View>
            <View style={styles.companyInfo}>
              <Text style={styles.companyName} numberOfLines={1}>
                {item.companyName || 'Unnamed Company'}
              </Text>
              <View style={styles.metaRow}>
                <StatusBadge status={status} />
                {item.companyType ? (
                  <Text style={styles.companyType}>{item.companyType}</Text>
                ) : null}
              </View>
            </View>
          </View>

          <View style={styles.detailGrid}>
            <View style={styles.detailTile}>
              <Text style={styles.detailLabel}>Applicant</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {getApplicantName(item)}
              </Text>
            </View>
            <View style={styles.detailTile}>
              <Text style={styles.detailLabel}>Submitted</Text>
              <Text style={styles.detailValue}>{getSubmittedDate(item)}</Text>
            </View>
            <View style={styles.detailTile}>
              <Text style={styles.detailLabel}>Country</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {item.countryOfIncorporation || '—'}
              </Text>
            </View>
            <View style={styles.detailTile}>
              <Text style={styles.detailLabel}>Directors</Text>
              <Text style={styles.detailValue}>{directors || '—'}</Text>
            </View>
          </View>

          {item.companyIntroduction ? (
            <Text style={styles.intro} numberOfLines={2}>
              {item.companyIntroduction}
            </Text>
          ) : null}
        </TouchableOpacity>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => openDetails(item)}>
            <Ionicons name="eye-outline" size={14} color="#4338CA" />
            <Text style={styles.viewButtonText}>View Details</Text>
            <Ionicons name="chevron-forward" size={13} color="#4338CA" />
          </TouchableOpacity>

          {isCompleted ? (
            <View style={styles.completedBox}>
              <Ionicons name="checkmark-circle" size={15} color="#059669" />
              <Text style={styles.completedText}>
                {status === 'delivered' ? 'Delivered' : 'Approved'}
              </Text>
            </View>
          ) : (
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.reviewButton]}
                onPress={() => openMessageModal(item._id || item.id, 'in review')}
                disabled={isUpdating}>
                <Ionicons name="refresh" size={12} color="#1D4ED8" />
                <Text style={[styles.actionText, styles.reviewActionText]}>
                  In Review
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deliverButton]}
                onPress={() => openMessageModal(item._id || item.id, 'delivered')}
                disabled={isUpdating}>
                <Ionicons name="checkmark" size={12} color="#7C3AED" />
                <Text style={[styles.actionText, styles.deliverActionText]}>
                  Deliver
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => openMessageModal(item._id || item.id, 'rejected')}
                disabled={isUpdating}>
                <Ionicons name="close" size={12} color="#991B1B" />
                <Text style={[styles.actionText, styles.rejectActionText]}>
                  Reject
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.stateBox}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.stateText}>Loading requests...</Text>
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.stateBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => loadRequests()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.stateBox}>
        <Ionicons name="file-tray-outline" size={34} color="#94A3B8" />
        <Text style={styles.stateText}>No company requests found</Text>
        <Text style={styles.stateHint}>
          Signup and public-link submissions will appear here.
        </Text>
      </View>
    );
  };

  const listHeader = (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statsContainer}>
        <View style={[styles.statCard, styles.statCardTotal]}>
          <Text style={styles.statLabel}>Total</Text>
          <Text style={[styles.statValue, styles.statValueTotal]}>
            {stats.total}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Pending</Text>
          <Text style={[styles.statValue, styles.statValuePending]}>
            {stats.pending}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>In Review</Text>
          <Text style={[styles.statValue, styles.statValueReview]}>
            {stats.review}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Approved</Text>
          <Text style={[styles.statValue, styles.statValueApproved]}>
            {stats.approved}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Rejected</Text>
          <Text style={[styles.statValue, styles.statValueRejected]}>
            {stats.rejected}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color="#64748B" />
        <TextInput
          placeholder="Search companies, applicants, countries..."
          placeholderTextColor="#94A3B8"
          style={styles.searchInput}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}>
        {STATUS_FILTERS.map(filter => (
          <TouchableOpacity
            key={filter.value}
            style={[
              styles.filterChip,
              statusFilter === filter.value && styles.filterChipActive,
            ]}
            onPress={() => setStatusFilter(filter.value)}>
            <Text
              style={[
                styles.filterChipText,
                statusFilter === filter.value && styles.filterChipTextActive,
              ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.resultsCount}>
        {loading
          ? 'Loading requests...'
          : `${filteredRequests.length} result${
              filteredRequests.length === 1 ? '' : 's'
            }`}
      </Text>
    </>
  );

  return (
    <ScreenShell>
      <TopNav navigation={navigation} title="Company Requests" />
      <FlatList
        data={loading ? [] : filteredRequests}
        keyExtractor={(item, index) => String(item._id || item.id || index)}
        renderItem={renderRequest}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadRequests({ isRefresh: true });
            }}
            colors={['#4F46E5']}
            tintColor="#4F46E5"
          />
        }
      />

      <Modal
        visible={messageModal.visible}
        transparent
        animationType="fade"
        onRequestClose={closeMessageModal}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderText}>
                <Text style={styles.modalTitle}>Update Status</Text>
                <View style={styles.modalStatusRow}>
                  <Text style={styles.modalStatusLabel}>Mark as</Text>
                  <StatusBadge status={messageModal.status} />
                </View>
              </View>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={closeMessageModal}
                disabled={Boolean(updatingId)}>
                <Ionicons name="close" size={16} color="#4B5563" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Message (optional)</Text>
            <TextInput
              style={styles.modalInput}
              value={messageText}
              onChangeText={setMessageText}
              placeholder="Add a message for the client..."
              placeholderTextColor="#94A3B8"
              multiline
              textAlignVertical="top"
            />
            <Text style={styles.modalHint}>
              Visible to the client on their tracking page.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={closeMessageModal}
                disabled={Boolean(updatingId)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmit}
                onPress={handleStatusUpdate}
                disabled={Boolean(updatingId)}>
                {updatingId ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="send" size={13} color="#FFFFFF" />
                    <Text style={styles.modalSubmitText}>Send & Update</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenShell>
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  statsContainer: {
    paddingBottom: 14,
  },
  statCard: {
    width: 100,
    padding: 12,
    borderRadius: 10,
    marginRight: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statCardTotal: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  statLabel: {
    color: '#64748B',
    fontSize: font.sm,
    marginBottom: 4,
  },
  statValue: {
    color: '#0F172A',
    fontSize: font.xxl,
    fontWeight: 'bold',
  },
  statValueTotal: {
    color: '#4F46E5',
  },
  statValuePending: {
    color: '#D97706',
  },
  statValueReview: {
    color: '#2563EB',
  },
  statValueApproved: {
    color: '#059669',
  },
  statValueRejected: {
    color: '#DC2626',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 42,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    color: '#0F172A',
    fontSize: font.bodySmall,
    marginLeft: 8,
  },
  filtersContainer: {
    paddingBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 99,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  filterChipText: {
    color: '#64748B',
    fontSize: font.sm,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  resultsCount: {
    color: '#64748B',
    fontSize: font.sm,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  companyIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    color: '#0F172A',
    fontSize: font.base,
    fontWeight: 'bold',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  companyType: {
    color: '#94A3B8',
    fontSize: font.small,
    marginLeft: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  statusText: {
    fontSize: font.caption,
    fontWeight: '700',
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 8,
  },
  detailTile: {
    width: '50%',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  detailLabel: {
    color: '#94A3B8',
    fontSize: font.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  detailValue: {
    color: '#374151',
    fontSize: font.small,
    fontWeight: '600',
  },
  intro: {
    color: '#64748B',
    fontSize: font.small,
    lineHeight: 19,
    marginBottom: 10,
  },
  actions: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  viewButtonText: {
    color: '#4338CA',
    fontSize: font.small,
    fontWeight: '600',
    marginHorizontal: 5,
  },
  actionRow: {
    flexDirection: 'row',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 3,
  },
  reviewButton: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  deliverButton: {
    backgroundColor: '#F5F3FF',
    borderColor: '#E9D5FF',
  },
  rejectButton: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  actionText: {
    fontSize: font.caption,
    fontWeight: '700',
    marginLeft: 4,
  },
  reviewActionText: {
    color: '#1D4ED8',
  },
  deliverActionText: {
    color: '#7C3AED',
  },
  rejectActionText: {
    color: '#991B1B',
  },
  completedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  completedText: {
    color: '#065F46',
    fontSize: font.small,
    fontWeight: '700',
    marginLeft: 5,
  },
  stateBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 16,
  },
  stateText: {
    color: '#64748B',
    fontSize: font.bodySmall,
    marginTop: 10,
    textAlign: 'center',
  },
  stateHint: {
    color: '#94A3B8',
    fontSize: font.small,
    marginTop: 4,
    textAlign: 'center',
  },
  errorText: {
    color: '#DC2626',
    fontSize: font.bodySmall,
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
    fontSize: font.sm,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalHeaderText: {
    flex: 1,
  },
  modalTitle: {
    color: '#0F172A',
    fontSize: font.lg,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  modalStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalStatusLabel: {
    color: '#64748B',
    fontSize: font.small,
    marginRight: 6,
  },
  modalClose: {
    width: 30,
    height: 30,
    borderRadius: 7,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  modalLabel: {
    color: '#374151',
    fontSize: font.small,
    fontWeight: '600',
    marginBottom: 6,
  },
  modalInput: {
    minHeight: 90,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#0F172A',
    fontSize: font.small,
  },
  modalHint: {
    color: '#94A3B8',
    fontSize: font.caption,
    marginTop: 4,
    marginBottom: 18,
  },
  modalActions: {
    flexDirection: 'row',
  },
  modalCancel: {
    flex: 1,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    marginRight: 6,
  },
  modalCancelText: {
    color: '#374151',
    fontSize: font.small,
    fontWeight: '600',
  },
  modalSubmit: {
    flex: 1,
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#4F46E5',
    marginLeft: 6,
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontSize: font.small,
    fontWeight: '700',
    marginLeft: 6,
  },
});

export default AdminCompanyRequestsScreen;
