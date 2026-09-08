import React, { useState } from 'react';
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
} from 'react-native';
import BackButton from '../../../components/buttons/BackButton';
import logoR from '../../../assets/images/logoR.png';
import { font } from '../../../theme/typography';

const JURISDICTIONS = [
  {
    id: 'us',
    code: 'US',
    name: 'United States',
    details: 'LLC · C-CORP · 51 states',
    price: 'from $339',
    timeline: '3–7 days',
  },
  {
    id: 'gb',
    code: 'GB',
    name: 'United Kingdom',
    details: 'LTD · LLP · PLC',
    price: '$720',
    timeline: '1–3 days',
  },
  {
    id: 'ae',
    code: 'AE',
    name: 'United Arab Emirates',
    details: 'FZ-LLC · FZE · 6 free zones',
    price: 'Priced on review',
    timeline: '5–10 days',
  },
  {
    id: 'sg',
    code: 'SG',
    name: 'Singapore',
    details: 'PTE · BRANCH · REP',
    price: 'Priced on review',
    timeline: '1–3 days',
  },
];

export default function RegisterJurisdictionScreen({ navigation }) {
  const [selectedId, setSelectedId] = useState(null);
  const [searchText, setSearchText] = useState('');

  const filteredJurisdictions = JURISDICTIONS.filter(item =>
    item.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0E1A" />
      
      {/* Top Header Navigation */}
      <View style={styles.header}>
        <BackButton onPress={() => { if (navigation.canGoBack()) navigation.goBack(); else navigation.navigate('RegistrationLanding'); }} />
        <Image source={logoR} style={styles.topLogo} />
      </View>



      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main Title & Description */}
        <Text style={styles.title}>
          Where would you like to <Text style={styles.titleItalic}>register?</Text>
        </Text>
        <Text style={styles.subtitle}>
          Search 50 jurisdictions, or let us recommend one.
        </Text>

        {/* Recommendation / Quiz Card */}
        <TouchableOpacity style={styles.recommendCard} activeOpacity={0.8} onPress={() => navigation.navigate('CompanyPurpose', { selectedJurisdiction: selectedId })}>
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
            <View style={styles.tag}>
              <Text style={styles.tagText}>⏱ 60 seconds</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Tax & cost aware</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Free - no signup</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Search Input Box */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Or search by country name..."
            placeholderTextColor="#64748B"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>MOST POPULAR</Text>
          <View style={styles.sectionDivider} />
        </View>

        {/* Jurisdiction List Cards */}
        {filteredJurisdictions.map(item => {
          const isSelected = selectedId === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.countryCard, isSelected && styles.countryCardSelected]}
              onPress={() => setSelectedId(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.codeBadge}>
                <Text style={styles.codeBadgeText}>{item.code}</Text>
              </View>

              <View style={styles.countryInfo}>
                <Text style={styles.countryName}>{item.name}</Text>
                <Text style={styles.countryDetails}>{item.details}</Text>
              </View>

              <View style={styles.priceContainer}>
                <Text style={styles.priceText}>{item.price}</Text>
                <Text style={styles.timelineText}>{item.timeline}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Bottom Sticky Action Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.submitButton, selectedId && styles.submitButtonActive]}
          activeOpacity={0.8}
          disabled={!selectedId}
          onPress={() => navigation.navigate('CountrySelection')}
        >
          <Text style={[styles.submitButtonText, selectedId && styles.submitButtonTextActive]}>
            {selectedId ? `Continue with ${JURISDICTIONS.find(j => j.id === selectedId)?.name}  →` : 'Select a country to continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  topLogo: { width: 150, height: 38, resizeMode: 'contain', marginTop: 10 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 24,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: 'bold',
  },
  brandContainer: {
    alignItems: 'center',
  },
  brandTitle: {
    color: '#D1A253',
    fontSize: 16,
    fontWeight: 'bold',
  },
  brandSubtitle: {
    color: '#64748B',
    fontSize: 8,
    letterSpacing: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    justifyContent: 'flex-start',
    gap: 8,
  },
  progressStep: {
    flex: 1,
    height: 3,
    backgroundColor: '#1E293B',
    marginHorizontal: 3,
    borderRadius: 2,
  },
  progressActive: {
    backgroundColor: '#D1A253',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: font.display,
    fontWeight: '400',
    color: '#FFFFFF',
    marginTop: 8,
  },
  titleItalic: {
    fontStyle: 'italic',
    color: '#D1A253',
    fontWeight: '300',
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 6,
    marginBottom: 20,
  },
  recommendCard: {
    backgroundColor: '#131A2E',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#263352',
    padding: 16,
    marginBottom: 16,
  },
  recommendHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  starIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#251E3E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  starIcon: {
    color: '#A855F7',
    fontSize: 18,
  },
  recommendTextContainer: {
    flex: 1,
  },
  recommendTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  recommendDesc: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 16,
  },
  arrowIcon: {
    color: '#64748B',
    fontSize: 20,
    marginLeft: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
    gap: 6,
  },
  tag: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  tagText: {
    color: '#94A3B8',
    fontSize: 11,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131A2E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 24,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginRight: 12,
  },
  sectionDivider: {
    flex: 1,
    height: 1,
    backgroundColor: '#1E293B',
  },
  countryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131A2E',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 14,
    marginBottom: 12,
  },
  countryCardSelected: {
    borderColor: '#D1A253',
    backgroundColor: '#172038',
  },
  codeBadge: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#0A0E1A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  codeBadgeText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: 'bold',
  },
  countryInfo: {
    flex: 1,
  },
  countryName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  countryDetails: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceText: {
    color: '#D1A253',
    fontSize: 13,
    fontWeight: 'bold',
  },
  timelineText: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0A0E1A',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  submitButton: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonActive: {
    backgroundColor: '#D1A253',
  },
  submitButtonText: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: 'bold',
  },
  submitButtonTextActive: {
    color: '#0A0E1A',
  },
});
