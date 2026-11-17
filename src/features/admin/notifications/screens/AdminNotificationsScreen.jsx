import { font } from '../../../../theme/typography';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../../../../store/hooks';
import {
  deleteAdminNotification,
  fetchAdminNotifications,
  markAdminNotificationAsRead,
  markAllAdminNotificationsAsRead,
} from '../api/adminNotificationsApi';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'read', label: 'Read' },
];

const TYPE_STYLES = {
  INVOICE: { icon: 'document-text-outline', color: '#1D4ED8', backgroundColor: '#DBEAFE' },
  PAYMENT: { icon: 'cash-outline', color: '#15803D', backgroundColor: '#DCFCE7' },
  DOCUMENT: { icon: 'folder-open-outline', color: '#7C3AED', backgroundColor: '#EDE9FE' },
  CLIENT: { icon: 'people-outline', color: '#B45309', backgroundColor: '#FEF3C7' },
  CHANGE_REQUEST: { icon: 'swap-horizontal-outline', color: '#0E7490', backgroundColor: '#CFFAFE' },
  REMINDER: { icon: 'alarm-outline', color: '#B91C1C', backgroundColor: '#FEE2E2' },
  DEFAULT: { icon: 'notifications-outline', color: '#475569', backgroundColor: '#F1F5F9' },
};

const normalizeType = value =>
  String(value || '')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, character => character.toUpperCase());

const isNotificationRead = notification =>
  Boolean(notification?.isRead ?? notification?.read);

const getTypeStyle = notification =>
  TYPE_STYLES[String(notification?.type || '').toUpperCase()] || TYPE_STYLES.DEFAULT;

const getTimeAgo = value => {
  if (!value) return 'Just now';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Just now';
  const diffInSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return 'Just now';
  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const getNotificationTarget = notification => {
  if (!notification) return null;
  const type = String(notification.type || '').toUpperCase();
  const meta = notification.meta || {};
  const relatedId = notification.relatedId || meta.relatedId;
  const companyId =
    meta.companyId ||
    notification.companyId?._id ||
    notification.companyId ||
    null;

  if (type === 'INVOICE' && relatedId) {
    return { screen: 'AdminInvoices' };
  }

  if (type === 'PAYMENT') {
    if (meta.transactionId || relatedId) {
      return { screen: 'AdminTransactions' };
    }
    if (companyId) {
      return { screen: 'AdminCompanyDetails', params: { companyId } };
    }
  }

  if (type === 'DOCUMENT' && (meta.documentId || relatedId)) {
    return { screen: 'AdminDocuments' };
  }

  if (type === 'CLIENT' || type === 'CHANGE_REQUEST') {
    if (companyId) {
      return { screen: 'AdminCompanyDetails', params: { companyId } };
    }
  }

  if (type === 'REMINDER') {
    return { screen: 'AdminCompany' };
  }

  if (companyId) {
    return { screen: 'AdminCompanyDetails', params: { companyId } };
  }

  return null;
};

const AdminNotificationsScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const token = useAppSelector(state => state.auth.token);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [error, setError] = useState('');
  const [selectedNotification, setSelectedNotification] = useState(null);

  const loadNotifications = useCallback(
    async ({ refresh = false } = {}) => {
      if (refresh) setRefreshing(true);
      else setLoading(true);
      setError('');
      try {
        const data = await fetchAdminNotifications({ token });
        setNotifications(data);
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
      loadNotifications();
    }, [loadNotifications]),
  );

  const unreadCount = useMemo(
    () => notifications.filter(item => !isNotificationRead(item)).length,
    [notifications],
  );

  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter(item => !isNotificationRead(item));
    }
    if (filter === 'read') {
      return notifications.filter(item => isNotificationRead(item));
    }
    return notifications;
  }, [filter, notifications]);

  const markAsRead = async notification => {
    if (!notification?._id || isNotificationRead(notification)) return;
    try {
      setActionLoading(true);
      await markAdminNotificationAsRead({ token, id: notification._id });
      setNotifications(previous =>
        previous.map(item =>
          item._id === notification._id ? { ...item, isRead: true } : item,
        ),
      );
      setSelectedNotification(previous =>
        previous && previous._id === notification._id
          ? { ...previous, isRead: true }
          : previous,
      );
    } catch (markError) {
      Alert.alert('Unable to mark as read', markError.message);
    } finally {
      setActionLoading(false);
    }
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      setActionLoading(true);
      await markAllAdminNotificationsAsRead({ token });
      setNotifications(previous =>
        previous.map(item => ({ ...item, isRead: true })),
      );
      setSelectedNotification(previous =>
        previous ? { ...previous, isRead: true } : previous,
      );
    } catch (markError) {
      Alert.alert('Unable to mark all as read', markError.message);
    } finally {
      setActionLoading(false);
    }
  };

  const openNotification = notification => {
    setSelectedNotification(notification);
    if (!isNotificationRead(notification)) {
      markAsRead(notification);
    }
  };

  const confirmDelete = notification => {
    Alert.alert(
      'Delete notification?',
      notification.title || 'This notification will be removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(notification._id);
            try {
              await deleteAdminNotification({ token, id: notification._id });
              setNotifications(previous =>
                previous.filter(item => item._id !== notification._id),
              );
              setSelectedNotification(previous =>
                previous && previous._id === notification._id ? null : previous,
              );
            } catch (deleteError) {
              Alert.alert('Unable to delete notification', deleteError.message);
            } finally {
              setDeletingId('');
            }
          },
        },
      ],
    );
  };

  const openRelated = notification => {
    const target = getNotificationTarget(notification);
    if (!target) return;
    setSelectedNotification(null);
    navigation.navigate(target.screen, target.params);
  };

  const renderNotification = ({ item }) => {
    const isRead = isNotificationRead(item);
    const typeStyle = getTypeStyle(item);
    return (
      <TouchableOpacity
        style={[styles.notificationCard, !isRead && styles.unreadCard]}
        activeOpacity={0.85}
        onPress={() => openNotification(item)}>
        {!isRead ? <View style={styles.unreadBar} /> : null}
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.typeIcon,
              { backgroundColor: typeStyle.backgroundColor },
            ]}>
            <Ionicons name={typeStyle.icon} size={18} color={typeStyle.color} />
          </View>
          <View style={styles.cardTitleBlock}>
            <View style={styles.titleRow}>
              <Text style={styles.notificationTitle} numberOfLines={1}>
                {item.title || 'Notification'}
              </Text>
              {!isRead ? (
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>New</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.notificationTime}>
              {getTimeAgo(item.createdAt || item.created_at)}
              {item.type ? ` · ${normalizeType(item.type)}` : ''}
            </Text>
          </View>
        </View>

        <Text style={styles.notificationMessage} numberOfLines={3}>
          {item.message || item.body || 'No message content'}
        </Text>

        <View style={styles.actionsRow}>
          {!isRead ? (
            <TouchableOpacity
              style={styles.readButton}
              onPress={() => markAsRead(item)}
              disabled={actionLoading}
              accessibilityRole="button"
              accessibilityLabel="Mark as read">
              <Ionicons name="checkmark-done-outline" size={16} color="#1D4ED8" />
              <Text style={styles.readButtonText}>Mark read</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.readState}>
              <Ionicons name="checkmark-circle" size={15} color="#94A3B8" />
              <Text style={styles.readStateText}>Read</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => confirmDelete(item)}
            disabled={deletingId === item._id}
            accessibilityRole="button"
            accessibilityLabel="Delete notification">
            {deletingId === item._id ? (
              <ActivityIndicator size="small" color="#DC2626" />
            ) : (
              <>
                <Ionicons name="trash-outline" size={15} color="#DC2626" />
                <Text style={styles.deleteButtonText}>Delete</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const relatedTarget = selectedNotification
    ? getNotificationTarget(selectedNotification)
    : null;
  const selectedTypeStyle = selectedNotification
    ? getTypeStyle(selectedNotification)
    : TYPE_STYLES.DEFAULT;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) + 8 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={21} color="#1E293B" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSubtitle}>
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : "You're all caught up"}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.markAllButton,
            (actionLoading || unreadCount === 0) && styles.disabledButton,
          ]}
          onPress={markAllAsRead}
          disabled={actionLoading || unreadCount === 0}
          accessibilityRole="button"
          accessibilityLabel="Mark all as read">
          {actionLoading ? (
            <ActivityIndicator size="small" color="#2563EB" />
          ) : (
            <Ionicons name="checkmark-done" size={20} color="#2563EB" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.tabsRow}>
        {FILTERS.map(tab => {
          const count =
            tab.key === 'unread'
              ? unreadCount
              : tab.key === 'read'
                ? notifications.length - unreadCount
                : notifications.length;
          const active = filter === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => setFilter(tab.key)}>
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {tab.label}
              </Text>
              <View style={[styles.tabCount, active && styles.tabCountActive]}>
                <Text
                  style={[
                    styles.tabCountText,
                    active && styles.tabCountTextActive,
                  ]}>
                  {count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => loadNotifications()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {loading && notifications.length === 0 ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.stateText}>Loading notifications...</Text>
        </View>
      ) : (
        <FlatList
          style={styles.list}
          data={filteredNotifications}
          keyExtractor={(item, index) => String(item._id || index)}
          renderItem={renderNotification}
          contentContainerStyle={[
            styles.listContent,
            filteredNotifications.length === 0 && styles.emptyContent,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadNotifications({ refresh: true })}
              tintColor="#2563EB"
              colors={['#2563EB']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="notifications-off-outline" size={28} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>No notifications</Text>
              <Text style={styles.emptyMessage}>
                {filter === 'all'
                  ? "You don't have any notifications yet."
                  : `You don't have any ${filter} notifications.`}
              </Text>
            </View>
          }
        />
      )}

      <Modal
        visible={Boolean(selectedNotification)}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedNotification(null)}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              { paddingBottom: 16 + insets.bottom },
            ]}>
            <View style={styles.modalHeader}>
              <View
                style={[
                  styles.modalTypeIcon,
                  { backgroundColor: selectedTypeStyle.backgroundColor },
                ]}>
                <Ionicons
                  name={selectedTypeStyle.icon}
                  size={20}
                  color={selectedTypeStyle.color}
                />
              </View>
              <View style={styles.modalHeaderText}>
                <Text style={styles.modalTitle} numberOfLines={2}>
                  {selectedNotification?.title || 'Notification'}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {normalizeType(selectedNotification?.type) || 'General'}
                  {' · '}
                  {getTimeAgo(
                    selectedNotification?.createdAt ||
                      selectedNotification?.created_at,
                  )}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedNotification(null)}
                accessibilityRole="button"
                accessibilityLabel="Close notification">
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalDivider} />

            <Text style={styles.modalMessage}>
              {selectedNotification?.message ||
                selectedNotification?.body ||
                'No message content'}
            </Text>

            {relatedTarget ? (
              <TouchableOpacity
                style={styles.relatedButton}
                onPress={() => openRelated(selectedNotification)}>
                <Ionicons name="open-outline" size={17} color="#FFFFFF" />
                <Text style={styles.relatedButtonText}>View related</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedNotification(null)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AdminNotificationsScreen;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    marginRight: 10,
  },
  headerText: { flex: 1 },
  headerTitle: { color: '#0F172A', fontSize: font.xl, fontWeight: '800' },
  headerSubtitle: { color: '#64748B', fontSize: font.xs, marginTop: 3 },
  markAllButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: { opacity: 0.5 },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  tabActive: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  tabText: { color: '#64748B', fontSize: font.xm, fontWeight: '700' },
  tabTextActive: { color: '#1D4ED8' },
  tabCount: {
    minWidth: 20,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  tabCountActive: { backgroundColor: '#DBEAFE' },
  tabCountText: { color: '#64748B', fontSize: font.xm, fontWeight: '800' },
  tabCountTextActive: { color: '#1D4ED8' },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 20 },
  emptyContent: { flexGrow: 1 },
  notificationCard: {
    position: 'relative',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 13,
    marginBottom: 10,
    overflow: 'hidden',
  },
  unreadCard: { borderColor: '#BFDBFE', backgroundColor: '#F8FBFF' },
  unreadBar: {
    position: 'absolute',
    left: 0,
    top: 16,
    bottom: 16,
    width: 3,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
    backgroundColor: '#3B82F6',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  typeIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitleBlock: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  notificationTitle: { flexShrink: 1, color: '#0F172A', fontSize: font.md, fontWeight: '500' },
  newBadge: {
    backgroundColor: '#DBEAFE',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  newBadgeText: { color: '#1D4ED8', fontSize: font.micro, fontWeight: '800' },
  notificationTime: { color: '#94A3B8', fontSize: font.caption, marginTop: 3 },
  notificationMessage: {
    color: '#475569',
    fontSize: font.xs,
    lineHeight: 15,
    marginTop: 9,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 11,
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  readButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },
  readButtonText: { color: '#1D4ED8', fontSize: font.caption, fontWeight: '700' },
  readState: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  readStateText: { color: '#94A3B8', fontSize: font.caption, fontWeight: '700' },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 62,
    justifyContent: 'center',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
  },
  deleteButtonText: { color: '#DC2626', fontSize: font.caption, fontWeight: '700' },
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  stateText: { color: '#64748B', fontSize: font.sm, marginTop: 10 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 28 },
  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },
  emptyTitle: { color: '#1E293B', fontSize: font.md, fontWeight: '700' },
  emptyMessage: { color: '#64748B', fontSize: font.small, textAlign: 'center', marginTop: 6 },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 7,
    padding: 10,
    backgroundColor: '#FEF2F2',
    borderRadius: 9,
  },
  errorText: { color: '#B91C1C', fontSize: font.xs, flex: 1, marginRight: 8 },
  retryText: { color: '#B91C1C', fontSize: font.xs, fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  modalTypeIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeaderText: { flex: 1, minWidth: 0 },
  modalTitle: { color: '#0F172A', fontSize: font.base, fontWeight: '800' },
  modalSubtitle: { color: '#64748B', fontSize: font.caption, marginTop: 3 },
  modalDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 13 },
  modalMessage: { color: '#334155', fontSize: font.sm, lineHeight: 19 },
  relatedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 46,
    borderRadius: 11,
    backgroundColor: '#2563EB',
    marginTop: 18,
  },
  relatedButtonText: { color: '#FFFFFF', fontSize: font.sm, fontWeight: '800' },
  closeButton: { padding: 12, alignItems: 'center' },
  closeButtonText: { color: '#64748B', fontSize: font.small, fontWeight: '700' },
});
