import { Pressable, StyleSheet, Text, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { font } from '../../../../theme/typography';
import { useThemeColors } from '../../../../theme/colors';
import { capitalizeCompanyName } from '../../../../constants/convertFirstChar';

function HomeHeroSection({ isLoadingCompanies = false, onCompanyInfoPress, onCompanySwitcherPress, onManagePress, onAddToCompanyPress, selectedCompany, }) {
  const colors = useThemeColors();
  const isLight = colors.mode === 'light';
  const heroCompanyName = capitalizeCompanyName(selectedCompany?.name) ?? (isLoadingCompanies ? 'Loading company...' : 'No company available');
  const heroCompanyCountry = selectedCompany?.countryOfIncorporation ?? (isLoadingCompanies ? 'Fetching profile' : 'Company profile');
  const heroCompanyEin = selectedCompany?.ein ?? 'Not available';
  const heroCompanyFormationDate = selectedCompany?.formationDate ?? 'Not available';
  const heroCompanyState = selectedCompany?.state ?? 'Not available';
  const heroCompanyStatus = selectedCompany?.status ?? (isLoadingCompanies ? 'Loading' : 'Not available');
  const heroCompanyDate = selectedCompany?.date ?? 'Not available';
  const isActive = String(heroCompanyStatus).trim().toLowerCase() === 'active';
  const cardStyle = {
    backgroundColor: isLight ? colors.cardHighlight : colors.cardElevated,
    borderWidth: isLight ? 0 : 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: isLight ? '#0D2137' : '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: isLight ? 0.08 : 0.2,
    shadowRadius: 12,
    elevation: 0,
  };
  const heroEyebrowStyle = { color: isLight ? colors.accent : '#85B7EB' };
  const heroCompanySwitcherStyle = { borderColor: isLight ? '#cbd5e1' : 'rgba(255,255,255,0.12)', backgroundColor: isLight ? '#F8FAFC' : 'rgba(255,255,255,0.06)' };
  const heroCompanyStyle = { color: isLight ? '#0F172A' : '#ffffff' };
  const heroSwitchIconStyle = { borderColor: isLight ? '#cbd5e1' : 'rgba(255,255,255,0.15)', backgroundColor: isLight ? colors.surfaceAlt : 'rgba(255,255,255,0.12)' };
  const heroMetaStyle = { color: isLight ? '#94A3B8' : '#85B7EB' };
  const heroMetaValueStyle = { color: isLight ? '#1E293B' : '#FAC775' };
  const heroStatusNumberStyle = {
    color: isActive
      ? (isLight ? '#047857' : '#34D399')
      : (isLight ? '#DC2626' : '#F09595'),
  };
  const heroTileStyle = { borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.1)', backgroundColor: isLight ? colors.background : 'rgba(255,255,255,0.07)' };
  const heroTileLabelStyle = { color: isLight ? '#64748B' : '#85B7EB' };
  const iconBubbleStyle = {
    backgroundColor: isLight ? colors.surfaceAlt : 'rgba(255,255,255,0.1)',
  };
  return (<View style={[styles.hero, cardStyle]}>
    <View style={styles.heroLocationRow}>
      <FontAwesome name="map-marker" size={13} color={isLight ? colors.accent : '#85B7EB'} />
      <Text style={[styles.heroEyebrow, heroEyebrowStyle]}>{heroCompanyCountry}</Text>
      <View style={{ flex: 1 }} />
      <Text style={[styles.heroAdded, heroMetaStyle]}>Created: {heroCompanyDate}</Text>
    </View>
    <Pressable onPress={onCompanySwitcherPress} style={[styles.heroCompanySwitcher, heroCompanySwitcherStyle]}>
      <Text numberOfLines={1} style={[styles.heroCompany, heroCompanyStyle]}>
        {capitalizeCompanyName(heroCompanyName)}
      </Text>
      <View style={[styles.heroSwitchIcon, heroSwitchIconStyle]}>
        <FontAwesome name="exchange" size={14} color={isLight ? colors.text : '#ffffff'} />
      </View>
    </Pressable>
    <View style={styles.heroMetaRow}>
      <View style={styles.heroMetaCol}>
        <Text style={[styles.heroMetaLabel, heroMetaStyle]}>EIN</Text>
        <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.heroMetaValue, heroMetaValueStyle]}>
          {heroCompanyEin}
        </Text>
      </View>
      <View style={[styles.heroMetaDivider, { backgroundColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.12)' }]} />
      <View style={styles.heroMetaCol}>
        <Text style={[styles.heroMetaLabel, heroMetaStyle]}>FORMATION DATE</Text>
        <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.heroMetaValue, heroMetaValueStyle]}>
          {heroCompanyFormationDate}
        </Text>
      </View>
      <View style={[styles.heroMetaDivider, { backgroundColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.12)' }]} />
      <View style={styles.heroMetaCol}>
        <Text style={[styles.heroMetaLabel, heroMetaStyle]}>STATE</Text>
        <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.heroMetaValue, heroMetaValueStyle]}>
          {heroCompanyState}
        </Text>
      </View>
    </View>
    <View style={styles.heroStats}>

      <Pressable onPress={onAddToCompanyPress} style={[styles.heroTile, heroTileStyle]}>
        <View style={[styles.heroIconBubble, iconBubbleStyle, { backgroundColor: isLight ? '#EFF6FF' : 'rgba(37,99,235,0.18)' }]}>
          <FontAwesome name="plus" size={14} color={isLight ? '#2563eb' : '#60A5FA'} />
        </View>
        <Text numberOfLines={1} style={[styles.heroTileValue, heroCompanyStyle]}>Add</Text>
        <Text numberOfLines={1} style={[styles.heroTileLabel, heroTileLabelStyle]}>Company</Text>
      </Pressable>
      <Pressable onPress={onManagePress} style={[styles.heroTile, heroTileStyle]}>
        <View style={[styles.heroIconBubble, iconBubbleStyle]}>
          <FontAwesome name="cog" size={16} color={isLight ? colors.accent : '#85B7EB'} />
        </View>
        <Text numberOfLines={1} style={[styles.heroTileValue, heroCompanyStyle]}>Manage</Text>
        <Text numberOfLines={1} style={[styles.heroTileLabel, heroTileLabelStyle]}>Company</Text>
      </Pressable>
      <Pressable onPress={onCompanyInfoPress} style={[styles.heroTile, heroTileStyle]}>
        <View style={[styles.heroIconBubble, iconBubbleStyle, { backgroundColor: isLight ? '#FEF2F2' : 'rgba(240,149,149,0.15)' }]}>
          <FontAwesome name="info-circle" size={16} color={isLight ? '#dc2626' : '#F09595'} />
        </View>
        <Text numberOfLines={1} style={[styles.heroTileValue, heroCompanyStyle]}>Details</Text>
        <Text numberOfLines={1} style={[styles.heroTileLabel, heroTileLabelStyle]}>Company</Text>
      </Pressable>
    </View>
  </View>);
}
const styles = StyleSheet.create({
  hero: {
    overflow: 'hidden',
    borderRadius: 18,
    backgroundColor: '#0D2137',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    marginTop: -14,
  },
  heroLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  heroEyebrow: {
    color: '#85B7EB',
    fontSize: font.sm,
    fontWeight: '600',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  heroAdded: {
    fontSize: font.sm,
    fontWeight: '500',
  },
  heroCompany: {
    flex: 1,
    color: '#ffffff',
    fontSize: font.heading,
    fontWeight: '600',
    lineHeight: 23,
  },
  heroCompanySwitcher: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  heroSwitchIcon: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  heroMetaCol: {
    flex: 1,
    alignItems: 'flex-start',
    marginLeft: 4,
  },
  heroMetaDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  heroMetaLabel: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  heroMetaValue: {
    color: '#FAC775',
    fontSize: font.sm,
    fontWeight: '600',
    marginTop: 3,
  },
  heroStats: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 14,
  },
  heroTile: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.07)',
    paddingHorizontal: 6,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  heroIconBubble: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  heroTileNumber: {
    color: '#ffffff',
    fontSize: font.base,
    fontWeight: '600',
    lineHeight: 18,
    textAlign: 'center',
  },
  heroTileValue: {
    color: '#ffffff',
    fontSize: font.base,
    fontWeight: '600',
    lineHeight: 18,
    textAlign: 'center',
  },
  heroTileLabel: {
    fontSize: font.xs,
    lineHeight: 13,
    textAlign: 'center',
    flexShrink: 1,
    marginTop: 0,
  },
});
export default HomeHeroSection;
