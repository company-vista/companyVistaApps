import { Pressable, StyleSheet, Text, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { font } from '../../../../theme/typography';
import { useThemeColors } from '../../../../theme/colors';

function HomeHeroSection({ isLoadingCompanies = false, onCompanyInfoPress, onCompanySwitcherPress, onManagePress, selectedCompany, }) {
    const colors = useThemeColors();
    const isLight = colors.mode === 'light';
    const heroCompanyName = selectedCompany?.name ?? (isLoadingCompanies ? 'Loading company...' : 'No company available');
    const heroCompanyCountry = selectedCompany?.countryOfIncorporation ?? (isLoadingCompanies ? 'Fetching profile' : 'Company profile');
    const heroCompanyEin = selectedCompany?.ein ?? 'Not available';
    const heroCompanyFormationDate = selectedCompany?.formationDate ?? 'Not available';
    const heroCompanyState = selectedCompany?.state ?? 'Not available';
    const heroCompanyStatus = selectedCompany?.status ?? (isLoadingCompanies ? 'Loading' : 'Not available');
    const heroCompanyDate = selectedCompany?.date ?? 'Not available';
    const dynamicStyles = {
        backgroundColor: isLight ? '#fff' : 'rgba(255,255,255,0.08)',
        borderWidth: isLight ? 0 : 1,
        borderColor: 'rgba(255,255,255,0.1)',
    };
    const heroEyebrowStyle = { color: isLight ? colors.accent : '#85B7EB' };
    const heroCompanySwitcherStyle = { borderColor: isLight ? '#cbd5e1' : 'rgba(255,255,255,0.12)', backgroundColor: 'transparent' };
    const heroCompanyStyle = { color: isLight ? '#111827' : '#ffffff' };
    const heroSwitchIconStyle = { borderColor: isLight ? '#cbd5e1' : 'rgba(255,255,255,0.15)', backgroundColor: isLight ? colors.surfaceAlt : 'rgba(255,255,255,0.12)' };
    const heroMetaStyle = { color: isLight ? '#475569' : '#85B7EB' };
    const heroTileStyle = { borderColor: isLight ? '#cbd5e1' : 'rgba(255,255,255,0.1)', backgroundColor: isLight ? colors.background : 'rgba(255,255,255,0.07)' };
    const heroTileLabelStyle = { color: isLight ? '#475569' : '#85B7EB' };
    return (<View style={[styles.hero, dynamicStyles]}>
      <View style={styles.heroLocationRow}>
        <FontAwesome name="map-marker" size={16} color={isLight ? colors.accent : '#85B7EB'}/>
        <Text style={[styles.heroEyebrow, heroEyebrowStyle]}>{heroCompanyCountry}</Text>
        <View style={{ flex: 1 }}/>
        <Text style={[styles.heroAdded, heroMetaStyle]}>Company Created: {heroCompanyDate}</Text>
      </View>
      <Pressable onPress={onCompanySwitcherPress} style={[styles.heroCompanySwitcher, heroCompanySwitcherStyle]}>
        <Text numberOfLines={1} style={[styles.heroCompany, heroCompanyStyle]}>
          {heroCompanyName}
        </Text>
        <View style={[styles.heroSwitchIcon, heroSwitchIconStyle]}>
          <FontAwesome name="exchange" size={16} color={isLight ? colors.text : '#ffffff'}/>
        </View>
      </Pressable>
      <View style={styles.heroMetaRow}>
        <View style={styles.heroMetaCol}>
          <Text style={[styles.heroMetaLabel, heroMetaStyle]}>EIN</Text>
          <Text numberOfLines={1} adjustsFontSizeToFit style={styles.heroMetaValue}>
            {heroCompanyEin}
          </Text>
        </View>
        <View style={styles.heroMetaDivider}/>
        <View style={styles.heroMetaCol}>
          <Text style={[styles.heroMetaLabel, heroMetaStyle]}>Formation</Text>
          <Text numberOfLines={1} adjustsFontSizeToFit style={styles.heroMetaValue}>
            {heroCompanyFormationDate}
          </Text>
        </View>
        <View style={styles.heroMetaDivider}/>
        <View style={styles.heroMetaCol}>
          <Text style={[styles.heroMetaLabel, heroMetaStyle]}>State</Text>
          <Text numberOfLines={1} adjustsFontSizeToFit style={styles.heroMetaValue}>
            {heroCompanyState}
          </Text>
        </View>
      </View>
      <View style={styles.heroStats}>

        <View style={[styles.heroTile, heroTileStyle, styles.heroTileRow]}>
          <FontAwesome name={heroCompanyStatus === 'Active' ? 'check-circle' : 'exclamation-circle'} size={22} color={heroCompanyStatus === 'Active' ? '#34D399' : '#F09595'}/>
          <View style={styles.heroTileText}>
            <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.heroTileNumber, styles.heroTileWarn]}>
              {heroCompanyStatus}
            </Text>
            <Text style={[styles.heroTileLabel, heroTileLabelStyle]}>Status</Text>
          </View>
        </View>
        <Pressable onPress={onManagePress} style={[styles.heroTile, { borderColor: isLight ? '#cbd5e1' : 'rgba(255,255,255,0.1)', backgroundColor: isLight ? colors.background : 'rgba(255,255,255,0.07)' }, styles.heroTileRow]}>
          <FontAwesome name="cog" size={22} color={isLight ? colors.accent : '#85B7EB'}/>
          <Text style={[styles.heroTileLabel, heroTileLabelStyle]}>Manage</Text>
        </Pressable>
        <Pressable onPress={onCompanyInfoPress} style={[styles.heroTile, { borderColor: isLight ? '#cbd5e1' : 'rgba(255,255,255,0.1)', backgroundColor: isLight ? colors.background : 'rgba(255,255,255,0.07)' }, styles.heroTileRow]}>
          <FontAwesome name="info-circle" size={22} color={isLight ? '#dc2626' : '#F09595'}/>
          <Text style={[styles.heroTileLabel, heroTileLabelStyle]}>Details</Text>
        </Pressable>
      </View>
    </View>);
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
    heroAdded: {
        fontSize: font.sm,
        fontWeight: '600',
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
        marginTop: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        borderRadius: 10,
        backgroundColor: 'transparent',
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
    heroMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    heroMetaCol: {
        flex: 1,
        alignItems: 'center',
    },
    heroMetaDivider: {
        width: 1,
        height: 26,
        backgroundColor: 'rgba(255,255,255,0.15)',
    },
    heroMetaLabel: {
        fontSize: font.xs,
        letterSpacing: 0.6,
        textTransform: 'uppercase',
    },
    heroMetaValue: {
        color: '#FAC775',
        fontSize: font.sm,
        fontWeight: '500',
        marginTop: 2,
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
        paddingHorizontal: 8,
        paddingVertical: 9,
    },
    heroTileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    heroTileText: {
        flex: 1,
    },
    heroTileNumber: {
        color: '#ffffff',
        fontSize: font.base,
        fontWeight: '500',
        lineHeight: 18,
    },
    heroTileWarn: {
        color: '#e99c21',
    },
    heroTileDanger: {
        color: '#F09595',
    },
    heroTileLabel: {
        fontSize: font.xs,
        lineHeight: 13,
        marginTop: 0,
    },
});
export default HomeHeroSection;
