import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeColors } from '../../../../theme/colors';
import { BackButton } from '../../../../components/buttons';

type Region = 'ALL' | 'AMERICAS' | 'EUROPE' | 'MEA' | 'APAC' | 'OFFSHORE';

interface Country {
  code: string;
  name: string;
  entityLabel: string;
  region: Exclude<Region, 'ALL'>;
}

const regionTabs: { id: Region; label: string }[] = [
  { id: 'ALL', label: 'ALL' },
  { id: 'AMERICAS', label: 'AMERICAS' },
  { id: 'EUROPE', label: 'EUROPE' },
  { id: 'MEA', label: 'MIDDLE EAST & AFRICA' },
  { id: 'APAC', label: 'ASIA PACIFIC' },
  { id: 'OFFSHORE', label: 'OFFSHORE' },
];

const countries: Country[] = [
  { code: 'US', name: 'United States', entityLabel: 'LLC / C-Corp / S-Corp', region: 'AMERICAS' },
  { code: 'CA', name: 'Canada', entityLabel: 'Federal / Provincial Corporation', region: 'AMERICAS' },
  { code: 'MX', name: 'Mexico', entityLabel: 'S.A. de C.V. / S. de R.L.', region: 'AMERICAS' },
  { code: 'CR', name: 'Costa Rica', entityLabel: 'S.A. / S.R.L.', region: 'AMERICAS' },
  { code: 'GB', name: 'United Kingdom', entityLabel: 'Ltd / LLP / PLC', region: 'EUROPE' },
  { code: 'IE', name: 'Ireland', entityLabel: 'Private Limited Company', region: 'EUROPE' },
  { code: 'DE', name: 'Germany', entityLabel: 'GmbH / AG', region: 'EUROPE' },
  { code: 'NL', name: 'Netherlands', entityLabel: 'B.V. / N.V.', region: 'EUROPE' },
  { code: 'FR', name: 'France', entityLabel: 'SARL / SAS / SA', region: 'EUROPE' },
];

function RegionTab({
  label,
  active,
  onPress,
  colors,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  colors: ReturnType<typeof useThemeColors>;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.regionTab,
        { backgroundColor: colors.surface, borderColor: colors.border },
        active && { backgroundColor: '#e6a82a', borderColor: '#e6a82a' },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.regionTabText, { color: colors.subtle }, active && { color: '#1a1204' }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function CountryRow({
  country,
  selected,
  onSelect,
  colors,
}: {
  country: Country;
  selected: boolean;
  onSelect: (code: string) => void;
  colors: ReturnType<typeof useThemeColors>;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.countryCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
        selected && { borderColor: '#e6a82a', backgroundColor: colors.surfaceAlt },
      ]}
      onPress={() => onSelect(country.code)}
      activeOpacity={0.8}
    >
      <View style={styles.countryLeft}>
        <Text style={[styles.countryCode, selected && { color: '#e6a82a' }]}>
          {country.code}
        </Text>
        <View>
          <Text style={[styles.countryName, { color: colors.text }]}>{country.name}</Text>
          <Text style={[styles.countryEntity, { color: colors.subtle }]}>{country.entityLabel}</Text>
        </View>
      </View>
      {selected ? (
        <View style={styles.checkCircle}>
          <Text style={styles.checkMark}>✓</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

type JurisdictionSelectionScreenProps = {
  onBackPress: () => void;
};

export default function JurisdictionSelectionScreen({ onBackPress }: JurisdictionSelectionScreenProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const colors = useThemeColors();
  const [search, setSearch] = useState('');
  const [activeRegion, setActiveRegion] = useState<Region>('ALL');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(
    countries.find((c) => c.code === 'CR') ?? null
  );

  const inputBg = colors.mode === 'dark' ? colors.inputBackground : colors.surfaceAlt;

  const filteredCountries = useMemo(() => {
    return countries.filter((country) => {
      const matchesRegion = activeRegion === 'ALL' || country.region === activeRegion;
      const matchesSearch = country.name.toLowerCase().includes(search.toLowerCase());
      return matchesRegion && matchesSearch;
    });
  }, [activeRegion, search]);

  const handleContinue = () => {
    // Hook up navigation to the next step here
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: safeAreaInsets.top }]}>
        <BackButton onPress={onBackPress} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>Add Company</Text>
      </View>

      <View style={styles.body}>
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.title, { color: colors.text }]}>
            Where would you like to <Text style={styles.titleAccent}>register</Text> your company?
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Search or browse by region. Your selection determines the rest of this form.
          </Text>

          <View style={[styles.searchWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
            <Text style={styles.searchIcon}>{'\u{1F50D}'}</Text>
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              value={search}
              onChangeText={setSearch}
              placeholder="Search countries..."
              placeholderTextColor={colors.inputPlaceholder}
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.regionScroll}
            contentContainerStyle={styles.regionScrollContent}
          >
            {regionTabs.map((tab) => (
              <RegionTab
                key={tab.id}
                label={tab.label}
                active={activeRegion === tab.id}
                onPress={() => setActiveRegion(tab.id)}
                colors={colors}
              />
            ))}
          </ScrollView>

          {filteredCountries.map((item) => (
            <CountryRow
              key={item.code}
              country={item}
              selected={selectedCountry?.code === item.code}
              onSelect={(code) => setSelectedCountry(countries.find((c) => c.code === code) ?? null)}
              colors={colors}
            />
          ))}
        </ScrollView>

        {selectedCountry ? (
          <View style={[styles.banner, { backgroundColor: 'rgba(230,168,42,0.08)', borderColor: '#6b5320' }]}>
            <Text style={styles.bannerIcon}>{'\u2139'}</Text>
            <Text style={[styles.bannerText, { color: colors.text }]}>
              Registering in <Text style={styles.bannerHighlight}>{selectedCountry.name}</Text>.
              Continue to enter entity details.
            </Text>
          </View>
        ) : null}

        <View style={[styles.footerRow, { paddingBottom: safeAreaInsets.bottom + 8 }]}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={onBackPress}
            activeOpacity={0.8}
          >
            <Text style={[styles.backButtonText, { color: colors.muted }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.stepText, { color: colors.subtle }]}>Step 2 of 10</Text>
          <TouchableOpacity
            style={[styles.continueButton, !selectedCountry && styles.continueButtonDisabled]}
            onPress={handleContinue}
            activeOpacity={0.85}
            disabled={!selectedCountry}
          >
            <Text style={styles.continueButtonText}>Continue →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  body: {
    flex: 1,
    padding: 16,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 21,
    marginBottom: 4,
  },
  titleAccent: {
    color: '#e6a82a',
    fontStyle: 'italic',
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 12,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    fontSize: 13,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    paddingVertical: 12,
  },
  regionScroll: {
    marginBottom: 12,
    flexGrow: 0,
  },
  regionScrollContent: {
    gap: 4,
    paddingRight: 8,
  },
  regionTab: {
    borderWidth: 0.5,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
  },
  regionTabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  countryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 0.5,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  countryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  countryCode: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6f7480',
    width: 22,
  },
  countryName: {
    fontSize: 12,
    fontWeight: '500',
  },
  countryEntity: {
    fontSize: 9,
  },
  checkCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#e6a82a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    fontSize: 10,
    color: '#1a1204',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 0.5,
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  bannerIcon: {
    fontSize: 14,
  },
  bannerText: {
    flex: 1,
    fontSize: 11,
  },
  bannerHighlight: {
    color: '#e6a82a',
    fontWeight: '500',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  backButtonText: {
    fontSize: 12,
  },
  stepText: {
    fontSize: 9,
  },
  continueButton: {
    backgroundColor: '#e6a82a',
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1a1204',
  },
});