import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { font } from '../../../theme/typography';
import { s } from '../../../theme/responsive';

const SETTINGS_ITEMS = [
  {
    key: 'password',
    title: 'Password',
    subtitle: 'Change your account password',
    icon: 'lock-closed-outline',
  },
  {
    key: 'help-support',
    title: 'Help & Support',
    subtitle: 'Get help or contact support',
    icon: 'help-circle-outline',
  },
  {
    key: 'terms-policies',
    title: 'Terms & Policies',
    subtitle: 'View terms and privacy policy',
    icon: 'document-text-outline',
  },
];

const AdminSettingsScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const showComingSoon = () => {
    Alert.alert('Coming Soon', 'This feature will be available soon.');
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={[styles.header, { paddingTop: Math.max(insets.top, s(12)) }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.headerButton}>
          <Ionicons name="arrow-back" size={22} color="#1F2937" />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: s(24) + insets.bottom },
        ]}>
        <View style={styles.menuGroup}>
          <View style={styles.menuRow}>
            <Ionicons
              name="notifications-outline"
              size={20}
              color="#1F2937"
              style={styles.menuIcon}
            />
            <View style={styles.menuText}>
              <Text style={styles.menuTitle}>Notifications</Text>
              <Text style={styles.menuSubtitle}>
                Turn notifications on or off
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
              thumbColor={notificationsEnabled ? '#2563EB' : '#F8FAFC'}
              accessibilityLabel="Toggle notifications"
            />
          </View>
          {SETTINGS_ITEMS.map((item, index) => (
            <Pressable
              key={item.key}
              onPress={showComingSoon}
              accessibilityRole="button"
              style={[styles.menuRow, index > 0 && styles.menuRowBorder]}>
              <Ionicons
                name={item.icon}
                size={20}
                color="#1F2937"
                style={styles.menuIcon}
              />
              <View style={styles.menuText}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#475569" />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default AdminSettingsScreen;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(18),
    paddingBottom: s(10),
    backgroundColor: '#FFFFFF',
  },
  headerButton: {
    width: s(40),
    height: s(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: font.lg,
    fontWeight: '700',
    color: '#0F172A',
  },
  scrollContent: { paddingHorizontal: s(18) },
  menuGroup: {
    paddingVertical: s(9),
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
  },
  menuRow: {
    minHeight: s(58),
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: s(6),
  },
  menuRowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
  },
  menuIcon: { width: s(28), marginRight: s(12) },
  menuText: { flex: 1 },
  menuTitle: { fontSize: font.sm, fontWeight: '500', color: '#111827' },
  menuSubtitle: {
    fontSize: font.micro,
    color: '#64748B',
    marginTop: s(1),
  },
});
