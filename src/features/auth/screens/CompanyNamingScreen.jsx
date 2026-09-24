import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Animated,
  StatusBar,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BackButton from '../../../components/buttons/BackButton';
import logoR from '../../../assets/images/logoR.png';
import { s } from '../../../theme/responsive';

const CompanyNamingScreen = ({ navigation, route }) => {
  const p = route.params || {};
  // bestCountry/bestState (advisor flow) + selectedCountry/selectedState (direct) dono handle
  const selectedCountry = p.selectedCountry || p.bestCountry || 'US';
  const isUS = selectedCountry === 'US';
  const selectedState = p.selectedState || p.bestState || (isUS ? 'Delaware' : '');
  const [companyName, setCompanyName] = useState('');
  const [selectedEnding, setSelectedEnding] = useState('');
  const [alternateName, setAlternateName] = useState('');
  const [showAvailable, setShowAvailable] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  // 5 sec delay after user types company name before showing tick + availability text
  useEffect(() => {
    if (companyName.trim().length > 0) {
      setShowAvailable(false);
      const timer = setTimeout(() => setShowAvailable(true), 3000);
      return () => clearTimeout(timer);
    } else {
      setShowAvailable(false);
    }
  }, [companyName]);

  const legalEndings = ['LLC', 'L.L.C.', 'Inc.', 'Corp.', 'Co.'];
  const endingFullForm = { 'LLC': 'Limited Liability Company', 'L.L.C.': 'Limited Liability Company', 'Inc.': 'Incorporated', 'Corp.': 'Corporation', 'Co.': 'Company' };
  const countryFullNames = { US: 'United States', AE: 'United Arab Emirates', GB: 'United Kingdom', SG: 'Singapore', EE: 'Estonia', HK: 'Hong Kong', CY: 'Cyprus', MT: 'Malta', CA: 'Canada', IN: 'India', CN: 'China', AU: 'Australia', DE: 'Germany', NL: 'Netherlands', IE: 'Ireland', CH: 'Switzerland', PA: 'Panama', MY: 'Malaysia', GE: 'Georgia', IL: 'Israel', JP: 'Japan', KR: 'South Korea', PT: 'Portugal', ES: 'Spain', FR: 'France', IT: 'Italy', PL: 'Poland', CZ: 'Czech Republic', RO: 'Romania', BG: 'Bulgaria', LU: 'Luxembourg', TH: 'Thailand', ID: 'Indonesia', PH: 'Philippines', NZ: 'New Zealand', SA: 'Saudi Arabia', QA: 'Qatar', BH: 'Bahrain', MX: 'Mexico', BR: 'Brazil', PE: 'Peru', CL: 'Chile', CO: 'Colombia', UY: 'Uruguay', MU: 'Mauritius', VG: 'British Virgin Islands', KY: 'Cayman Islands', BZ: 'Belize', SC: 'Seychelles', BB: 'Barbados' };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" transparent backgroundColor="transparent" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={styles.headerRow}>
          <BackButton onPress={() => navigation.goBack()} />
          <Image source={logoR} style={styles.topLogo} />
        </View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          <Text style={[styles.mainTitle, { marginTop: s(8) }]}>
            What will you <Text style={styles.italicTitle}>call it?</Text>
          </Text>
          <Text style={styles.subtitle}>
            {isUS ? `We'll check name availability with the ${selectedState} Division of Corporations.` : `We'll check name availability in ${countryFullNames[selectedCountry] || selectedCountry}.`}
          </Text>

          {/* Jurisdiction Card - pura naam */}
          <View style={styles.jurisdictionCard}>
            <Text style={styles.countryCodeBadge}>{selectedCountry}</Text>
            <Text style={styles.jurisdictionLabel}>Jurisdiction</Text>
            <Text style={styles.jurisdictionValue}>{isUS ? `${selectedState}, ${countryFullNames[selectedCountry] || selectedCountry}` : (countryFullNames[selectedCountry] || selectedCountry)}</Text>
          </View>

          {/* Company Name Input */}
          <Text style={styles.inputLabel}>
            COMPANY NAME <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <View style={showAvailable ? styles.successInputContainer : styles.defaultInputContainer}>
            <Ionicons name="business" size={16} color="#94A3B8" />
            <TextInput
              style={styles.textInput}
              value={companyName}
              onChangeText={setCompanyName}
              placeholder="Enter company name"
              placeholderTextColor="#475569"
            />
          </View>



          {/* Legal Endings - sirf US ke liye */}
          {isUS && (
            <>
              <Text style={styles.inputLabel}>LEGAL ENDING <Text style={styles.requiredAsterisk}>*</Text></Text>
              <View style={styles.endingsRow}>
                {legalEndings.map((ending) => {
                  const isSelected = selectedEnding === ending;
                  return (
                    <TouchableOpacity
                      key={ending}
                      style={[styles.endingChip, isSelected && styles.endingChipSelected]}
                      activeOpacity={0.8}
                      onPress={() => setSelectedEnding(ending)}
                    >
                      <Text style={[styles.endingChipText, isSelected && styles.endingChipTextSelected]}>
                        {ending}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.fullLegalPreview}>
                Full legal name:{' '}
                <Text style={styles.fullLegalHighlight}>
                  {companyName || 'Your Company'} {selectedEnding || '—'}
                </Text>
              </Text>
              <Text style={[styles.helperText, { marginTop: 4 }]}>
                Short: {companyName || 'Your Company'} {selectedEnding || '—'}
              </Text>
            </>
          )}
          {!isUS && companyName.trim().length > 0 && (
            <Text style={styles.fullLegalPreview}>
              Full legal name: <Text style={styles.fullLegalHighlight}>{companyName}</Text>
            </Text>
          )}

          {/* Alternate Name */}
          <Text style={styles.inputLabel}>ALTERNATE NAME (OPTIONAL)</Text>
          <View style={styles.defaultInputContainer}>
            <Ionicons name="add" size={18} color="#64748B" />
            <TextInput
              style={styles.textInput}
              value={alternateName}
              onChangeText={setAlternateName}
              placeholder="Backup if first choice is taken"
              placeholderTextColor="#475569"
            />
          </View>
          <Text style={styles.helperText}>
            Recommended — avoids delays if your first name is rejected
          </Text>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <View style={styles.infoIconCircle}>
              <Ionicons name="information" size={12} color="#60A5FA" />
            </View>
            <Text style={styles.infoBoxText}>
              Words like <Text style={styles.boldWhite}>Bank, Trust, Insurance, University</Text> need special state approval.
            </Text>
          </View>

        </Animated.View>
      </ScrollView>

      {/* Bottom Fixed Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.continueBtn, (!companyName.trim() || (isUS && !selectedEnding)) && styles.continueBtnDisabled]}
          activeOpacity={0.85}
          onPress={() => {
            if (!companyName.trim() || (isUS && !selectedEnding)) return;
            const hasPrice = Number(route.params?.selectedCountryPrice || route.params?.bestCountryPrice || route.params?.bestStatePrice || route.params?.selectedStatePrice || 0) > 0;
            const baseParams = { ...(route.params || {}), companyName: companyName.trim(), selectedEnding: isUS ? selectedEnding : '', selectedState, selectedCountry };
            if (!hasPrice) {
              // amount wala page nahi dikhana - direct FounderDetails, fir signup ke baad Your Order
              navigation.navigate('FounderDetails', baseParams);
            } else if (!isUS) {
              // Non-US priced (AE/SG/GB/EE) -> Structure skip but pricingType fixed rakho, totalAmount country price se banega
              // selectedStructure empty rakhne se backend quoted bana deta tha - isliye default LLC rakho
              const fallbackStructure = route.params?.selectedStructure || 'LLC';
              const fallbackPrice = route.params?.selectedStructurePrice ?? 299;
              navigation.navigate('WhatsIncluded', { ...baseParams, selectedStructure: fallbackStructure, selectedStructurePrice: fallbackPrice });
            } else {
              navigation.navigate('StructureSelection', baseParams);
            }
          }}
          disabled={!companyName.trim() || (isUS && !selectedEnding)}
        >
          <Text style={styles.continueBtnText}>Continue →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CompanyNamingScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060913' },
  progressContainer: { flexDirection: 'row', paddingHorizontal: s(16), paddingTop: s(12), paddingBottom: s(16), gap: 8 },
  progressStep: { flex: 1, height: 3, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2 },
  progressActive: { backgroundColor: '#C9A84C' },
  scrollContent: { paddingHorizontal: s(16), paddingBottom: s(90), gap: s(2) },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: s(12), marginTop: s(34) },
  topLogo: { width: 150, height: 38, resizeMode: 'contain', marginTop: s(10) },
  mainTitle: { color: '#FFFFFF', fontSize: s(20), fontWeight: '500', lineHeight: s(34), marginBottom: s(10) },
  italicTitle: { color: '#C9A84C', fontStyle: 'italic', fontFamily: 'serif' },
  subtitle: { color: '#94A3B8', fontSize: s(12), lineHeight: s(18), marginBottom: s(24) },
  jurisdictionCard: {
    width: '100%',
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: s(14),
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: s(14), paddingVertical: s(12), marginBottom: s(14),
  },
  countryCodeBadge: { color: '#64748B', fontSize: 12, fontWeight: 'bold', marginRight: s(8) },
  jurisdictionLabel: { color: '#64748B', fontSize: 12, flex: 1 },
  jurisdictionValue: { color: '#C9A84C', fontSize: 12, fontWeight: 'bold' },
  inputLabel: { color: '#64748B', fontSize: s(11), fontWeight: 'bold', letterSpacing: 1.2, marginBottom: s(8), marginTop: s(12) },
  requiredAsterisk: { color: '#EF4444' },
  successInputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.03)', borderRadius: 12,
    borderWidth: 1, borderColor: '#10B981', paddingHorizontal: s(14), height: 48,
  },
  defaultInputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: s(14), height: 48,
  },
  textInput: { flex: 1, color: '#FFFFFF', fontSize: 13, fontWeight: '500', marginLeft: s(10) },
  greenCheckBadge: {
    width: 20, height: 20, borderRadius: 10, backgroundColor: '#10B981',
    alignItems: 'center', justifyContent: 'center',
  },
  availabilityRow: { flexDirection: 'row', alignItems: 'center', marginTop: s(8), marginBottom: s(20), gap: s(6) },
  availabilityText: { color: '#10B981', fontSize: 11 },
  endingsRow: { flexDirection: 'row', gap: s(8), marginBottom: s(20), marginTop: s(4) },
  endingChip: {
    paddingHorizontal: s(14), paddingVertical: s(8), borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  endingChipSelected: { borderColor: '#C9A84C', backgroundColor: 'rgba(201, 168, 76, 0.08)' },
  endingChipText: { color: '#64748B', fontSize: 11, fontWeight: '600' },
  endingChipTextSelected: { color: '#C9A84C', fontWeight: 'bold' },
  fullLegalPreview: { color: '#64748B', fontSize: s(13), marginBottom: s(12), marginTop: s(4) },
  fullLegalHighlight: { color: '#C9A84C', fontWeight: 'bold', fontSize: s(14) },
  helperText: { color: '#64748B', fontSize: 10, marginTop: s(6), marginBottom: s(10) },
  infoBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.04)', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.15)',
    padding: s(12), marginTop: s(12), marginBottom: s(4),
  },
  infoIconCircle: {
    width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: '#60A5FA',
    alignItems: 'center', justifyContent: 'center', marginRight: s(10),
  },
  infoBoxText: { flex: 1, color: '#94A3B8', fontSize: 10.5, lineHeight: 15 },
  boldWhite: { color: '#CBD5E1', fontWeight: 'bold' },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#060913', paddingHorizontal: s(16), paddingVertical: s(12),
    borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  continueBtn: { backgroundColor: '#D4AF37', borderRadius: 24, paddingVertical: s(14), alignItems: 'center' },
  continueBtnDisabled: { backgroundColor: 'rgba(212, 175, 55, 0.3)' },
  continueBtnText: { color: '#060913', fontSize: 14, fontWeight: 'bold' },
});
