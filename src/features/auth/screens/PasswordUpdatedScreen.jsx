import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PasswordUpdatedScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const email = route.params?.email || 'rajesh@meridianglobal.com';

  const handleContinue = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#070A12" />

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

          {/* Card 2: Confirmation email sent */}
          <View style={styles.infoCard}>
            <View style={styles.badgeIconContainer}>
              <Text style={styles.mailIcon}>✉</Text>
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Confirmation email sent</Text>
              <Text style={styles.infoSubtext}>{email}</Text>
            </View>
          </View>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070A12',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 15,
  },
  logoText: {
    color: '#E2E8F0',
    fontSize: 20,
    fontWeight: '700',
  },
  logoAccent: {
    color: '#D4AF37',
  },
  heroSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  outerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#064E3B',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 78, 59, 0.1)',
  },
  innerCard: {
    width: 140,
    height: 140,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: '#059669',
    backgroundColor: '#064E3B',
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
    color: '#10B981',
    fontSize: 44,
    fontWeight: '300',
  },
  textSection: {
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '600',
    textAlign: 'center',
  },
  italicTitle: {
    fontStyle: 'italic',
    color: '#10B981',
    fontWeight: '400',
  },
  description: {
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  infoSection: {
    width: '100%',
    marginVertical: 15,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B1120',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  badgeIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  greenCheckIcon: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mailIcon: {
    color: '#38BDF8',
    fontSize: 16,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '600',
  },
  infoSubtext: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
  footer: {
    marginTop: 20,
  },
  submitButton: {
    backgroundColor: '#D4AF37',
    width: '100%',
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#070A12',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  arrowIcon: {
    color: '#070A12',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PasswordUpdatedScreen;
