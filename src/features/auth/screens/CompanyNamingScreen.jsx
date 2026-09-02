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

const CompanyNamingScreen = ({ navigation, route }) => {
  const { selectedState = 'Delaware', selectedCountry = 'US' } = route.params || {};
  const [companyName, setCompanyName] = useState('');
  const [selectedEnding, setSelectedEnding] = useState('LLC');
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
  const countryNames = { US: 'USA', AE: 'UAE', GB: 'UK' };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" transparent backgroundColor="transparent" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={styles.headerRow}>
          <BackButton onPress={() => navigation.goBack()} />
          <Image source={logoR} style={styles.topLogo} />
        </View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          <Text style={styles.mainTitle}>
            What will you <Text style={styles.italicTitle}>call it?</Text>
          </Text>
          <Text style={styles.subtitle}>
            We'll check name availability with the Delaware Division of Corporations.
          </Text>

          {/* Jurisdiction Card */}
          <View style={styles.jurisdictionCard}>
            <Text style={styles.countryCodeBadge}>{selectedCountry}</Text>
            <Text style={styles.jurisdictionLabel}>Jurisdiction</Text>
            <Text style={styles.jurisdictionValue}>{selectedState}, {countryNames[selectedCountry] || selectedCountry}</Text>
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
            {showAvailable && (
              <View style={styles.greenCheckBadge}>
                <Ionicons name="checkmark" size={12} color="#060913" />
              </View>
            )}
          </View>

          {showAvailable && (
            <View style={styles.availabilityRow}>
              <Ionicons name="checkmark-circle" size={14} color="#10B981" />
              <Text style={styles.availabilityText}>
                Available in {selectedState} — checked just now
              </Text>
            </View>
          )}

          {/* Legal Endings */}
          <Text style={styles.inputLabel}>LEGAL ENDING</Text>
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
              {companyName || 'Your Company'} {selectedEnding}
            </Text>
          </Text>

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
          style={[styles.continueBtn, !companyName.trim() && styles.continueBtnDisabled]}
          activeOpacity={0.85}
          onPress={() => companyName.trim() && navigation.navigate('StructureSelection', { companyName: companyName.trim(), selectedEnding, selectedState, selectedCountry })}
          disabled={!companyName.trim()}
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
  progressContainer: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16, gap: 8 },
  progressStep: { flex: 1, height: 3, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2 },
  progressActive: { backgroundColor: '#C9A84C' },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 90 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16, marginTop: 34 },
  topLogo: { width: 150, height: 38, resizeMode: 'contain', marginTop: 10 },
  mainTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '500', lineHeight: 34, marginBottom: 8 },
  italicTitle: { color: '#C9A84C', fontStyle: 'italic', fontFamily: 'serif' },
  subtitle: { color: '#94A3B8', fontSize: 12, lineHeight: 18, marginBottom: 20 },
  jurisdictionCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 14, paddingVertical: 12, marginBottom: 20,
  },
  countryCodeBadge: { color: '#64748B', fontSize: 12, fontWeight: 'bold', marginRight: 8 },
  jurisdictionLabel: { color: '#64748B', fontSize: 12, flex: 1 },
  jurisdictionValue: { color: '#C9A84C', fontSize: 12, fontWeight: 'bold' },
  inputLabel: { color: '#64748B', fontSize: 10, fontWeight: 'bold', letterSpacing: 1.2, marginBottom: 8, marginTop: 8 },
  requiredAsterisk: { color: '#EF4444' },
  successInputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.03)', borderRadius: 12,
    borderWidth: 1, borderColor: '#10B981', paddingHorizontal: 14, height: 48,
  },
  defaultInputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 14, height: 48,
  },
  textInput: { flex: 1, color: '#FFFFFF', fontSize: 13, fontWeight: '500', marginLeft: 10 },
  greenCheckBadge: {
    width: 20, height: 20, borderRadius: 10, backgroundColor: '#10B981',
    alignItems: 'center', justifyContent: 'center',
  },
  availabilityRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, marginBottom: 16, gap: 6 },
  availabilityText: { color: '#10B981', fontSize: 11 },
  endingsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  endingChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  endingChipSelected: { borderColor: '#C9A84C', backgroundColor: 'rgba(201, 168, 76, 0.08)' },
  endingChipText: { color: '#64748B', fontSize: 11, fontWeight: '600' },
  endingChipTextSelected: { color: '#C9A84C', fontWeight: 'bold' },
  fullLegalPreview: { color: '#64748B', fontSize: 11, marginBottom: 16 },
  fullLegalHighlight: { color: '#C9A84C', fontWeight: 'bold' },
  helperText: { color: '#64748B', fontSize: 10, marginTop: 6, marginBottom: 16 },
  infoBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.04)', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.15)',
    padding: 12, marginTop: 10,
  },
  infoIconCircle: {
    width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: '#60A5FA',
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  infoBoxText: { flex: 1, color: '#94A3B8', fontSize: 10.5, lineHeight: 15 },
  boldWhite: { color: '#CBD5E1', fontWeight: 'bold' },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#060913', paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  continueBtn: { backgroundColor: '#D4AF37', borderRadius: 24, paddingVertical: 14, alignItems: 'center' },
  continueBtnDisabled: { backgroundColor: 'rgba(212, 175, 55, 0.3)' },
  continueBtnText: { color: '#060913', fontSize: 14, fontWeight: 'bold' },
});
