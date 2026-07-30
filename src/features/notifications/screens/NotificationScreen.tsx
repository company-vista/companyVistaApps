import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import type { RouteProp } from '@react-navigation/native';
import { BackButton } from '../../../components/buttons';
import type { MainScreenProps, MainStackParamList } from '../../../navigation/types';
import NotificationPageSkeleton from '../../../notification/NotificationPageSkeleton';
import { useAppSelector } from '../../../store/hooks';
import { useThemeColors } from '../../../theme/colors';
import { font } from '../../../theme/typography';
import { deleteNotification, fetchNotifications, markNotificationAsRead } from '../api/notificationsApi';
import { notifications, type NotificationItem } from '../data/notifications';

const notificationFilters = ['All', 'Unread', 'Read'] as const;

type NotificationFilter = (typeof notificationFilters)[number];

function getBadgeCount(count: number) {
  return count > 9 ? '9+' : String(count);
}

type Nav = MainScreenProps<'Notifications'>['navigation'];
type Route = RouteProp<MainStackParamList, 'Notifications'>;

function NotificationScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const companyId = route.params?.companyId;
  const safeAreaInsets = useSafeAreaInsets();
  const colors = useThemeColors();
  const token = useAppSelector(state => state.auth.token);
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('All');
  const [notificationList, setNotificationList] = useState<NotificationItem[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const hasNotifications = notificationList.length > 0;
  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'Unread') {
      return notificationList.filter(item => !item.isRead);
    }

    if (activeFilter === 'Read') {
      return notificationList.filter(item => item.isRead);
    }

    return notificationList;
  }, [activeFilter, notificationList]);
  const notificationFilterCounts = useMemo(
    () => ({
      All: notificationList.length,
      Read: notificationList.filter(item => item.isRead).length,
      Unread: notificationList.filter(item => !item.isRead).length,
    }),
    [notificationList],
  );

  useEffect(() => {
    let isMounted = true;

    setIsLoadingNotifications(true);

    fetchNotifications({ token: token ?? undefined }).then(result => {
      if (isMounted) {
        const allNotifications = result.isSuccess ? result.notifications : notifications;
        const filtered = companyId
          ? allNotifications.filter(n => n.companyId === companyId)
          : allNotifications;
        setNotificationList(filtered);
      }
    }).catch(() => {
      if (isMounted) {
        const filtered = companyId
          ? notifications.filter(n => n.companyId === companyId)
          : notifications;
        setNotificationList(filtered);
      }
    }).finally(() => {
      if (isMounted) {
        setIsLoadingNotifications(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [companyId]);

  return (
    <>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: safeAreaInsets.bottom + 24 },
        ]}
        style={[
          styles.screen,
          { paddingTop: safeAreaInsets.top + 12 },
        ]}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <BackButton onPress={() => navigation.goBack()} />
            <Text style={[styles.title, { color: colors.text }]}>Notifications</Text>
          </View>
          {hasNotifications ? (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{getBadgeCount(notificationList.length)}</Text>
            </View>
          ) : null}
        </View>

        {isLoadingNotifications ? (
          <NotificationPageSkeleton />
        ) : hasNotifications ? (
          <>
            <View style={styles.filterRow}>
              {notificationFilters.map(filter => {
                const isActive = activeFilter === filter;

                return (
                  <Pressable
                    key={filter}
                    onPress={() => setActiveFilter(filter)}
                    style={[
                      styles.filterButton,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                      isActive ? { borderColor: colors.accent } : null,
                    ]}>
                    <Text
                      style={[
                        styles.filterButtonText,
                        { color: colors.text },
                        isActive ? [styles.activeFilterButtonText, { color: colors.accent }] : null,
                      ]}>
                      {filter} ({notificationFilterCounts[filter]})
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {filteredNotifications.length > 0 ? (
              <View style={[styles.listCard, ]}>
                {filteredNotifications.map(item => (
                  <Pressable
                    key={item.id}
                    onPress={() => {
                      if (!item.isRead) {
                        setNotificationList(prev =>
                          prev.map(notification =>
                            notification.id === item.id
                              ? { ...notification, isRead: true }
                              : notification,
                          ),
                        );
                        markNotificationAsRead({ token, notificationId: item.id });
                      }
                      navigation.navigate('NotificationDetail', { notification: item });
                    }}
                    onLongPress={() => {
                      setSelectedNotification(item);
                      setIsDeleteModalVisible(true);
                    }}
                    delayLongPress={500}
                    style={[styles.notificationRow, { borderBottomColor: colors.border }]}>
                    <View
                      style={[
                        styles.notificationIcon,
                        { backgroundColor: colors.surfaceAlt },
                      ]}>
                      <FontAwesome name={item.icon} size={18} color={colors.accent} />
                    </View>
                    <View style={styles.notificationCopy}>
                      <View style={styles.notificationTitleRow}>
                        <Text style={[styles.notificationTitle, { color: item.isRead ? colors.text : colors.danger }]}>
                          {item.title}
                        </Text>
                        {!item.isRead ? <View style={styles.unreadDot} /> : null}
                      </View>
                      <Text style={[styles.notificationMessage, { color: colors.muted }]}>
                        {item.message}
                      </Text>
                      <Text style={[styles.notificationTime, { color: colors.subtle }]}>
                        {item.time}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            ) : (
              <View style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
                <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceAlt }]}>
                  <FontAwesome name="bell-o" size={30} color={colors.accent} />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  No {activeFilter.toLowerCase()} notifications
                </Text>
                <Text style={[styles.emptyText, { color: colors.muted }]}>
                  Matching notifications will appear here.
                </Text>
              </View>
            )}
          </>
        ) : (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceAlt }]}>
              <FontAwesome name="bell-o" size={30} color={colors.accent} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No notifications</Text>
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              You are all caught up. New updates will appear here.
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal
        animationType="fade"
        transparent
        visible={isDeleteModalVisible}
        onRequestClose={() => setIsDeleteModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <View style={styles.iconCircleOuter}>
              <View style={styles.iconCircleInner}>
                <FontAwesome name="trash" size={24} color="#ffffff" />
              </View>
            </View>

            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Are you sure you want to delete ?
            </Text>

            <Text style={[styles.modalSubtitle, { color: colors.muted }]}>
              Deleting this will result to permanent removal. You can archive instead
            </Text>


              {/* ---- delete popup model---- */}
            <View style={styles.modalActions}>
              <Pressable
                onPress={async () => {
                  if (selectedNotification) {
                    await deleteNotification({
                      token,
                      notificationId: selectedNotification.id,
                      companyId,
                    });
                    setNotificationList(prev =>
                      prev.filter(n => n.id !== selectedNotification.id),
                    );
                  }
                  setIsDeleteModalVisible(false);
                  setSelectedNotification(null);
                }}
                style={styles.deleteButton}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setIsDeleteModalVisible(false);
                  setSelectedNotification(null);
                }}
                style={[styles.cancelButton, { borderColor: colors.accent }]}>
                <Text style={[styles.cancelButtonText, { color: colors.accent }]}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    color: '#111827',
    fontSize: font.hero,
    fontWeight: '400',
  },
  countBadge: {
    minWidth: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    backgroundColor: '#ef4444',
  },
  countText: {
    color: '#ffffff',
    fontSize: font.lg,
    fontWeight: '500',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 24,
  },
  filterButton: {
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 28,
    paddingVertical: 12
  },
  activeFilterButton: {
  },
  filterButtonText: {
    fontSize: font.md,
    fontWeight: '500',
   
  },
  activeFilterButtonText: {
  },
  listCard: {
    borderRadius: 18,
    // backgroundColor: '#ffffff',
    marginTop: 16,
    paddingHorizontal: 4,
  },
  emptyCard: {
    alignItems: 'center',
    borderRadius: 18,
    // backgroundColor: '#ffffff',
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  emptyIcon: {
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 35,
    backgroundColor: '#ecfeff',
  },
  emptyTitle: {
    color: '#111827',
    fontSize: font.hero,
    fontWeight: '900',
    marginTop: 18,
  },
  emptyText: {
    color: '#64748b',
    fontSize: font.lg,
    fontWeight: '700',
    lineHeight: 20,
    marginTop: 8,
    textAlign: 'center',
  },
  notificationRow: {
    flexDirection: 'row',
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 16,
  },
  notificationIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: '#ecfeff',
  },
  notificationCopy: {
    flex: 1,
  },
  notificationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationTitle: {
    color: '#111827',
    fontSize: font.xl,
    fontWeight: '400',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  notificationMessage: {
    color: '#64748b',
    fontSize: font.base,
    fontWeight: '400',
    lineHeight: 19,
    marginTop: 4,
  },
  notificationTime: {
    color: '#94a3b8',
    fontSize: font.base,
    fontWeight: '700',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.42)',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    borderRadius: 28,
    padding: 20,
    alignItems: 'center',
  },
  iconCircleOuter: {
    width: 62,
    height: 62,
    borderRadius: 36,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircleInner: {
    width: 44,
    height: 44,
    borderRadius: 24,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: font.lg,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: font.base,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  modalActions: {
    width: '100%',
    gap: 11,
  },
  deleteButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: font.xl,
    fontWeight: 'bold',
  },
  cancelButton: {
    width: '100%',
    height: 46,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: font.xxl,
    fontWeight: 'bold',
  },
});

export default NotificationScreen;
