import React, { useState, useRef, useEffect } from 'react';
import { s } from '../../../theme/responsive';
import {
  StyleSheet,
  Text,
  Image,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Animated,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BackButton from '../../../components/buttons/BackButton';
import logoR from '../../../assets/images/logoR.png';
import { font } from '../../../theme/typography';

// allCountries from CountrySelectionScreen - merged here
const allCountries = [
  { id: 'US', code: 'US', name: 'USA (United States)', price: 'from $299' },
  { id: 'AE', code: 'AE', name: 'UAE (United Arab Emirates)', price: 'from $1,499' },
  { id: 'GB', code: 'GB', name: 'UK (United Kingdom)', price: 'from $595' },
  { id: 'SG', code: 'SG', name: 'Singapore', price: 'from $899' },
  { id: 'EE', code: 'EE', name: 'Estonia', price: 'from $499' },
  { id: 'HK', code: 'HK', name: 'Hong Kong', price: 'from $1,475' },
  { id: 'CY', code: 'CY', name: 'Cyprus', price: 'from $399' },
  { id: 'MT', code: 'MT', name: 'Malta', price: 'from $599' },
  { id: 'CA', code: 'CA', name: 'Canada', price: 'from $1,299' },
  { id: 'IN', code: 'IN', name: 'India', price: 'from $599' },
  { id: 'CN', code: 'CN', name: 'China', price: 'from $599' },
  { id: 'AU', code: 'AU', name: 'Australia', price: 'from $599' },
  { id: 'DE', code: 'DE', name: 'Germany', price: 'from $599' },
  { id: 'NL', code: 'NL', name: 'Netherlands', price: 'from $599' },
  { id: 'IE', code: 'IE', name: 'Ireland', price: 'from $599' },
  { id: 'CH', code: 'CH', name: 'Switzerland', price: 'from $599' },
  { id: 'PA', code: 'PA', name: 'Panama', price: 'from $599' },
  { id: 'MY', code: 'MY', name: 'Malaysia', price: 'from $599' },
  { id: 'GE', code: 'GE', name: 'Georgia', price: 'from $599' },
  { id: 'IL', code: 'IL', name: 'Israel', price: 'from $599' },
  { id: 'JP', code: 'JP', name: 'Japan', price: 'from $599' },
  { id: 'KR', code: 'KR', name: 'South Korea', price: 'from $599' },
  { id: 'PT', code: 'PT', name: 'Portugal', price: 'from $599' },
  { id: 'ES', code: 'ES', name: 'Spain', price: 'from $599' },
  { id: 'FR', code: 'FR', name: 'France', price: 'from $599' },
  { id: 'IT', code: 'IT', name: 'Italy', price: 'from $599' },
  { id: 'PL', code: 'PL', name: 'Poland', price: 'from $599' },
  { id: 'CZ', code: 'CZ', name: 'Czech Republic', price: 'from $599' },
  { id: 'RO', code: 'RO', name: 'Romania', price: 'from $599' },
  { id: 'BG', code: 'BG', name: 'Bulgaria', price: 'from $599' },
  { id: 'LU', code: 'LU', name: 'Luxembourg', price: 'from $599' },
  { id: 'TH', code: 'TH', name: 'Thailand', price: 'from $599' },
  { id: 'ID', code: 'ID', name: 'Indonesia', price: 'from $599' },
  { id: 'PH', code: 'PH', name: 'Philippines', price: 'from $599' },
  { id: 'NZ', code: 'NZ', name: 'New Zealand', price: 'from $599' },
  { id: 'SA', code: 'SA', name: 'Saudi Arabia', price: 'from $599' },
  { id: 'QA', code: 'QA', name: 'Qatar', price: 'from $599' },
  { id: 'BH', code: 'BH', name: 'Bahrain', price: 'from $599' },
  { id: 'MX', code: 'MX', name: 'Mexico', price: 'from $599' },
  { id: 'BR', code: 'BR', name: 'Brazil', price: 'from $599' },
  { id: 'PE', code: 'PE', name: 'Peru', price: 'from $599' },
  { id: 'CL', code: 'CL', name: 'Chile', price: 'from $599' },
  { id: 'CO', code: 'CO', name: 'Colombia', price: 'from $599' },
  { id: 'UY', code: 'UY', name: 'Uruguay', price: 'from $599' },
  { id: 'MU', code: 'MU', name: 'Mauritius', price: 'from $599' },
  { id: 'VG', code: 'VG', name: 'British Virgin Islands', price: 'from $599' },
  { id: 'KY', code: 'KY', name: 'Cayman Islands', price: 'from $599' },
  { id: 'BZ', code: 'BZ', name: 'Belize', price: 'from $599' },
  { id: 'SC', code: 'SC', name: 'Seychelles', price: 'from $599' },
  { id: 'BB', code: 'BB', name: 'Barbados', price: 'from $599' },
];

const usStates = [
  { code: "WY", name: "Wyoming", tag: "Best value", snippet: "Lowest running costs with no income tax.", govtFees: { formation: 100 }, timeline: "3–5 days", popularityRank: 1 },
  { code: "DE", name: "Delaware", tag: "Top pick", snippet: "VCs insist on. Court of Chancery.", govtFees: { formation: 160 }, timeline: "5–7 days", popularityRank: 2 },
  { code: "NM", name: "New Mexico", tag: "No annual fee", snippet: "File once and it stays active.", govtFees: { formation: 50 }, timeline: "4–6 days", popularityRank: 3 },
  { code: "FL", name: "Florida", tag: "Popular", snippet: "Fast processing and no income tax.", govtFees: { formation: 125 }, timeline: "4–6 days" },
  { code: "TX", name: "Texas", tag: null, snippet: "Second-largest US economy.", govtFees: { formation: 310 }, timeline: "5–8 days" },
  { code: "NV", name: "Nevada", tag: null, snippet: "Strong privacy statutes.", govtFees: { formation: 75 }, timeline: "5–7 days" },
  { code: "CA", name: "California", tag: null, snippet: "$800 franchise tax.", govtFees: { formation: 90 }, timeline: "7–12 days" },
  { code: "NY", name: "New York", tag: null, snippet: "Financial-sector credibility.", govtFees: { formation: 275 }, timeline: "7–10 days" },
  { code: "KY", name: "Kentucky", tag: "Lowest state fee", snippet: "Cheapest route.", govtFees: { formation: 40 }, timeline: "4–7 days" },
  { code: "OH", name: "Ohio", tag: null, snippet: "No annual report.", govtFees: { formation: 99 }, timeline: "4–7 days" },
  { code: "CO", name: "Colorado", tag: null, snippet: "$50 to form.", govtFees: { formation: 50 }, timeline: "3–5 days" },
  { code: "MT", name: "Montana", tag: null, snippet: "No sales tax.", govtFees: { formation: 70 }, timeline: "4–7 days" },
  { code: "AZ", name: "Arizona", tag: null, snippet: "Publication required.", govtFees: { formation: 50 }, timeline: "4–7 days" },
  { code: "ND", name: "North Dakota", tag: null, snippet: "Energy sector.", govtFees: { formation: 135 }, timeline: "5–9 days" },
  { code: "SD", name: "South Dakota", tag: null, snippet: "No corporate income tax.", govtFees: { formation: 18 }, timeline: "3–5 days" },
];

export default function RegisterJurisdictionScreen({ navigation, route }) {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [searchText, setSearchText] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const baseFiltered = searchText.trim()
    ? allCountries.filter(c => c.name.toLowerCase().includes(searchText.toLowerCase()) || c.code.toLowerCase().includes(searchText.toLowerCase()))
    : allCountries;
  const filteredCountries = selectedCountry ? baseFiltered.filter(c => c.id === selectedCountry) : baseFiltered;

  const handleContinue = () => {
    const stateName = usStates.find(s => (s.code||s.id) === selectedState)?.name || selectedState;
    const payload = { ...(route?.params || {}), selectedState: stateName || (selectedCountry !== 'US' ? selectedCountry : null), selectedCountry };
    console.log('=== REGISTER JURISDICTION -> CompanyNaming ===', JSON.stringify(payload, null, 2));
    navigation.navigate('CompanyNaming', payload);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0E1A" />
      <View style={styles.header}>
        <BackButton onPress={() => { if (navigation.canGoBack()) navigation.goBack(); else navigation.navigate('RegistrationLanding'); }} />
        <Image source={logoR} style={styles.topLogo} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <Text style={styles.title}>
          Where would you like to <Text style={styles.titleItalic}>register?</Text>
        </Text>
        <Text style={styles.subtitle}>
          Search 50 jurisdictions, or let us recommend one.
        </Text>

        <TouchableOpacity style={styles.recommendCard} activeOpacity={0.8} onPress={() => navigation.navigate('CompanyPurpose', { ...(route?.params||{}), advisorFlow: true })}>
          <View style={styles.recommendHeader}>
            <View style={styles.starIconContainer}>
              <Text style={styles.starIcon}>★</Text>
            </View>
            <View style={styles.recommendTextContainer}>
              <Text style={styles.recommendTitle}>Not sure which country?</Text>
              <Text style={styles.recommendDesc}>
                Answer 4 questions and we'll shortlist the best jurisdictions for your situation.
              </Text>
            </View>
            <Text style={styles.arrowIcon}>›</Text>
          </View>
          <View style={styles.tagsRow}>
            <View style={styles.tag}><Text style={styles.tagText}>⏱ 60 seconds</Text></View>
            <View style={styles.tag}><Text style={styles.tagText}>Tax & cost aware</Text></View>
            <View style={styles.tag}><Text style={styles.tagText}>Free - no signup</Text></View>
          </View>
        </TouchableOpacity>

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Or search by country name..."
            placeholderTextColor="#64748B"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={18} color="#475569" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionHeader}>{selectedCountry ? 'SELECTED COUNTRY' : searchText.trim() ? `SEARCH RESULTS (${filteredCountries.length})` : 'MOST POPULAR'}</Text>
          {selectedCountry && (
            <TouchableOpacity onPress={() => { setSelectedCountry(null); setSelectedState(null); }}>
              <Text style={styles.changeText}>Change</Text>
            </TouchableOpacity>
          )}
        </View>
        {filteredCountries.length === 0 ? (
          <Text style={{ color: '#64748B', fontSize: 12, paddingVertical: s(12), marginBottom: s(20) }}>No countries found for "{searchText}"</Text>
        ) : (
          <View style={[styles.countryList, { marginBottom: s(20) }]}>
            {filteredCountries.map((item) => {
              const isSelected = selectedCountry === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.countryCardList, isSelected && styles.countryCardSelected]}
                  activeOpacity={0.8}
                  onPress={() => {
                    if (isSelected) { setSelectedCountry(null); setSelectedState(null); }
                    else { setSelectedCountry(item.id); setSelectedState(null); }
                  }}
                >
                  <View style={styles.countryLeft}>
                    <View style={styles.countryCodeCircle}>
                      <Text style={styles.countryCodeTextList}>{item.code}</Text>
                    </View>
                    <View>
                      <Text style={[styles.countryNameList, isSelected && styles.goldText]}>{item.name}</Text>
                      <Text style={styles.countryPriceList}>{item.price}</Text>
                    </View>
                  </View>
                  {isSelected ? (
                    <View style={styles.checkmarkBadgeList}><Ionicons name="checkmark" size={12} color="#060913" /></View>
                  ) : (
                    <View style={styles.radioOuter} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {selectedCountry && (
          <>
            <View style={styles.stateHeaderRow}>
              <Ionicons name="chevron-down" size={14} color="#475569" />
              <Text style={styles.sectionHeader}>  {selectedCountry === 'US' ? 'SELECT US STATE' : `SELECT STATE / REGION - ${selectedCountry}`}</Text>
            </View>
            {selectedCountry === 'US' ? (
              <View style={styles.stateGrid}>
                {usStates.map((state) => {
                  const stateId = state.code || state.id;
                  const isSelected = selectedState === stateId;
                  const isGreenTag = state.popularityRank === 1 || state.tag === 'Top pick' || state.tag === 'Lowest cost' || state.tag === 'No annual fee';
                  const desc = state.snippet || '';
                  const price = state.govtFees?.formation != null ? `$${state.govtFees.formation}` : `$${state.serviceFee || 299}`;
                  const duration = state.timeline;
                  return (
                    <TouchableOpacity
                      key={stateId}
                      style={[styles.stateCard, isSelected && styles.stateCardSelected]}
                      activeOpacity={0.8}
                      onPress={() => setSelectedState(stateId)}
                    >
                      <View style={styles.stateTitleRow}>
                        <Text style={styles.stateName}>{state.name}</Text>
                        {state.tag && (
                          <View style={[styles.tagBadge, isGreenTag ? styles.greenTag : styles.blueTag]}>
                            <Text style={[styles.tagTextSmall, isGreenTag ? styles.greenTagText : styles.blueTagText]}>{state.tag}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.stateDesc} numberOfLines={3}>{desc}</Text>
                      <View style={styles.stateFooterRow}>
                        <Text style={styles.statePrice}>{price}</Text>
                        <Text style={styles.stateDuration}>{duration}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View style={styles.noStateBox}>
                <Ionicons name="information-circle-outline" size={14} color="#64748B" />
                <Text style={styles.noStateText}>No state selection needed for {allCountries.find(c => c.id === selectedCountry)?.name}. Continue directly.</Text>
              </View>
            )}
          </>
        )}
        </Animated.View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.submitButton, !selectedCountry && styles.submitButtonDisabled, selectedCountry === 'US' && !selectedState && styles.submitButtonDisabled]}
          activeOpacity={0.8}
          disabled={!selectedCountry || (selectedCountry === 'US' && !selectedState)}
          onPress={handleContinue}
        >
          <Text style={[styles.submitButtonText, (!selectedCountry || (selectedCountry === 'US' && !selectedState)) && styles.submitButtonTextDisabled]}>
            {!selectedCountry ? 'Select a country to continue' : selectedCountry === 'US' && !selectedState ? 'Select a state to continue' : `Continue with ${usStates.find(s => (s.code||s.id) === selectedState)?.name || selectedState || allCountries.find(c=>c.id===selectedCountry)?.name}  →`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E1A' },
  topLogo: { width: 150, height: 38, resizeMode: 'contain', marginTop: s(10) },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: s(8), paddingHorizontal: s(16), paddingVertical: s(12), marginTop: s(24) },
  scrollContent: { paddingHorizontal: s(20), paddingBottom: s(90) },
  title: { fontSize: font.display, fontWeight: '400', color: '#FFFFFF', marginTop: s(8) },
  titleItalic: { fontStyle: 'italic', color: '#D1A253', fontWeight: '300' },
  subtitle: { fontSize: 14, color: '#94A3B8', marginTop: s(6), marginBottom: s(20) },
  recommendCard: { backgroundColor: '#131A2E', borderRadius: 16, borderWidth: 1, borderColor: '#263352', padding: s(16), marginBottom: s(16) },
  recommendHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  starIconContainer: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#251E3E', alignItems: 'center', justifyContent: 'center', marginRight: s(12) },
  starIcon: { color: '#A855F7', fontSize: 18 },
  recommendTextContainer: { flex: 1 },
  recommendTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold', marginBottom: s(4) },
  recommendDesc: { color: '#94A3B8', fontSize: 12, lineHeight: 16 },
  arrowIcon: { color: '#64748B', fontSize: 20, marginLeft: s(8) },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: s(14), gap: s(6) },
  tag: { backgroundColor: '#1E293B', paddingHorizontal: s(10), paddingVertical: s(5), borderRadius: 6 },
  tagText: { color: '#94A3B8', fontSize: 11 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#131A2E', borderRadius: 12, borderWidth: 1, borderColor: '#1E293B', paddingHorizontal: s(12), height: 48, marginBottom: s(24) },
  searchIcon: { fontSize: 14, marginRight: s(8) },
  searchInput: { flex: 1, color: '#FFFFFF', fontSize: 14 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: s(12) },
  sectionHeader: { color: '#475569', fontSize: 10, fontWeight: 'bold', letterSpacing: 1.2, marginBottom: s(12) },
  changeText: { color: '#C9A84C', fontSize: 11, fontWeight: '700' },
  countryList: { flexDirection: 'column', gap: 8 },
  countryCardList: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: 14, paddingVertical: s(12), paddingHorizontal: s(14), borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  countryCardSelected: { borderColor: '#C9A84C', backgroundColor: 'rgba(201, 168, 76, 0.04)' },
  countryLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  countryCodeCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(201,168,76,0.12)', borderWidth: 1, borderColor: 'rgba(201,168,76,0.2)', alignItems: 'center', justifyContent: 'center' },
  countryCodeTextList: { color: '#CBD5E1', fontSize: 12, fontWeight: '700' },
  countryNameList: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  countryPriceList: { color: '#64748B', fontSize: 11, marginTop: s(2) },
  goldText: { color: '#C9A84C' },
  checkmarkBadgeList: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#C9A84C', alignItems: 'center', justifyContent: 'center' },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  stateHeaderRow: { flexDirection: 'row', alignItems: 'center', marginTop: s(8), marginBottom: s(12) },
  noStateBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: s(12), borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', marginBottom: s(10) },
  noStateText: { color: '#64748B', fontSize: 11, flex: 1, lineHeight: 16 },
  stateGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  stateCard: { width: '48.5%', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: 14, padding: s(12), borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', marginBottom: s(10), justifyContent: 'space-between', minHeight: 110 },
  stateCardSelected: { borderColor: '#C9A84C', backgroundColor: 'rgba(201, 168, 76, 0.03)' },
  stateTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: s(6) },
  stateName: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  tagBadge: { paddingHorizontal: s(6), paddingVertical: s(2), borderRadius: 10 },
  greenTag: { backgroundColor: 'rgba(16, 185, 129, 0.15)' },
  greenTagText: { color: '#10B981' },
  blueTag: { backgroundColor: 'rgba(59, 130, 246, 0.15)' },
  blueTagText: { color: '#60A5FA' },
  tagTextSmall: { fontSize: 8, fontWeight: '600' },
  stateDesc: { color: '#64748B', fontSize: 9.5, lineHeight: 13, marginBottom: s(10) },
  stateFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statePrice: { color: '#C9A84C', fontSize: 11, fontWeight: 'bold' },
  stateDuration: { color: '#475569', fontSize: 9 },
  bottomBar: { paddingHorizontal: s(16), paddingVertical: s(12), backgroundColor: '#0A0E1A', borderTopWidth: 1, borderTopColor: '#1E293B' },
  submitButton: { backgroundColor: '#D1A253', borderRadius: 24, height: 50, alignItems: 'center', justifyContent: 'center' },
  submitButtonDisabled: { backgroundColor: '#1E293B', opacity: 0.6 },
  submitButtonText: { color: '#0A0E1A', fontSize: 15, fontWeight: 'bold' },
  submitButtonTextDisabled: { color: '#64748B' },
});
