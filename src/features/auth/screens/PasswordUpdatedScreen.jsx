import { font } from '../../../theme/typography';
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
import { s } from '../../../theme/responsive';
import { themePalette, makeThemeStyles } from '../../../theme/colors';

const PasswordUpdatedScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const email = route.params?.email;
  const accountType = route.params?.accountType === 'admin' ? 'admin' : 'client';

  const handleContinue = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login', params: { accountType } }],
    });
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={themePalette.hex_070a12} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Top Logo */}
        <View style={styles.logoSection}>
          <Text style={styles.logoText}>
            Company<Text style={styles.logoAccent}>Vista</Text>
          </Text>
        </View>

        {/* Outer Circular/Rounded Container with Glowing Green Success Badge */}
        <View style={styles.heroSection}>
          <View style={styles.outerCircle}>
            <View style={styles.innerCard}>
              <View style={styles.checkIconContainer}>
                <Text style={styles.checkIcon}>✓</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Title & Description */}
        <View style={styles.textSection}>
          <Text style={styles.title}>
            Password <Text style={styles.italicTitle}>updated</Text>
          </Text>
          <Text style={styles.description}>
            Your password has been changed successfully. You can now log in with your new credentials.
          </Text>
        </View>

        {/* Info Cards */}
        <View style={styles.infoSection}>
          {/* Card 1: All devices signed out */}
          <View style={styles.infoCard}>
            <View style={styles.badgeIconContainer}>
              <Text style={styles.greenCheckIcon}>✓</Text>
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>All devices signed out</Text>
              <Text style={styles.infoSubtext}>For your security</Text>
            </View>
          </View>

          {email ? (
            <View style={styles.infoCard}>
              <View style={styles.badgeIconContainer}>
                <Text style={styles.mailIcon}>✉</Text>
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTitle}>Confirmation email sent</Text>
                <Text style={styles.infoSubtext}>{email}</Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* Action Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.submitButton} activeOpacity={0.8} onPress={handleContinue}>
            <Text style={styles.submitButtonText}>Continue to Log In</Text>
            <Text style={styles.arrowIcon}>→</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = makeThemeStyles(() => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themePalette.hex_070a12,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: s(20),
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 15,
  },
  logoText: {
    color: themePalette.hex_e2e8f0,
    fontSize: font.hero,
    fontWeight: '700',
  },
  logoAccent: {
    color: themePalette.hex_d4af37,
  },
  heroSection: {
    alignItems: 'center',
    // marginVertical: 0,
  },
  outerCircle: {
    width: 120,
    height: 120,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: themePalette.hex_064e3b,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: themePalette.rgba_6_78_59_0_1,
  },
  innerCard: {
    width: 80,
    height: 80,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: themePalette.hex_059669,
    backgroundColor: themePalette.hex_064e3b,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    color: themePalette.hex_10b981,
    fontSize: font.display3XL,
    fontWeight: '300',
  },
  textSection: {
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: s(4),
  },
  title: {
    color: themePalette.hex_ffffff,
    fontSize: font.displayMedium,
    fontWeight: '400',
    textAlign: 'center',
  },
  italicTitle: {
    fontStyle: 'italic',
    color: themePalette.hex_10b981,
    fontWeight: '400',
  },
  description: {
    color: themePalette.hex_94a3b8,
    textAlign: 'center',
    marginTop: 6,
    fontSize: font.base,
    lineHeight: 20,
  },
  infoSection: {
    width: '100%',
    marginVertical: 10,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themePalette.hex_0b1120,
    borderWidth: 1,
    borderColor: themePalette.hex_1e293b,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  badgeIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: themePalette.hex_0f172a,
    borderWidth: 1,
    borderColor: themePalette.hex_1e293b,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  greenCheckIcon: {
    color: themePalette.hex_10b981,
    fontSize: font.lg,
    fontWeight: 'bold',
  },
  mailIcon: {
    color: themePalette.hex_38bdf8,
    fontSize: font.lg,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    color: themePalette.hex_e2e8f0,
    fontSize: font.base,
    fontWeight: '600',
  },
  infoSubtext: {
    color: themePalette.hex_64748b,
    fontSize: font.sm,
    marginTop: 2,
  },
  footer: {
    marginTop: 20,
  },
  submitButton: {
    backgroundColor: themePalette.hex_d4af37,
    width: '100%',
    height: 52,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: themePalette.hex_070a12,
    fontSize: font.lg,
    fontWeight: '700',
    marginRight: 8,
  },
  arrowIcon: {
    color: themePalette.hex_070a12,
    fontSize: font.xxl,
    fontWeight: 'bold',
  },
}));

export default PasswordUpdatedScreen;
