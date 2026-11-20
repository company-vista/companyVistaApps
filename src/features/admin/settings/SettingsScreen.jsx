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
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { setThemeMode } from '../../../store/slices/themeSlice';
import { font } from '../../../theme/typography';
import { s } from '../../../theme/responsive';
import { useThemeColors, useResolvedThemeMode } from '../../../theme/colors';

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', icon: 'sun-o' },
  { value: 'dark', label: 'Dark', icon: 'moon-o' },
  { value: 'system', label: 'System', icon: 'laptop' },
];

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
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const themeMode = useAppSelector(state => state.theme.mode);
  const effectiveMode = useResolvedThemeMode();
  const isDark = effectiveMode === 'dark';
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const showComingSoon = () => {
    Alert.alert('Coming Soon', 'This feature will be available soon.');
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <View
        style={[
          styles.header,
          {
            paddingTop: Math.max(insets.top, s(12)),
            backgroundColor: colors.background,
          },
        ]}>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.headerButton}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: s(24) + insets.bottom },
        ]}>
        <View
          style={[
            styles.menuGroup,
            { borderBottomColor: colors.border },
          ]}>
          <View style={[styles.themeCard, { backgroundColor: colors.cardHighlight }]}>
            <Text style={[styles.menuTitle, { color: colors.text }]}>Theme</Text>
            <Text style={[styles.menuSubtitle, { color: colors.muted }]}>
              {themeMode === 'system'
                ? `Following system (${isDark ? 'Dark' : 'Light'})`
                : 'Choose how Company Vista looks'}
            </Text>
            <View style={styles.themeOptions}>
              {THEME_OPTIONS.map(option => {
                const active = themeMode === option.value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => dispatch(setThemeMode(option.value))}
                    accessibilityRole="button"
                    accessibilityLabel={`${option.label} theme`}
                    style={[
                      styles.themeOption,
                      {
                        borderColor: active ? colors.accent : colors.border,
                        backgroundColor: active
                          ? colors.accentSoft
                          : colors.surface,
                      },
                    ]}>
                    <FontAwesome
                      name={option.icon}
                      size={16}
                      color={active ? colors.accent : colors.muted}
                    />
                    <Text
                      style={[
                        styles.themeOptionLabel,
                        { color: active ? colors.accent : colors.muted },
                      ]}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View
            style={[
              styles.menuRow,
              styles.menuRowBorder,
              { borderTopColor: colors.border },
            ]}>
            <Ionicons
              name="notifications-outline"
              size={20}
              color={colors.text}
              style={styles.menuIcon}
            />
            <View style={styles.menuText}>
              <Text style={[styles.menuTitle, { color: colors.text }]}>
                Notifications
              </Text>
              <Text style={[styles.menuSubtitle, { color: colors.muted }]}>
                Turn notifications on or off
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.skeleton, true: colors.accent }}
              thumbColor={notificationsEnabled ? colors.buttonText : colors.surface}
              accessibilityLabel="Toggle notifications"
            />
          </View>
          {SETTINGS_ITEMS.map(item => (
            <Pressable
              key={item.key}
              onPress={showComingSoon}
              accessibilityRole="button"
              style={[
                styles.menuRow,
                styles.menuRowBorder,
                { borderTopColor: colors.border },
              ]}>
              <Ionicons
                name={item.icon}
                size={20}
                color={colors.text}
                style={styles.menuIcon}
              />
              <View style={styles.menuText}>
                <Text style={[styles.menuTitle, { color: colors.text }]}>
                  {item.title}
                </Text>
                <Text style={[styles.menuSubtitle, { color: colors.muted }]}>
                  {item.subtitle}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.subtle} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default AdminSettingsScreen;

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(18),
    paddingBottom: s(10),
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
  },
  scrollContent: { paddingHorizontal: s(18) },
  menuGroup: {
    paddingVertical: s(9),
    borderBottomWidth: 1,
  },
  themeCard: {
    borderRadius: 12,
    paddingHorizontal: s(14),
    paddingVertical: s(14),
    marginBottom: s(6),
  },
  themeOptions: {
    flexDirection: 'row',
    marginTop: s(12),
    gap: s(8),
  },
  themeOption: {
    flex: 1,
    minHeight: s(56),
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(6),
  },
  themeOptionLabel: {
    fontSize: font.bodySmall,
    fontWeight: '600',
  },
  menuRow: {
    minHeight: s(58),
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: s(6),
  },
  menuRowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  menuIcon: { width: s(28), marginRight: s(12) },
  menuText: { flex: 1 },
  menuTitle: { fontSize: font.sm, fontWeight: '500' },
  menuSubtitle: {
    fontSize: font.micro,
    marginTop: s(1),
  },
});
