import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import { BackButton } from '../../../components/buttons';
import type { NotificationItem } from '../data/notifications';
import { deleteNotification } from '../api/notificationsApi';
import { useAppSelector } from '../../../store/hooks';
import { useThemeColors } from '../../../theme/colors';
import { font } from '../../../theme/typography';

type NotificationDetailScreenProps = {
  notification: NotificationItem;
  onBackPress: () => void;
  onDeleteSuccess?: () => void;
};

function NotificationDetailScreen({
  notification,
  onBackPress,
  onDeleteSuccess,
}: NotificationDetailScreenProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const colors = useThemeColors();
  const token = useAppSelector(state => state.auth.token);
  const [isDropdownVisible, setIsDropdownVisible] = React.useState(false);

  async function handleDelete() {
    setIsDropdownVisible(false);
    await deleteNotification({
      token,
      notificationId: notification.id,
      companyId: notification.companyId || null,
    });
    onDeleteSuccess?.();
  }

  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: colors.background, paddingTop: safeAreaInsets.top + 12 },
      ]}>
      <View style={styles.header}>
        <BackButton onPress={onBackPress} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>Notification</Text>
        <View style={{ flex: 1 }} />
        <View style={styles.moreWrapper}>
          <Pressable style={styles.moreButton} onPress={() => setIsDropdownVisible(prev => !prev)}>
            <FontAwesome name="ellipsis-v" size={18} color={colors.muted} />
          </Pressable>
          {isDropdownVisible ? (
              <View style={[styles.dropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Pressable
                  onPress={handleDelete}
                  style={[styles.dropdownOption, { borderBottomColor: colors.border }]}>
                  <FontAwesome name="trash-o" size={14} color={colors.danger} />
                  <Text style={[styles.dropdownOptionText, { color: colors.danger }]}>Delete</Text>
                </Pressable>
              </View>
          ) : null}
        </View>
      </View>

      <View style={[styles.detailCard, { backgroundColor: colors.surface }]}>
        <View style={[styles.iconWrap, { backgroundColor: colors.surfaceAlt }]}>
          <FontAwesome name={notification.icon} size={24} color={colors.accent} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>
          {notification.title}
        </Text>
        <Text style={[styles.time, { color: colors.subtle }]}>
          {notification.time}
        </Text>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <Text style={[styles.message, { color: colors.muted }]}>
          {notification.message}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  moreButton: {
    padding: 8,
  },
  moreWrapper: {
    position: 'relative',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: 4,
    minWidth: 130,
    borderRadius: 10,
    borderWidth: 1,
    zIndex: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  dropdownOptionText: {
    fontSize: font.md,
    fontWeight: '500',
  },
  headerTitle: {
    color: '#111827',
    fontSize: font.hero,
    fontWeight: '400',
  },
  detailCard: {
    borderRadius: 18,
    backgroundColor: '#ffffff',
    marginTop: 24,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  iconWrap: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#ecfeff',
  },
  title: {
    color: '#111827',
    fontSize: font.heading,
    fontWeight: '400',
    lineHeight: 28,
    marginTop: 18,
  },
  time: {
    color: '#94a3b8',
    fontSize: font.md,
    fontWeight: '700',
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 18,
  },
  message: {
    color: '#64748b',
    fontSize: font.lg,
    fontWeight: '500',
    lineHeight: 22,
  },
});

export default NotificationDetailScreen;
