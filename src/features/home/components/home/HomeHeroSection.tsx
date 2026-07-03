import { Pressable, StyleSheet, Text, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import type { CompanyCardItem } from '../../screens/quickAccess/CompanyCard';

const BORDER_COLOR = '#4e46e5c2';

type HomeHeroSectionProps = {
  isLoadingCompanies?: boolean;
  onCompanyInfoPress: () => void;
  onCompanySwitcherPress: () => void;
  onManagePress: () => void;
  selectedCompany?: CompanyCardItem | null;
};

function HomeHeroSection({
  isLoadingCompanies = false,
  onCompanyInfoPress,
  onCompanySwitcherPress,
  onManagePress,
  selectedCompany,
}: HomeHeroSectionProps) {
  const heroCompanyName = selectedCompany?.name ?? (
    isLoadingCompanies ? 'Loading company...' : 'No company available'
  );
  const heroCompanyCountry =
    selectedCompany?.countryOfIncorporation ?? (
      isLoadingCompanies ? 'Fetching profile' : 'Company profile'
    );
  const heroCompanyType = selectedCompany?.companyType ?? 'Not available';
  const heroCompanyEin = selectedCompany?.ein ?? 'Not available';
  const heroCompanyStatus = selectedCompany?.status ?? (
    isLoadingCompanies ? 'Loading' : 'Not available'
  );
  const heroCompanyDate = selectedCompany?.date ?? 'Not available';

  return (
    <View style={[styles.hero, { borderColor: BORDER_COLOR }]}>
      <View style={styles.heroDeco} />
      <View style={styles.heroDecoSmall}>
        <FontAwesome name="flag" size={20} color="rgba(255,255,255,0.25)" />
      </View>
      <View style={styles.heroLocationRow}>
        <FontAwesome name="map-marker" size={11} color="#85B7EB" />
        <Text style={styles.heroEyebrow}>{heroCompanyCountry}</Text>
      </View>
      <Pressable
        onPress={onCompanySwitcherPress}
        style={styles.heroCompanySwitcher}>
        <Text numberOfLines={1} style={styles.heroCompany}>
          {heroCompanyName}
        </Text>
        <View style={styles.heroSwitchIcon}>
          <FontAwesome name="exchange" size={11} color="#ffffff" />
        </View>
      </Pressable>
      <Text style={styles.heroMeta}>
        {heroCompanyType}  -  EIN{' '}
        <Text style={styles.heroMetaAccent}>{heroCompanyEin}</Text>  -  Added {heroCompanyDate}
      </Text>
      <View style={styles.heroStats}>

        <View style={styles.heroTile}>
          <Text style={[styles.heroTileNumber, styles.heroTileWarn]}>
            {heroCompanyStatus}
          </Text>
          <Text style={styles.heroTileLabel}>Company status</Text>
        </View>
        <Pressable onPress={onManagePress} style={styles.heroTile}>
          <FontAwesome name="cog" size={22} color="#85B7EB" style={{ marginBottom: 0 }} />
          <Text style={styles.heroTileLabel}>Manage</Text>
        </Pressable>
        <Pressable onPress={onCompanyInfoPress} style={styles.heroTile}>
          <FontAwesome name="info-circle" size={22} color="#F09595" style={{ marginBottom: 0 }} />
          <Text style={styles.heroTileLabel}>Company Info</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    overflow: 'hidden',
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: '#0D2137',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
  },
  heroDeco: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    width: 100,
    height: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  heroDecoSmall: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 55,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  heroLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  heroEyebrow: {
    color: '#85B7EB',
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  heroCompany: {
    flex: 1,
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 23,
  },
  heroCompanySwitcher: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  heroSwitchIcon: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  heroMeta: {
    color: '#85B7EB',
    fontSize: 11,
    marginTop: 8,
  },
  heroMetaAccent: {
    color: '#FAC775',
    fontWeight: '500',
  },
  heroStats: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 13,
  },
  heroTile: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.07)',
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  heroTileNumber: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
  heroTileWarn: {
    color: '#FAC775',
  },
  heroTileDanger: {
    color: '#F09595',
  },
  heroTileLabel: {
    color: '#85B7EB',
    fontSize: 10,
    lineHeight: 13,
    marginTop: 3,
  },
});

export default HomeHeroSection;
