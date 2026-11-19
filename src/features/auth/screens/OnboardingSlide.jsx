import { font } from '../../../theme/typography';
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Image, Animated, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FastImage from 'react-native-fast-image';
import logoR from '../../../assets/images/logoR.png';
import globeLogo from '../../../assets/images/companyvista_globe_320.gif';
import globeLogoLight from '../../../assets/images/onboadingScreenLogo.png';
import { s } from '../../../theme/responsive';
import { useThemeColors, themePalette, makeThemeStyles } from '../../../theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SLIDES_DATA = [
  {
    id: 1,
    eyebrow: 'Company Registration',
    title: 'Register your company in',
    titleItalic: ' any country,',
    body: 'No travel. No local lawyers. Start your global business from anywhere — in days, not months.',
    artGradient: [themePalette.hex_122548, themePalette.hex_0a1428, themePalette.hex_060b16],
    artGradientLight: [themePalette.hex_e0f2fe, themePalette.hex_f0f9ff, themePalette.hex_ffffff],
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
    artGradient: [themePalette.hex_0e1728, themePalette.hex_0a1020, themePalette.hex_060a14],
    artGradientLight: [themePalette.hex_e6fffa, themePalette.hex_f0fdfa, themePalette.hex_ffffff],
    icon: '🌍',
    showStepper: false,
  },
  {
    id: 3,
    eyebrow: 'SMART SECURITY',
    title: 'Bank-Grade Protection for ',
    titleItalic: 'Your Wealth',
    body: 'Multi-factor authentication, biometric logins, and instant card locking keep your assets secure.',
    artGradient: [themePalette.hex_151126, themePalette.hex_0d0a18, themePalette.hex_07050e],
    artGradientLight: [themePalette.hex_f3e8ff, themePalette.hex_faf5ff, themePalette.hex_ffffff],
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
  }, [slideAnim]);

  const handleNext = () => {
    navigation.navigate('BusinessServices');
  };

  const slide = SLIDES_DATA[currentIndex];
  const buttonBg = isDark ? colors.buttonBackground : themePalette.hex_2563eb;
  const buttonTextColor = themePalette.hex_ffffff;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} transparent backgroundColor="transparent" />

      <Image source={logoR} style={styles.topLogo} />
      <Animated.View style={[styles.remoteButton, { transform: [{ translateY: slideAnim }] }]}>
        <Text style={styles.remoteButtonText}>100% Remote</Text>
      </Animated.View>

      <LinearGradient colors={isDark ? slide.artGradient : slide.artGradientLight} style={styles.artSection}>
        <View style={[styles.globeContainer, !isDark && styles.globeContainerLight]}>
          <FastImage
            source={isDark ? globeLogo : globeLogoLight}
            style={[styles.globeImage, !isDark && styles.globeImageLight]}
            resizeMode={FastImage.resizeMode.contain}
          />
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
        colors={isDark ? [themePalette.hex_0a0f1e, themePalette.hex_070b16] : [themePalette.hex_ffffff, themePalette.hex_f3f4f6]}
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
                  <View style={[styles.stepperCircle, { borderColor: themePalette.hex_c9a84c, backgroundColor: isDark ? themePalette.rgba_11_17_32_0_85 : colors.surface }]}>
                    <Text style={[styles.stepperNumber, { color: themePalette.hex_c9a84c }]}>1</Text>
                  </View>
                  <Text style={[styles.stepperLabel, { color: colors.muted }]}>Choose</Text>
                </View>
                <View style={[styles.stepperLine, { backgroundColor: colors.border }]} />
                <View style={styles.stepperStep}>
                  <View style={[styles.stepperCircle, { borderColor: themePalette.hex_3b82f6, backgroundColor: isDark ? themePalette.rgba_11_17_32_0_85 : colors.surface }]}>
                    <Text style={[styles.stepperNumber, { color: themePalette.hex_3b82f6 }]}>2</Text>
                  </View>
                  <Text style={[styles.stepperLabel, { color: colors.muted }]}>Submit</Text>
                </View>
                <View style={[styles.stepperLine, { backgroundColor: colors.border }]} />
                <View style={styles.stepperStep}>
                  <View style={[styles.stepperCircle, { borderColor: themePalette.hex_14b8a6, backgroundColor: isDark ? themePalette.rgba_11_17_32_0_85 : colors.surface }]}>
                    <Text style={[styles.stepperNumber, { color: themePalette.hex_14b8a6 }]}>3</Text>
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
              style={[styles.dot, { backgroundColor: isDark ? themePalette.rgba_255_255_255_0_15 : colors.border }, idx === currentIndex ? styles.activeDot : null]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.8}>
          <LinearGradient
            colors={[buttonBg, buttonBg, buttonBg]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientButton}
          >
            <Text style={[styles.nextButtonText, { color: buttonTextColor }]}>
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

const styles = makeThemeStyles(() => StyleSheet.create({
  container: { flex: 1 },
  topLogo: { position: 'absolute', top: 50, left: 12, width: 180, height: 38, resizeMode: 'contain', zIndex: 10 },
  remoteButton: { position: 'absolute', top: 98, left: 20, backgroundColor: themePalette.rgba_201_168_76_0_15, borderWidth: 1, borderColor: themePalette.rgba_201_168_76_0_3, borderRadius: 20, paddingHorizontal: s(14), paddingVertical: s(6), zIndex: 10 },
  remoteButtonText: { fontSize: font.sm, fontWeight: '600', color: themePalette.hex_c9a84c, letterSpacing: 0.5 },
  artSection: { height: '50%', alignItems: 'center', justifyContent: 'center' },
  artBadge: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: themePalette.rgba_11_17_32_0_85,
    borderWidth: 1,
    borderColor: themePalette.rgba_201_168_76_0_3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artIcon: { fontSize: font.display5XL },
  globeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  globeContainerLight: {
    backgroundColor: 'transparent',
    borderRadius: 0,
    overflow: 'visible',
  },
  globeImage: {
    width: 222,
    height: 204,
    borderRadius: 120,
    marginTop: s(16)
  },
  globeImageLight: {
    width: 190,
    height: 190,
    borderRadius: 95,
    marginTop: 0,
  },
  badgesRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: s(16), position: 'absolute', bottom: 26 },
  badgeLeft: {
    backgroundColor: themePalette.rgba_11_17_32_0_85,
    borderWidth: 1,
    borderColor: themePalette.rgba_59_130_246_0_3,
    borderRadius: 12,
    paddingHorizontal: s(16),
    paddingVertical: s(12),
    shadowColor: themePalette.hex_3b82f6,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  badgeLeftLight: { backgroundColor: themePalette.rgba_255_255_255_0_92, borderColor: themePalette.rgba_59_130_246_0_45 },
  badgeLive: { fontSize: font.sm, fontWeight: '700', color: themePalette.hex_3b82f6, letterSpacing: 1, marginBottom: s(4) },
  badgeLeftSub: { fontSize: font.sm, color: themePalette.rgba_255_255_255_0_4 },
  badgeSubLight: { color: themePalette.rgba_15_23_42_0_5 },
  badgeRight: {
    backgroundColor: themePalette.rgba_11_17_32_0_85,
    borderWidth: 1,
    borderColor: themePalette.rgba_201_168_76_0_35,
    borderRadius: 12,
    paddingHorizontal: s(14),
    paddingVertical: s(10),
    alignItems: 'center',
    marginTop: -20,
    shadowColor: themePalette.hex_c9a84c,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  badgeRightLight: { backgroundColor: themePalette.rgba_255_255_255_0_92, borderColor: themePalette.rgba_201_168_76_0_5 },
  badgeAvailable: { fontSize: font.xs, fontWeight: '700', color: themePalette.hex_c9a84c, letterSpacing: 1, marginBottom: s(2) },
  badgeNumber: { fontSize: font.displayXL, fontWeight: '600', color: themePalette.hex_c9a84c, marginBottom: s(2) },
  badgeCountries: { fontSize: font.sm, color: themePalette.rgba_255_255_255_0_4 },
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
  stepperNumber: { fontSize: font.base, fontWeight: '700' },
  stepperLabel: { fontSize: font.sm, fontWeight: '500', marginTop: s(8), textAlign: 'center' },
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
    backgroundColor: themePalette.rgba_201_168_76_0_35,
    marginBottom: s(16),
  },
  eyebrowContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: s(10) },
  eyebrowDash: { width: 18, height: 1, backgroundColor: themePalette.hex_c9a84c, marginRight: s(8) },
  eyebrowText: { fontSize: font.small, fontWeight: '700', letterSpacing: 1.2, color: themePalette.hex_c9a84c },
  title: { fontSize: font.display, fontWeight: '500', lineHeight: 34, marginBottom: s(12) },
  titleItalic: { fontStyle: 'italic', color: themePalette.hex_c9a84c, fontFamily: 'serif' },
  body: { fontSize: font.base, lineHeight: 22, marginBottom: s(4) },
  dotsContainer: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: s(16) },
  dot: { width: 6, height: 6, borderRadius: 3 },
  activeDot: { width: 22, backgroundColor: themePalette.hex_c9a84c, borderRadius: 4 },
  nextButton: { borderRadius: 24, overflow: 'hidden', marginBottom: s(8) },
  gradientButton: { height: 50, alignItems: 'center', justifyContent: 'center' },
  nextButtonText: { fontSize: font.md, fontWeight: '700', color: themePalette.hex_ffffff },
  skipButton: { height: 34, alignItems: 'center', justifyContent: 'center', marginBottom: s(4) },
  skipText: { fontSize: font.base, fontWeight: '500' },
  scrollBody: { flex: 1 },
  scrollContent: { paddingBottom: s(8) },
}));

export default OnboardingSlide;
