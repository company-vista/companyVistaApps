import { font } from '../../../theme/typography';
import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Animated,
  StatusBar,
  Image,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BackButton from '../../../components/buttons/BackButton';
import logoR from '../../../assets/images/logoR.png';
import { useThemeColors, themePalette, makeThemeStyles } from '../../../theme/colors';
import { s } from '../../../theme/responsive';

const TrustedWorldwideScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const colors = useThemeColors();
  const isDark = colors.mode === 'dark';
  const insets = useSafeAreaInsets();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} transparent backgroundColor="transparent" />
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: s(16) }]} showsVerticalScrollIndicator={false}>

        <View style={styles.headerRow}>
          <BackButton onPress={() => navigation.goBack()} />
          <Image source={logoR} style={styles.topLogo} />
        </View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* Counter Section */}
          <View style={styles.counterSection}>
            <Ionicons name="leaf" size={24} color={themePalette.hex_c9a84c} />
            <View style={styles.counterTextWrapper}>
              <Text style={[styles.counterNumber, { color: colors.text }]}>2,400<Text style={styles.plusSign}>+</Text></Text>
              <Text style={[styles.counterLabel, { color: colors.muted }]}>COMPANIES REGISTERED</Text>
            </View>
            <Ionicons name="leaf" size={24} color={themePalette.hex_c9a84c} />
          </View>

          {/* 2x2 Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, styles.goldCard, { backgroundColor: isDark ? themePalette.rgba_255_255_255_0_02 : themePalette.hex_ffffff }]}>
              <Ionicons name="globe" size={20} color={themePalette.hex_c9a84c} />
              <Text style={[styles.statNumber, { color: themePalette.hex_c9a84c }]}>50+</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Countries</Text>
            </View>

            <View style={[styles.statCard, styles.greenCard, { backgroundColor: isDark ? themePalette.rgba_255_255_255_0_02 : themePalette.hex_ffffff }]}>
              <Ionicons name="checkmark-circle" size={20} color={themePalette.hex_10b981} />
              <Text style={[styles.statNumber, { color: themePalette.hex_10b981 }]}>98%</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Success rate</Text>
            </View>

            <View style={[styles.statCard, styles.blueCard, { backgroundColor: isDark ? themePalette.rgba_255_255_255_0_02 : themePalette.hex_ffffff }]}>
              <Ionicons name="time" size={20} color={themePalette.hex_60a5fa} />
              <Text style={[styles.statNumber, { color: themePalette.hex_60a5fa }]}>7 days</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Turnaround</Text>
            </View>

            <View style={[styles.statCard, styles.purpleCard, { backgroundColor: isDark ? themePalette.rgba_255_255_255_0_02 : themePalette.hex_ffffff }]}>
              <Ionicons name="headset" size={20} color={themePalette.hex_a855f7} />
              <Text style={[styles.statNumber, { color: themePalette.hex_a855f7 }]}>24/7</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Support</Text>
            </View>
          </View>

          {/* Testimonial */}
          <View style={[styles.testimonialCard, { backgroundColor: isDark ? themePalette.rgba_255_255_255_0_03 : themePalette.hex_ffffff, borderColor: isDark ? themePalette.rgba_255_255_255_0_08 : colors.border }]}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>SK</Text>
            </View>
            <View style={styles.testimonialContent}>
              <Text style={styles.stars}>★★★★★</Text>
              <Text style={[styles.reviewText, { color: isDark ? themePalette.hex_cbd5e1 : colors.text }]}>
                Set up my Dubai company in 6 days without leaving London. Exceptional.
              </Text>
              <Text style={[styles.authorText, { color: colors.subtle }]}>Sarah K. · Founder, TechFlow</Text>
            </View>
          </View>

        </Animated.View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          <View style={styles.tagRow}>
            <View style={styles.goldLine} />
            <Text style={styles.sectionTag}>TRUSTED WORLDWIDE</Text>
          </View>

          <Text style={[styles.mainHeading, { color: colors.text }]}>
            Built for global{'\n'}
            <Text style={styles.italicGold}>visionaries</Text> like <Text style={[styles.boldText, { color: colors.text }]}>you.</Text>
          </Text>

          <Text style={[styles.descriptionText, { color: colors.muted }]}>
            Join 2,400+ entrepreneurs building their global business with CompanyVista.
          </Text>

          <View style={styles.paginationRow}>
            <View style={[styles.dotInactive, { backgroundColor: isDark ? themePalette.rgba_255_255_255_0_2 : colors.border }]} />
            <View style={styles.dashActive} />
          </View>

        </View>

      </ScrollView>

      <View style={[styles.footerBar, { paddingBottom: s(12) + insets.bottom }]}>
        <TouchableOpacity style={[styles.getStartedBtn, { backgroundColor: colors.buttonBackground }]} activeOpacity={0.8} onPress={() => navigation.navigate('RegistrationLanding')}>
          <Text style={[styles.btnText, { color: colors.buttonText }]}>Get Started →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default TrustedWorldwideScreen;

const styles = makeThemeStyles(() => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: s(16),
    paddingTop: s(30),
    paddingBottom: s(16),
  },
  footerBar: {
    paddingHorizontal: s(16),
    paddingTop: s(8),
    backgroundColor: 'transparent',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: s(16), marginTop: s(16) },
  topLogo: { width: 150, height: 38, marginTop: s(10), resizeMode: 'contain' },
  counterSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: s(20),
  },
  counterTextWrapper: {
    alignItems: 'center',
    marginHorizontal: s(10),
    marginTop: s(18)
  },
  counterNumber: {
    fontSize: font.displayXXL,
    fontWeight: '600',
    // fontFamily: 'serif',
  },
  plusSign: {
    color: themePalette.hex_c9a84c,
  },
  counterLabel: {
    fontSize: font.xs,
    letterSpacing: 1.5,
    fontWeight: '600',
    marginTop: s(4),
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: s(12),
  },
  statCard: {
    width: '48%',
    alignSelf: 'stretch',
    borderRadius: s(14),
    padding: s(14),
    alignItems: 'center',
    marginBottom: s(12),
    borderWidth: 1,
  },
  goldCard: { borderColor: themePalette.rgba_201_168_76_0_3 },
  greenCard: { borderColor: themePalette.rgba_16_185_129_0_3 },
  blueCard: { borderColor: themePalette.rgba_96_165_250_0_3 },
  purpleCard: { borderColor: themePalette.rgba_168_85_247_0_3 },
  statNumber: { fontSize: font.display, fontWeight: '600',  marginTop: s(6) },
  statLabel: { fontSize: font.small, marginTop: s(2) },
  testimonialCard: {
    width: '100%',
    flexDirection: 'row',
    borderRadius: s(14),
    padding: s(14),
    borderWidth: 1,
    marginBottom: s(28),
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: themePalette.hex_c9a84c,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: s(12),
  },
  avatarText: { color: themePalette.hex_060913, fontWeight: 'bold', fontSize: font.sm },
  testimonialContent: { flex: 1 },
  stars: { color: themePalette.hex_c9a84c, fontSize: font.xs, marginBottom: s(4) },
  reviewText: { fontSize: font.base,fontWeight: 400, lineHeight: 16 },
  authorText: { fontSize: font.xs, marginTop: s(4) },
  contentSection: { marginTop: s(4) },
  tagRow: { flexDirection: 'row', alignItems: 'center', marginBottom: s(12) },
  goldLine: { width: 18, height: 2, backgroundColor: themePalette.hex_c9a84c, marginRight: s(8) },
  sectionTag: { color: themePalette.hex_c9a84c, fontSize: font.small, letterSpacing: 1.2, fontWeight: 'bold' },
  mainHeading: {
    fontSize: font.display,
    fontWeight: '500',
    lineHeight: 36,
    marginBottom: s(12),
  },
  italicGold: { color: themePalette.hex_c9a84c, fontStyle: 'italic' },
  boldText: { fontWeight: 'bold' },
  descriptionText: {
    fontSize: font.bodySmall,
    lineHeight: 20,
    marginBottom: s(24),
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: s(20),
  },
  dotInactive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: s(6),
  },
  dashActive: {
    width: 24,
    height: 4,
    borderRadius: 2,
    backgroundColor: themePalette.hex_c9a84c,
  },
  getStartedBtn: {
    borderRadius: 24,
    paddingVertical: s(14),
    alignItems: 'center',
  },
  btnText: { fontSize: font.lg, fontWeight: 'bold' },
}));
