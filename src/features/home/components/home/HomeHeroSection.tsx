import { Pressable, StyleSheet, Text, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import type { CompanyCardItem } from '../../screens/quickAccess/CompanyCard';
import { font } from '../../../../theme/typography';
import { useThemeColors } from '../../../../theme/colors';

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
  const colors = useThemeColors();
  const isLight = colors.mode === 'light';
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

  const dynamicStyles = {
    backgroundColor: isLight ? '#fff' : 'rgba(255,255,255,0.07)',
  };
  const heroDecoStyle = { 
    borderColor: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.07)', 
    backgroundColor: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)' 
  }
  const heroDecoSmallStyle = { borderColor: isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.1)', backgroundColor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)' }
  const heroEyebrowStyle = { color: isLight ? colors.accent : '#85B7EB' }
  const heroCompanySwitcherStyle = { borderColor: isLight ? '#cbd5e1' : 'rgba(255,255,255,0.12)', backgroundColor: isLight ? colors.background : 'rgba(255,255,255,0.06)' }
  const heroCompanyStyle = { color: isLight ? '#111827' : '#ffffff' }
  const heroSwitchIconStyle = { borderColor: isLight ? '#cbd5e1' : 'rgba(255,255,255,0.15)', backgroundColor: isLight ? colors.surfaceAlt : 'rgba(255,255,255,0.12)' }
  const heroMetaStyle = { color: isLight ? '#475569' : '#85B7EB' }
  const heroTileStyle = { borderColor: isLight ? '#cbd5e1' : 'rgba(255,255,255,0.1)', backgroundColor: isLight ? colors.background : 'rgba(255,255,255,0.07)' }
  const heroTileLabelStyle = { color: isLight ? '#475569' : '#85B7EB' }
  return (
    <View style={[styles.hero, dynamicStyles]}>
      <View style={[styles.heroDeco, heroDecoStyle]} />
      <View style={[styles.heroDecoSmall, heroDecoSmallStyle]}>
        <FontAwesome name="flag" size={20} color={isLight ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.25)'} />
      </View>
      <View style={styles.heroLocationRow}>
        <FontAwesome name="map-marker" size={11} color={isLight ? colors.accent : '#85B7EB'} />
        <Text style={[styles.heroEyebrow, heroEyebrowStyle ]}>{heroCompanyCountry}</Text>
        <View style={{ flex: 1 }} />
      </View>
      <Pressable
        onPress={onCompanySwitcherPress}
        style={[styles.heroCompanySwitcher, heroCompanySwitcherStyle]}>
        <Text numberOfLines={1} style={[styles.heroCompany, heroCompanyStyle ]}>
          {heroCompanyName}
        </Text>
        <View style={[styles.heroSwitchIcon, heroSwitchIconStyle]}>
          <FontAwesome name="exchange" size={11} color={isLight ? colors.text : '#ffffff'} />
        </View>
      </Pressable>
      <Text style={[styles.heroMeta, heroMetaStyle]}>
        {heroCompanyType}  -  EIN{' '}
        <Text style={styles.heroMetaAccent}>{heroCompanyEin}</Text>  -  Added {heroCompanyDate}
      </Text>
      <View style={styles.heroStats}>

        <View style={[styles.heroTile, heroTileStyle]}>
          <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.heroTileNumber, styles.heroTileWarn]}>
            {heroCompanyStatus}
          </Text>
          <Text style={[styles.heroTileLabel, heroTileLabelStyle]}>Company status</Text>
        </View>
        <Pressable onPress={onManagePress} style={[styles.heroTile, { borderColor: isLight ? '#cbd5e1' : 'rgba(255,255,255,0.1)', backgroundColor: isLight ? colors.background : 'rgba(255,255,255,0.07)' }]}>
          <FontAwesome name="cog" size={22} color={isLight ? colors.accent : '#85B7EB'} style={{ marginBottom: 0 }} />
          <Text style={[styles.heroTileLabel, heroTileLabelStyle]}>Manage Company</Text>
        </Pressable>
        <Pressable onPress={onCompanyInfoPress} style={[styles.heroTile, { borderColor: isLight ? '#cbd5e1' : 'rgba(255,255,255,0.1)', backgroundColor: isLight ? colors.background : 'rgba(255,255,255,0.07)' }]}>
          <FontAwesome name="info-circle" size={22} color={isLight ? '#dc2626' : '#F09595'} style={{ marginBottom: 0 }} />
          <Text style={[styles.heroTileLabel, heroTileLabelStyle]}>Company Details</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    overflow: 'hidden',
    borderRadius: 16,
    backgroundColor: '#0D2137',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    marginTop: -8,

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
    fontSize: font.sm,
    fontWeight: '500',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  heroCompany: {
    flex: 1,
    color: '#ffffff',
    fontSize: font.heading,
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
    fontSize: font.sm,
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
    fontSize: font.xxl,
    fontWeight: '500',
    lineHeight: 23,
  },
  heroTileWarn: {
    color: '#FAC775',
  },
  heroTileDanger: {
    color: '#F09595',
  },
  heroTileLabel: {
    fontSize: font.base,
    lineHeight: 14,
    marginTop: 3,
  },
});

export default HomeHeroSection;
