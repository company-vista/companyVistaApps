import { Pressable, StyleSheet, Text, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { font } from '../../../../theme/typography';
import { useThemeColors, themePalette, makeThemeStyles } from '../../../../theme/colors';
import { s } from '../../../../theme/responsive';
import { capitalizeCompanyName } from '../../../../constants/convertFirstChar';
import { isCompanyQuoted } from '../../../../utils/companyStatus';

function HomeHeroSection({ isLoadingCompanies = false, onCompanySwitcherPress, onAddToCompanyPress, onOrderPress, onRegistrationTrackingPress, onCompanyProfilePress, selectedCompany, }) {
  // quoted => Your Order, fixed => dashboard. isCompanyQuoted ek hi jagah ka
  // rule hai (backend ke 'quoted' ko priced-country price ke hisaab se theek karta hai).
  const isQuoted = selectedCompany ? isCompanyQuoted(selectedCompany) : false;
  const handleCompanyPress = () => {
    if (!selectedCompany) {
      (onAddToCompanyPress ?? onCompanySwitcherPress)?.();
      return;
    }
    if (isQuoted) {
      onOrderPress?.();
      return;
    }
    onCompanySwitcherPress?.();
  };
  const colors = useThemeColors();
  const isLight = colors.mode === 'light';
  const hasCompany = !!selectedCompany;
  const heroCompanyName = hasCompany ? (capitalizeCompanyName(selectedCompany?.name) ?? selectedCompany?.name) : (isLoadingCompanies ? 'Loading company...' : 'Register Company Now');
  const heroCompanyCountry = selectedCompany?.countryOfIncorporation ?? (isLoadingCompanies ? 'Fetching company...' : 'Not available');
  const heroCompanyEin = selectedCompany?.ein ?? 'Not available';
  const heroCompanyFormationDate = selectedCompany?.formationDate ?? 'Not available';
  const heroCompanyState = selectedCompany?.state ?? 'Not available';
  const heroCompanyStatus = selectedCompany?.status ?? (isLoadingCompanies ? 'Loading' : 'Not available');
  const heroCompanyDate = selectedCompany?.date ?? 'Not available';
  const isActive = String(heroCompanyStatus).trim().toLowerCase() === 'active';
  const cardStyle = {
    backgroundColor: isLight ? colors.cardHighlight : themePalette.hex_121e2d,
    borderWidth: 1,
    borderColor: isLight ? colors.border : themePalette.hex_1e3048,
    shadowColor: isLight ? themePalette.hex_0d2137 : themePalette.hex_000000,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: isLight ? 0.08 : 0.2,
    shadowRadius: 12,
    elevation: 0,
  };
  const heroEyebrowStyle = { color: isLight ? colors.accent : themePalette.hex_85b7eb };
  const heroCompanySwitcherStyle = { borderColor: isLight ? themePalette.hex_cbd5e1 : themePalette.rgba_255_255_255_0_12, backgroundColor: isLight ? themePalette.hex_f8fafc : themePalette.rgba_255_255_255_0_06 };
  const heroCompanyStyle = { color: isLight ? themePalette.hex_0f172a : themePalette.hex_ffffff };
  const heroSwitchIconStyle = { borderColor: isLight ? themePalette.hex_cbd5e1 : themePalette.rgba_255_255_255_0_15, backgroundColor: isLight ? colors.surfaceAlt : themePalette.rgba_255_255_255_0_12 };
  const heroMetaStyle = { color: isLight ? themePalette.hex_94a3b8 : themePalette.hex_85b7eb };
  const heroMetaValueStyle = { color: isLight ? themePalette.hex_1e293b : themePalette.hex_fac775 };
  const heroActionStyle = {
    borderColor: isLight ? themePalette.hex_e2e8f0 : themePalette.rgba_255_255_255_0_12,
    backgroundColor: isLight ? colors.background : themePalette.rgba_255_255_255_0_07,
  };
  const heroStatusNumberStyle = {
    color: isActive
      ? (isLight ? themePalette.hex_047857 : themePalette.hex_34d399)
      : (isLight ? themePalette.hex_dc2626 : themePalette.hex_f09595),
  };
  return (<View style={[styles.hero, cardStyle]}>
    <View style={styles.heroLocationRow}>
      <FontAwesome name="map-marker" size={13} color={isLight ? colors.accent : themePalette.hex_85b7eb} />
      <Text style={[styles.heroEyebrow, heroEyebrowStyle]}>{heroCompanyCountry}</Text>
      <View style={{ flex: 1 }} />
      <Text style={[styles.heroAdded, heroMetaStyle]}>Created: {heroCompanyDate}</Text>
    </View>
    <View style={[styles.heroCompanySwitcher, heroCompanySwitcherStyle]}>
      <Pressable onPress={hasCompany ? handleCompanyPress : (onAddToCompanyPress ?? onCompanySwitcherPress)} style={{ flex: 1, justifyContent: 'center' }}>
        <Text numberOfLines={1} style={[styles.heroCompany, heroCompanyStyle]}>
          {hasCompany ? capitalizeCompanyName(heroCompanyName) : heroCompanyName}
        </Text>
      </Pressable>
      <Pressable onPress={hasCompany ? onCompanySwitcherPress : (onAddToCompanyPress ?? onCompanySwitcherPress)} style={[styles.heroSwitchIcon, heroSwitchIconStyle]} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <FontAwesome name={hasCompany || isLoadingCompanies ? "exchange" : "plus"} size={14} color={isLight ? colors.text : themePalette.hex_ffffff} />
      </Pressable>
    </View>

    <View style={styles.heroMetaRow}>
      <View style={styles.heroMetaCol}>
        <Text style={[styles.heroMetaLabel, heroMetaStyle]}>EIN</Text>
        <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.heroMetaValue, heroMetaValueStyle]}>
          {heroCompanyEin}
        </Text>
      </View>
      <View style={[styles.heroMetaDivider, { backgroundColor: isLight ? themePalette.hex_e2e8f0 : themePalette.rgba_255_255_255_0_12 }]} />
      <View style={styles.heroMetaCol}>
        <Text style={[styles.heroMetaLabel, heroMetaStyle]}>FORMATION DATE</Text>
        <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.heroMetaValue, heroMetaValueStyle]}>
          {heroCompanyFormationDate}
        </Text>
      </View>
      <View style={[styles.heroMetaDivider, { backgroundColor: isLight ? themePalette.hex_e2e8f0 : themePalette.rgba_255_255_255_0_12 }]} />
      <View style={styles.heroMetaCol}>
        <Text style={[styles.heroMetaLabel, heroMetaStyle]}>STATE</Text>
        <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.heroMetaValue, heroMetaValueStyle]}>
          {heroCompanyState}
        </Text>
      </View>
    </View>

    <View style={styles.heroActions}>
      <Pressable onPress={onRegistrationTrackingPress} style={[styles.heroAction, heroActionStyle]}>
        <FontAwesome name="map-marker" size={14} color={isLight ? colors.accent : themePalette.hex_85b7eb} />
        <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={[styles.heroActionText, heroCompanyStyle]}>Registration Tracking</Text>
      </Pressable>
      <Pressable onPress={onCompanyProfilePress} style={[styles.heroAction, heroActionStyle]}>
        <FontAwesome name="building-o" size={14} color={isLight ? colors.accent : themePalette.hex_85b7eb} />
        <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={[styles.heroActionText, heroCompanyStyle]}>Company Profile</Text>
      </Pressable>
    </View>
  </View>);
}
const styles = makeThemeStyles(() => StyleSheet.create({
  hero: {
    width: '100%',
    alignSelf: 'stretch',
    overflow: 'hidden',
    borderRadius: s(18),
    backgroundColor: themePalette.hex_0d2137,
    paddingHorizontal: s(16),
    paddingTop: s(16),
    paddingBottom: s(14),
    marginTop: s(-14),
  },
  heroLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(5),
  },
  heroEyebrow: {
    color: themePalette.hex_85b7eb,
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
    color: themePalette.hex_ffffff,
    fontSize: font.heading,
    fontWeight: '400',
    lineHeight: 20,
  },
  heroCompanySwitcher: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: s(8),
    marginTop: s(14),
    borderWidth: 1,
    borderColor: themePalette.rgba_255_255_255_0_12,
    borderRadius: s(14),
    backgroundColor: 'transparent',
    paddingHorizontal: s(12),
    paddingVertical: s(8),
  },
  heroSwitchIcon: {
    width: s(30),
    height: s(30),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: themePalette.rgba_255_255_255_0_15,
    borderRadius: s(15),
    backgroundColor: themePalette.rgba_255_255_255_0_12,
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: s(10),
  },
  heroMetaCol: {
    flex: 1,
    alignItems: 'flex-start',
    marginLeft: s(4),
  },
  heroMetaDivider: {
    width: 1,
    height: s(28),
    backgroundColor: themePalette.rgba_255_255_255_0_15,
  },
  heroMetaLabel: {
    fontSize: font.xs,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  heroMetaValue: {
    color: themePalette.hex_fac775,
    fontSize: font.sm,
    fontWeight: '400',
    marginTop: 3,
  },
  heroActions: {
    flexDirection: 'row',
    gap: s(8),
    marginTop: s(12),
  },
  heroAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(6),
    borderWidth: 1,
    borderRadius: s(10),
    paddingHorizontal: s(10),
    paddingVertical: s(9),
  },
  heroActionText: {
    fontSize: font.sm,
    fontWeight: '600',
  },
}));
export default HomeHeroSection;
