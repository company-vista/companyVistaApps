import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Image, Animated, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FastImage from 'react-native-fast-image';
import logoR from '../../../assets/images/logoR.png';
import globeLogo from '../../../assets/images/companyvista_globe_320.gif';
import globeLogoLight from '../../../assets/images/company-vista-icon-gold-512.png';
import { s } from '../../../theme/responsive';
import { useThemeColors } from '../../../theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SLIDES_DATA = [
  {
    id: 1,
    eyebrow: 'Company Registration',
    title: 'Register your company in',
    titleItalic: ' any country,',
    body: 'No travel. No local lawyers. Start your global business from anywhere — in days, not months.',
    artGradient: ['#122548', '#0a1428', '#060b16'],
    artGradientLight: ['#E0F2FE', '#F0F9FF', '#FFFFFF'],
    icon: null,
    showStepper: true,
    showBadges: true,
  },
  {
    id: 2,
    eyebrow: 'MULTI-CURRENCY',
    title: 'Hold & Exchange ',
    titleItalic: '40+ Currencies',
    body: 'Convert currencies instantly with low exchange markup and manage local bank accounts worldwide.',
    artGradient: ['#0e1728', '#0a1020', '#060a14'],
    artGradientLight: ['#E6FFFA', '#F0FDFA', '#FFFFFF'],
    icon: '🌍',
    showStepper: false,
  },
  {
    id: 3,
    eyebrow: 'SMART SECURITY',
    title: 'Bank-Grade Protection for ',
    titleItalic: 'Your Wealth',
    body: 'Multi-factor authentication, biometric logins, and instant card locking keep your assets secure.',
    artGradient: ['#151126', '#0d0a18', '#07050e'],
    artGradientLight: ['#F3E8FF', '#FAF5FF', '#FFFFFF'],
    icon: '🛡️',
    showStepper: false,
  },
];

const OnboardingSlide = ({ navigation }) => {
  const colors = useThemeColors();
  const isDark = colors.mode === 'dark';
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: 6,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -6,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleNext = () => {
    navigation.navigate('BusinessServices');
  };

  const slide = SLIDES_DATA[currentIndex];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} transparent backgroundColor="transparent" />

      <Image source={logoR} style={styles.topLogo} />
      <Animated.View style={[styles.remoteButton, { transform: [{ translateY: slideAnim }] }]}>
        <Text style={styles.remoteButtonText}>100% Remote</Text>
      </Animated.View>

      <LinearGradient colors={isDark ? slide.artGradient : slide.artGradientLight} style={styles.artSection}>
        <View style={[styles.globeContainer, !isDark && styles.globeContainerLight]}>
          <FastImage source={isDark ? globeLogo : globeLogoLight} style={styles.globeImage} resizeMode={FastImage.resizeMode.contain} />
        </View>
        {slide.showBadges && (
          <View style={styles.badgesRow}>
            <View style={[styles.badgeLeft, !isDark && styles.badgeLeftLight]}>
              <Text style={styles.badgeLive}>LIVE</Text>
              <Text style={[styles.badgeLeftSub, !isDark && styles.badgeSubLight]}>AE New LLC · 2m ago</Text>
            </View>
            <Animated.View style={[styles.badgeRight, !isDark && styles.badgeRightLight, { transform: [{ translateY: slideAnim }] }]}>
              <Text style={styles.badgeAvailable}>AVAILABLE IN</Text>
              <Text style={styles.badgeNumber}>50+</Text>
              <Text style={[styles.badgeCountries, !isDark && styles.badgeSubLight]}>countries worldwide</Text>
            </Animated.View>
          </View>
        )}
      </LinearGradient>

      <LinearGradient
        colors={isDark ? ['#0a0f1e', '#070b16'] : ['#FFFFFF', '#F3F4F6']}
        style={[styles.contentSection, { paddingBottom: s(4) + insets.bottom }]}
      >
        <View style={styles.goldLine} />

        <ScrollView
          style={styles.scrollBody}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.eyebrowContainer}>
            <View style={styles.eyebrowDash} />
            <Text style={styles.eyebrowText}>{slide.eyebrow}</Text>
          </View>

          <Text style={[styles.title, { color: colors.text }]}>
            {slide.title}
            <Text style={styles.titleItalic}>{slide.titleItalic}</Text>
          </Text>

          <Text style={[styles.body, { color: colors.muted }]}>{slide.body}</Text>

          {slide.showStepper && (
            <View style={styles.stepperContainer}>
              <View style={styles.stepperRow}>
                <View style={styles.stepperStep}>
                  <View style={[styles.stepperCircle, { borderColor: '#c9a84c', backgroundColor: isDark ? 'rgba(11, 17, 32, 0.85)' : colors.surface }]}>
                    <Text style={[styles.stepperNumber, { color: '#c9a84c' }]}>1</Text>
                  </View>
                  <Text style={[styles.stepperLabel, { color: colors.muted }]}>Choose</Text>
                </View>
                <View style={[styles.stepperLine, { backgroundColor: colors.border }]} />
                <View style={styles.stepperStep}>
                  <View style={[styles.stepperCircle, { borderColor: '#3b82f6', backgroundColor: isDark ? 'rgba(11, 17, 32, 0.85)' : colors.surface }]}>
                    <Text style={[styles.stepperNumber, { color: '#3b82f6' }]}>2</Text>
                  </View>
                  <Text style={[styles.stepperLabel, { color: colors.muted }]}>Submit</Text>
                </View>
                <View style={[styles.stepperLine, { backgroundColor: colors.border }]} />
                <View style={styles.stepperStep}>
                  <View style={[styles.stepperCircle, { borderColor: '#14b8a6', backgroundColor: isDark ? 'rgba(11, 17, 32, 0.85)' : colors.surface }]}>
                    <Text style={[styles.stepperNumber, { color: '#14b8a6' }]}>3</Text>
                  </View>
                  <Text style={[styles.stepperLabel, { color: colors.muted }]}>Incorporated</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.dotsContainer}>
          {SLIDES_DATA.map((_, idx) => (
            <View
              key={idx}
              style={[styles.dot, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : colors.border }, idx === currentIndex ? styles.activeDot : null]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.8}>
          <LinearGradient
            colors={[colors.buttonBackground, colors.buttonBackground, colors.buttonBackground]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientButton}
          >
            <Text style={[styles.nextButtonText, { color: colors.buttonText }]}>
              {currentIndex === SLIDES_DATA.length - 1 ? 'Get Started' : 'Continue →'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={() => navigation.navigate('BusinessServices')}>
          <Text style={[styles.skipText, { color: colors.subtle }]}>Skip introduction</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  topLogo: { position: 'absolute', top: 50, left: 12, width: 180, height: 38, resizeMode: 'contain', zIndex: 10 },
  remoteButton: { position: 'absolute', top: 98, left: 20, backgroundColor: 'rgba(201, 168, 76, 0.15)', borderWidth: 1, borderColor: 'rgba(201, 168, 76, 0.3)', borderRadius: 20, paddingHorizontal: s(14), paddingVertical: s(6), zIndex: 10 },
  remoteButtonText: { fontSize: 12, fontWeight: '600', color: '#c9a84c', letterSpacing: 0.5 },
  artSection: { height: '50%', alignItems: 'center', justifyContent: 'center' },
  artBadge: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: 'rgba(11, 17, 32, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  artIcon: { fontSize: 54 },
  globeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  globeContainerLight: {
    backgroundColor: 'rgba(8, 9, 10, 0.8)',
    borderRadius: 130,
  },
  globeImage: {
    width: 222,
    height: 204,
    borderRadius: 120,
    marginTop: s(16)
  },
  badgesRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: s(16), position: 'absolute', bottom: 26 },
  badgeLeft: {
    backgroundColor: 'rgba(11, 17, 32, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 12,
    paddingHorizontal: s(16),
    paddingVertical: s(12),
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  badgeLeftLight: { backgroundColor: 'rgba(255, 255, 255, 0.92)', borderColor: 'rgba(59, 130, 246, 0.45)' },
  badgeLive: { fontSize: 12, fontWeight: '700', color: '#3b82f6', letterSpacing: 1, marginBottom: s(4) },
  badgeLeftSub: { fontSize: 12, color: 'rgba(255, 255, 255, 0.4)' },
  badgeSubLight: { color: 'rgba(15, 23, 42, 0.5)' },
  badgeRight: {
    backgroundColor: 'rgba(11, 17, 32, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.35)',
    borderRadius: 12,
    paddingHorizontal: s(14),
    paddingVertical: s(10),
    alignItems: 'center',
    marginTop: -20,
    shadowColor: '#c9a84c',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  badgeRightLight: { backgroundColor: 'rgba(255, 255, 255, 0.92)', borderColor: 'rgba(201, 168, 76, 0.5)' },
  badgeAvailable: { fontSize: 10, fontWeight: '700', color: '#c9a84c', letterSpacing: 1, marginBottom: s(2) },
  badgeNumber: { fontSize: 28, fontWeight: '600', color: '#c9a84c', marginBottom: s(2) },
  badgeCountries: { fontSize: 12, color: 'rgba(255, 255, 255, 0.4)' },
  stepperContainer: { alignItems: 'center', justifyContent: 'center', width: '100%', paddingHorizontal: s(30), marginTop: -8, marginBottom: s(10) },
  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  stepperStep: { alignItems: 'center', width: 64 },
  stepperCircle: {
    width: 32,
    height: 32,
    borderRadius: 19,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 0 },
    // shadowOpacity: 0.5,
    // shadowRadius: 6,
    // elevation: 4,
  },
  stepperNumber: { fontSize: 14, fontWeight: '700' },
  stepperLabel: { fontSize: 12, fontWeight: '500', marginTop: s(8), textAlign: 'center' },
  stepperLine: { width: 30, height: 1, marginHorizontal: -4 },
  contentSection: {
    flex: 1,
    paddingHorizontal: s(16),
    paddingTop: s(20),
    paddingBottom: s(24),
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -20,
  },
  goldLine: {
    alignSelf: 'center',
    width: 120,
    height: 1,
    backgroundColor: 'rgba(201, 168, 76, 0.35)',
    marginBottom: s(16),
  },
  eyebrowContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: s(10) },
  eyebrowDash: { width: 18, height: 1, backgroundColor: '#c9a84c', marginRight: s(8) },
  eyebrowText: { fontSize: 12, fontWeight: '700', letterSpacing: 1.5, color: '#c9a84c' },
  title: { fontSize: 24, fontWeight: '300', lineHeight: 30, marginBottom: s(12) },
  titleItalic: { fontStyle: 'italic', color: '#c9a84c' },
  body: { fontSize: 14, lineHeight: 20, marginBottom: 4 },
  dotsContainer: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: s(16) },
  dot: { width: 6, height: 6, borderRadius: 3 },
  activeDot: { width: 22, backgroundColor: '#c9a84c', borderRadius: 4 },
  nextButton: { borderRadius: 24, overflow: 'hidden', marginBottom: s(8) },
  gradientButton: { height: 50, alignItems: 'center', justifyContent: 'center' },
  nextButtonText: { fontSize: 16, fontWeight: '700', color: '#0a0f1e' },
  skipButton: { height: 34, alignItems: 'center', justifyContent: 'center', marginBottom: s(4) },
  skipText: { fontSize: 12, fontWeight: '500' },
  scrollBody: { flex: 1 },
  scrollContent: { paddingBottom: s(8) },
});

export default OnboardingSlide;
