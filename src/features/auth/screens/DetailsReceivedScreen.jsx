import { font } from '../../../theme/typography';
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import logoR from '../../../assets/images/logoR.png';
import { s } from '../../../theme/responsive';
import { themePalette, makeThemeStyles } from '../../../theme/colors';

export default function DetailsReceivedScreen({ navigation, route }) {
  const {
    companyName = 'Meridian Global Ventures',
    selectedEnding = 'LLC',
    selectedState = 'Delaware',
    selectedCountry = 'US',
    selectedStructure = 'LLC',
    email = 'rajesh@meridianglobal.com',
    fullName = 'Rajesh Kumar Sharma',
    countryOfResidence = 'India',
  } = route.params || {};
  const isUS = selectedCountry === 'US';
  // LLC/structure suffix sirf USA ke liye — quoted/non-US me LLC galat dikhta hai
  const legalName = companyName ? (isUS ? `${companyName} ${selectedEnding || selectedStructure}`.trim() : String(companyName).trim()) : 'Meridian Global Ventures LLC';
  const jurisdiction = isUS ? (selectedState ? `US ${selectedState}, USA` : 'US Delaware, USA') : String(selectedCountry || selectedState || '');
  const structure = isUS ? (selectedStructure || 'LLC') : '—';
  const founderName = fullName || 'Rajesh Kumar Sharma';
  const founderEmail = email || 'rajesh@meridianglobal.com';
  const residence = countryOfResidence || 'India';
  const displayLocation = selectedState || 'Germany';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={themePalette.hex_080e18} />

      <View style={styles.topBar}>
        <Image source={logoR} style={styles.topLogo} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Summary Cards - as per design */}
        <View style={styles.summarySection}>
          {/* Company Card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <View style={styles.summaryHeaderLeft}>
                <View style={styles.summaryIconBox}>
                  <Feather name="briefcase" size={12} color={themePalette.hex_d4af37} />
                </View>
                <Text style={styles.summaryHeaderTitle}>COMPANY</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.editBtn}>
                <Feather name="edit-2" size={12} color={themePalette.hex_d4af37} />
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Legal name</Text>
              <Text style={styles.summaryValueGold}>{legalName}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Jurisdiction</Text>
              <Text style={styles.summaryValue}>{jurisdiction}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Structure</Text>
              <Text style={styles.summaryValue}>{structure}</Text>
            </View>
          </View>

          {/* Principal Founder Card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <View style={styles.summaryHeaderLeft}>
                <View style={[styles.summaryIconBox, { backgroundColor: themePalette.rgba_100_181_246_0_12, borderColor: themePalette.rgba_100_181_246_0_25 }]}>
                  <Feather name="user" size={12} color={themePalette.hex_64b5f6} />
                </View>
                <Text style={styles.summaryHeaderTitle}>PRINCIPAL FOUNDER</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.editBtn}>
                <Feather name="edit-2" size={12} color={themePalette.hex_d4af37} />
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Full name</Text>
              <Text style={styles.summaryValue}>{founderName}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Email</Text>
              <Text style={styles.summaryValue}>{founderEmail}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Residence</Text>
              <View style={styles.residenceValue}>
                <Text style={styles.summaryValueSmall}>IN</Text>
                <Text style={styles.summaryValue}> {residence}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.heroSection}>
          <View style={styles.outerGlowCircle}>
            <View style={styles.innerGlowCircle}>
              <View style={styles.iconContainer}>
                <Feather name="mail" size={44} color={themePalette.hex_64b5f6} />
              </View>
            </View>
          </View>

          <Text style={styles.mainTitle}>
            Details <Text style={styles.italicTitle}>received</Text>
          </Text>

          <Text style={styles.subtitle}>
            Our team is preparing your exact quote for <Text style={styles.companyName}>{legalName}</Text> in {displayLocation}.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.cardIconBox}>
            <Feather name="clock" size={20} color={themePalette.hex_64b5f6} />
          </View>
          <View style={styles.cardTextGroup}>
            <Text style={styles.cardTitle}>Quote within 2 hours</Text>
            <Text style={styles.cardSubtext}>Emailed to {founderEmail}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.cardIconBox}>
            <Feather name="file-text" size={20} color={themePalette.hex_d4af37} />
          </View>
          <View style={styles.cardTextGroup}>
            <Text style={styles.cardTitle}>Draft saved</Text>
            <Text style={styles.cardSubtext}>Resume any time from your dashboard</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.cardIconBox}>
            <Ionicons name="checkmark-circle-outline" size={22} color={themePalette.hex_00e676} />
          </View>
          <View style={styles.cardTextGroup}>
            <Text style={styles.cardTitle}>Nothing to pay yet</Text>
            <Text style={styles.cardSubtext}>Pay only once you approve the quote</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footerContainer}>
        <TouchableOpacity style={styles.dashboardButton} activeOpacity={0.8} onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}>
          <Text style={styles.dashboardButtonText}>Go to Dashboard</Text>
          <Ionicons name="arrow-forward" size={18} color={themePalette.hex_0a111d} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.speakButton} activeOpacity={0.8} onPress={() => {}}>
          <Feather name="headphones" size={18} color={themePalette.hex_ffffff} style={styles.speakIcon} />
          <Text style={styles.speakButtonText}>Speak to our team</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = makeThemeStyles(() => StyleSheet.create({
  container: { flex: 1, backgroundColor: themePalette.hex_080e18 },
  topBar: { alignItems: 'center', paddingVertical: 16, marginTop: 10 },
  topLogo: { width: 150, height: 38, resizeMode: 'contain' },
  scrollContent: { paddingHorizontal: s(20), paddingBottom: 20, alignItems: 'center' },
  summarySection: { width: '100%', gap: 12, marginBottom: 10 },
  summaryCard: { width: '100%', backgroundColor: themePalette.hex_0c1622, borderRadius: 16, borderWidth: 1, borderColor: themePalette.rgba_255_255_255_0_08, padding: 14, borderTopWidth: 1, borderTopColor: themePalette.rgba_212_175_55_0_15 },
  summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  summaryHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  summaryIconBox: { width: 26, height: 26, borderRadius: 7, backgroundColor: themePalette.rgba_212_175_55_0_12, borderWidth: 1, borderColor: themePalette.rgba_212_175_55_0_25, justifyContent: 'center', alignItems: 'center' },
  summaryHeaderTitle: { color: themePalette.hex_8e9bae, fontSize: font.xs, fontWeight: '700', letterSpacing: 0.8 },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  editText: { color: themePalette.hex_d4af37, fontSize: font.small, fontWeight: '600' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  summaryLabel: { color: themePalette.hex_6c7a8e, fontSize: font.sm },
  summaryValue: { color: themePalette.hex_ffffff, fontSize: font.sm, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  summaryValueGold: { color: themePalette.hex_d4af37, fontSize: font.sm, fontWeight: '700', maxWidth: '60%', textAlign: 'right' },
  summaryValueSmall: { color: themePalette.hex_8e9bae, fontSize: font.xs, fontWeight: '700', backgroundColor: themePalette.rgba_255_255_255_0_06, paddingHorizontal: s(4), paddingVertical: 1, borderRadius: 3, overflow: 'hidden' },
  residenceValue: { flexDirection: 'row', alignItems: 'center' },
  heroSection: { alignItems: 'center', marginTop: 20, marginBottom: 30, width: '100%' },
  outerGlowCircle: { width: 220, height: 220, borderRadius: 110, backgroundColor: themePalette.rgba_255_255_255_0_02, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  innerGlowCircle: { width: 150, height: 150, borderRadius: 75, backgroundColor: themePalette.rgba_255_255_255_0_03, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: themePalette.rgba_255_255_255_0_05 },
  iconContainer: { width: 90, height: 90, borderRadius: 28, backgroundColor: themePalette.hex_0c1827, borderWidth: 1, borderColor: themePalette.rgba_100_181_246_0_3, justifyContent: 'center', alignItems: 'center' },
  mainTitle: { fontSize: font.displayXXL, fontWeight: '700', color: themePalette.hex_ffffff, marginTop: 15, marginBottom: 8 },
  italicTitle: { fontStyle: 'italic', fontWeight: '400', color: themePalette.hex_64b5f6 },
  subtitle: { color: themePalette.hex_8e9bae, fontSize: font.base, textAlign: 'center', lineHeight: 22, paddingHorizontal: s(10) },
  companyName: { color: themePalette.hex_ffffff, fontWeight: '700' },
  infoCard: { width: '100%', backgroundColor: themePalette.hex_0c1622, borderRadius: 16, borderWidth: 1, borderColor: themePalette.rgba_255_255_255_0_08, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
  cardIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: themePalette.rgba_255_255_255_0_04, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  cardTextGroup: { flex: 1 },
  cardTitle: { color: themePalette.hex_ffffff, fontSize: font.md, fontWeight: '700' },
  cardSubtext: { color: themePalette.hex_6c7a8e, fontSize: font.sm, marginTop: 3 },
  footerContainer: { paddingHorizontal: s(20), paddingTop: 10, paddingBottom: 20, backgroundColor: themePalette.hex_080e18, gap: 10 },
  dashboardButton: { backgroundColor: themePalette.hex_d4af37, height: 52, borderRadius: 26, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  dashboardButtonText: { color: themePalette.hex_0a111d, fontSize: font.lg, fontWeight: '700', marginRight: 8 },
  speakButton: { backgroundColor: themePalette.hex_0c1622, height: 50, borderRadius: 25, borderWidth: 1, borderColor: themePalette.rgba_255_255_255_0_12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  speakIcon: { marginRight: 8 },
  speakButtonText: { color: themePalette.hex_ffffff, fontSize: font.md, fontWeight: '600' },
}));
