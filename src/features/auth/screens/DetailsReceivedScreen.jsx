import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import logoR from '../../../assets/images/logoR.png';

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
  const legalName = companyName ? `${companyName} ${selectedEnding || selectedStructure}`.trim() : 'Meridian Global Ventures LLC';
  const jurisdiction = selectedState ? `US ${selectedState}, USA` : 'US Delaware, USA';
  const structure = selectedStructure || 'LLC';
  const founderName = fullName || 'Rajesh Kumar Sharma';
  const founderEmail = email || 'rajesh@meridianglobal.com';
  const residence = countryOfResidence || 'India';
  const displayLocation = selectedState || 'Germany';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#080E18" />

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
                  <Feather name="briefcase" size={12} color="#D4AF37" />
                </View>
                <Text style={styles.summaryHeaderTitle}>COMPANY</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.editBtn}>
                <Feather name="edit-2" size={12} color="#D4AF37" />
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
                <View style={[styles.summaryIconBox, { backgroundColor: 'rgba(100,181,246,0.12)', borderColor: 'rgba(100,181,246,0.25)' }]}>
                  <Feather name="user" size={12} color="#64B5F6" />
                </View>
                <Text style={styles.summaryHeaderTitle}>PRINCIPAL FOUNDER</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.editBtn}>
                <Feather name="edit-2" size={12} color="#D4AF37" />
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
                <Feather name="mail" size={44} color="#64B5F6" />
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
            <Feather name="clock" size={20} color="#64B5F6" />
          </View>
          <View style={styles.cardTextGroup}>
            <Text style={styles.cardTitle}>Quote within 2 hours</Text>
            <Text style={styles.cardSubtext}>Emailed to {founderEmail}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.cardIconBox}>
            <Feather name="file-text" size={20} color="#D4AF37" />
          </View>
          <View style={styles.cardTextGroup}>
            <Text style={styles.cardTitle}>Draft saved</Text>
            <Text style={styles.cardSubtext}>Resume any time from your dashboard</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.cardIconBox}>
            <Ionicons name="checkmark-circle-outline" size={22} color="#00E676" />
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
          <Ionicons name="arrow-forward" size={18} color="#0A111D" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.speakButton} activeOpacity={0.8} onPress={() => {}}>
          <Feather name="headphones" size={18} color="#FFFFFF" style={styles.speakIcon} />
          <Text style={styles.speakButtonText}>Speak to our team</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080E18' },
  topBar: { alignItems: 'center', paddingVertical: 16, marginTop: 10 },
  topLogo: { width: 150, height: 38, resizeMode: 'contain' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20, alignItems: 'center' },
  summarySection: { width: '100%', gap: 12, marginBottom: 10 },
  summaryCard: { width: '100%', backgroundColor: '#0C1622', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 14, borderTopWidth: 1, borderTopColor: 'rgba(212,175,55,0.15)' },
  summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  summaryHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  summaryIconBox: { width: 26, height: 26, borderRadius: 7, backgroundColor: 'rgba(212,175,55,0.12)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.25)', justifyContent: 'center', alignItems: 'center' },
  summaryHeaderTitle: { color: '#8E9BAE', fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  editText: { color: '#D4AF37', fontSize: 11, fontWeight: '600' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  summaryLabel: { color: '#6C7A8E', fontSize: 12 },
  summaryValue: { color: '#FFFFFF', fontSize: 12, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  summaryValueGold: { color: '#D4AF37', fontSize: 12, fontWeight: '700', maxWidth: '60%', textAlign: 'right' },
  summaryValueSmall: { color: '#8E9BAE', fontSize: 10, fontWeight: '700', backgroundColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 3, overflow: 'hidden' },
  residenceValue: { flexDirection: 'row', alignItems: 'center' },
  heroSection: { alignItems: 'center', marginTop: 20, marginBottom: 30, width: '100%' },
  outerGlowCircle: { width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(255, 255, 255, 0.02)', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  innerGlowCircle: { width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255, 255, 255, 0.03)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' },
  iconContainer: { width: 90, height: 90, borderRadius: 28, backgroundColor: '#0C1827', borderWidth: 1, borderColor: 'rgba(100, 181, 246, 0.3)', justifyContent: 'center', alignItems: 'center' },
  mainTitle: { fontSize: 32, fontWeight: '700', color: '#FFFFFF', marginTop: 15, marginBottom: 8 },
  italicTitle: { fontStyle: 'italic', fontWeight: '400', color: '#64B5F6' },
  subtitle: { color: '#8E9BAE', fontSize: 14, textAlign: 'center', lineHeight: 22, paddingHorizontal: 10 },
  companyName: { color: '#FFFFFF', fontWeight: '700' },
  infoCard: { width: '100%', backgroundColor: '#0C1622', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
  cardIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255, 255, 255, 0.04)', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  cardTextGroup: { flex: 1 },
  cardTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  cardSubtext: { color: '#6C7A8E', fontSize: 12, marginTop: 3 },
  footerContainer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20, backgroundColor: '#080E18', gap: 10 },
  dashboardButton: { backgroundColor: '#D4AF37', height: 52, borderRadius: 26, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  dashboardButtonText: { color: '#0A111D', fontSize: 16, fontWeight: '700', marginRight: 8 },
  speakButton: { backgroundColor: '#0C1622', height: 50, borderRadius: 25, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.12)', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  speakIcon: { marginRight: 8 },
  speakButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
});
