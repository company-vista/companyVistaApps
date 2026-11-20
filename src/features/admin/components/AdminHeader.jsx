import { font } from '../../../theme/typography';
import React, { useCallback, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { toggleTheme } from '../../../store/slices/themeSlice';
import { useThemeColors, useResolvedThemeMode } from '../../../theme/colors';
import { fetchAdminNotifications } from '../notifications/api/adminNotificationsApi';

const AdminHeader = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth);
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const effectiveMode = useResolvedThemeMode();
  const isDark = effectiveMode === 'dark';
  const [unreadCount, setUnreadCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const loadUnreadCount = async () => {
        if (!token) return;
        try {
          const notifications = await fetchAdminNotifications({ token });
          if (!active) return;
          setUnreadCount(
            notifications.filter(
              notification => !(notification.isRead ?? notification.read),
            ).length,
          );
        } catch (error) {
          if (active) setUnreadCount(0);
        }
      };
      loadUnreadCount();
      return () => {
        active = false;
      };
    }, [token]),
  );

  return (
    <View>
      <View
        style={[
          styles.statusBar,
          { height: insets.top, backgroundColor: colors.background },
        ]}
      />
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}>
        <View style={styles.userInfo}>
          <Image
            source={{
              uri: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
            }}
            style={styles.avatar}
          />
          <View>
            <Text style={[styles.userName, { color: colors.text }]}>
              {user?.name || 'shivam chauhan'}
            </Text>
            {/* <Text style={styles.userRole}>@ {user?.role || 'Admin'}</Text> */}
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => dispatch(toggleTheme())}
            accessibilityRole="button"
            accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
            <Ionicons
              name={isDark ? 'sunny' : 'moon'}
              size={22}
              color={colors.accent}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('AdminSearch')}
            accessibilityRole="button"
            accessibilityLabel="Search admin workspace">
            <Ionicons name="search-outline" size={22} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('AdminNotifications')}
            accessibilityRole="button"
            accessibilityLabel="Open notifications">
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
            {unreadCount > 0 ? (
              <View style={[styles.badge, { backgroundColor: colors.danger }]}>
                <Text style={[styles.badgeText, { color: colors.buttonText }]}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>
        {/* <TouchableOpacity style={styles.iconButton}>
          <Text style={styles.iconText}>☰</Text>
        </TouchableOpacity> */}
        </View>
      </View>
    </View>
  );
};

export default AdminHeader;

const styles = StyleSheet.create({
  statusBar: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  userName: {
    fontSize: font.base,
    fontWeight: '700',
  },
  userRole: {
    fontSize: font.small,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 6,
    marginLeft: 8,
    position: 'relative',
  },
  iconText: {
    fontSize: font.xxl,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 15,
    height: 15,
    paddingHorizontal: 3,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: font.tiny,
    fontWeight: '800',
  },
});
