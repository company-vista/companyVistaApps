import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { s } from '../../../theme/responsive';
import { useThemeColors, themePalette } from '../../../theme/colors';
import { font } from '../../../theme/typography';

const PasswordUpdatedScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const isDark = colors.mode === 'dark';
  const email = route.params?.email;
  const accountType = route.params?.accountType === 'admin' ? 'admin' : 'client';

  const handleContinue = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login', params: { accountType } }],
    });
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={styles.logoSection}>
          <Text style={[styles.logoText, { color: colors.text }]}>
            Company<Text style={{ color: isDark ? themePalette.hex_d4af37 : colors.primary }}>Vista</Text>
          </Text>
        </View>

        <View style={styles.heroSection}>
          <View style={[styles.outerCircle, { borderColor: isDark ? themePalette.hex_064e3b : themePalette.rgba_16_185_129_0_3, backgroundColor: isDark ? themePalette.rgba_6_78_59_0_1 : themePalette.rgba_16_185_129_0_08 }]}>
            <View style={[styles.innerCard, { borderColor: isDark ? themePalette.hex_059669 : themePalette.rgba_16_185_129_0_4, backgroundColor: isDark ? themePalette.hex_064e3b : themePalette.rgba_16_185_129_0_15 }]}>
              <Ionicons name="checkmark" size={40} color={colors.success} />
            </View>
          </View>
        </View>

        <View style={styles.textSection}>
          <Text style={[styles.title, { color: colors.text }]}>
            Password <Text style={[styles.italicTitle, { color: colors.success }]}>updated</Text>
          </Text>
          <Text style={[styles.description, { color: colors.muted }]}>
            Your password has been changed successfully. You can now log in with your new credentials.
          </Text>
        </View>

        <View style={styles.infoSection}>
          <View style={[styles.infoCard, { backgroundColor: isDark ? themePalette.hex_0b1120 : colors.surface, borderColor: colors.border }]}>
            <View style={[styles.badgeIconContainer, { backgroundColor: isDark ? themePalette.hex_0f172a : colors.inputBackground, borderColor: colors.border }]}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={[styles.infoTitle, { color: colors.text }]}>All devices signed out</Text>
              <Text style={[styles.infoSubtext, { color: colors.subtle }]}>For your security</Text>
            </View>
          </View>

          {email ? (
            <View style={[styles.infoCard, { backgroundColor: isDark ? themePalette.hex_0b1120 : colors.surface, borderColor: colors.border }]}>
              <View style={[styles.badgeIconContainer, { backgroundColor: isDark ? themePalette.hex_0f172a : colors.inputBackground, borderColor: colors.border }]}>
                <Ionicons name="mail-outline" size={18} color={colors.info} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={[styles.infoTitle, { color: colors.text }]}>Confirmation email sent</Text>
                <Text style={[styles.infoSubtext, { color: colors.subtle }]}>{email}</Text>
              </View>
            </View>
          ) : null}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={[styles.submitButton, !isDark && { backgroundColor: themePalette.hex_2563eb }]} activeOpacity={0.8} onPress={handleContinue}>
            <Text style={[styles.submitButtonText, !isDark && { color: themePalette.hex_ffffff }]}>Continue to Log In</Text>
            <Text style={[styles.arrowIcon, !isDark && { color: themePalette.hex_ffffff }]}>→</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: s(20), paddingBottom: 24 },
  logoSection: { alignItems: 'center', marginTop: 10, marginBottom: 12 },
  logoText: { fontSize: font.hero, fontWeight: '700' },
  heroSection: { alignItems: 'center', marginVertical: 8 },
  outerCircle: { width: 120, height: 120, borderRadius: 100, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  innerCard: { width: 80, height: 80, borderRadius: 60, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  textSection: { alignItems: 'center', marginVertical: 6, paddingHorizontal: s(4) },
  title: { fontSize: font.displayMedium, fontWeight: '400', textAlign: 'center' },
  italicTitle: { fontStyle: 'italic', fontWeight: '400' },
  description: { textAlign: 'center', marginTop: 4, fontSize: font.base, lineHeight: 22 },
  infoSection: { width: '100%', marginVertical: 6 },
  infoCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 8 },
  badgeIconContainer: { width: 38, height: 38, borderRadius: 10, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  infoTextContainer: { flex: 1 },
  infoTitle: { fontSize: font.base, fontWeight: '600' },
  infoSubtext: { fontSize: font.sm, marginTop: 2 },
  footer: { marginTop: 4 },
  submitButton: { backgroundColor: themePalette.hex_d4af37, width: '100%', height: 52, borderRadius: 24, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  submitButtonText: { color: themePalette.hex_070a12, fontSize: font.lg, fontWeight: '700' },
  arrowIcon: { color: themePalette.hex_070a12, fontSize: font.xl, fontWeight: 'bold' },
});

export default PasswordUpdatedScreen;
