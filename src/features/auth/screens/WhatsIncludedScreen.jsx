import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BackButton from '../../../components/buttons/BackButton';
import logoR from '../../../assets/images/logoR.png';
import { s } from '../../../theme/responsive';
import { getStructurePrice } from '../../../utils/priceCalculator';
import { getStateData, getPackageIncludes } from '../../../utils/jurisdictionData';
import { getCountryPrice } from '../../../constants/countries';
import { allCountries } from '../jurisdictionAdvisor/RegisterJurisdictionScreen';
import { useThemeColors } from '../../../theme/colors';

export default function WhatsIncludedScreen({ navigation, route }) {
  const { selectedStructure = 'LLC', companyName = '', selectedEnding = '', selectedState = 'Delaware', selectedCountry = 'US' } = route.params || {};
  const stateData = getStateData(selectedState);
  // Non-US flow: allCountries (RegisterJurisdictionScreen) ke packageIncludes dikhao;
  // US flow: state ke packageIncludes
  const countryEntry = allCountries.find((c) => c.code === selectedCountry);
  const packageSource =
    selectedCountry !== 'US' && countryEntry?.packageIncludes?.length
      ? { packageIncludes: countryEntry.packageIncludes }
      : stateData;
  const packageItems = getPackageIncludes(packageSource);
  const packageValue = packageItems.reduce((sum, item) => sum + (item.price || 0), 0);
  // Country ka packageFee registry (countries.js) se — quoted countries me 0
  const countryFee = selectedCountry !== 'US' ? getCountryPrice(selectedCountry) : 0;
  const isQuotedCountry = selectedCountry !== 'US' && !(countryFee > 0);
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const isDark = colors.mode === 'dark';

  const handleContinue = () => {
    const nextParams = { ...(route.params || {}), selectedStructure, selectedStructurePrice: route.params?.selectedStructurePrice ?? getStructurePrice(selectedStructure), companyName, selectedEnding, selectedState, selectedCountry };
    // Optional add-ons sirf USA jurisdiction ke liye hain — RegisterJurisdictionScreen
    // me USA select hone par hi OptionalAddOns dikhao, warna seedha FounderDetails.
    if (selectedCountry === 'US') {
      navigation.navigate('OptionalAddOns', nextParams);
    } else {
      navigation.navigate('FounderDetails', nextParams);
    }
  };

  const handleBack = () => {
    if (navigation?.canGoBack?.()) navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={handleBack} />
        <Image source={logoR} style={styles.topLogo} />
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Title Section */}
        <View style={styles.titleContainer}>
          <Text style={[styles.mainTitle, { color: colors.text }]}>
            What's <Text style={styles.italicTitle}>included</Text>
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Everything needed to trade legally — nothing held back for an upsell.
          </Text>
        </View>

        {/* Package Card */}
        <View style={[styles.card, { backgroundColor: isDark ? '#0C1622' : '#FFFFFF', borderColor: isDark ? 'rgba(0, 230, 118, 0.2)' : 'rgba(0, 230, 118, 0.35)' }]}>
          {/* Main Package Header */}
          <View style={styles.packageHeader}>
            <View style={styles.iconContainerGreen}>
              <Feather name="shield" size={22} color="#00E676" />
            </View>
            <View style={styles.packageTextContainer}>
              <Text style={[styles.packageTitle, { color: colors.text }]}>Complete formation package</Text>
              <Text style={[styles.packageSubtitle, { color: colors.muted }]}>All {packageItems.length} services · no add-ons required</Text>
            </View>
            <View style={styles.valueContainer}>
              {selectedCountry !== 'US' ? (
                <>
                  <Text style={[styles.valueAmount, isQuotedCountry && styles.valueAmountQuote]}>
                    {isQuotedCountry ? 'Quote' : `$${countryFee}`}
                  </Text>
                  <Text style={styles.valueLabel}>{isQuotedCountry ? 'CUSTOM QUOTE' : 'PACKAGE'}</Text>
                </>
              ) : (
                <>
                  <Text style={styles.valueAmount}>${packageValue}</Text>
                  <Text style={styles.valueLabel}>VALUE</Text>
                </>
              )}
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border }]} />

          {packageItems.map((item, index) => (
            <View key={item.label || index} style={styles.itemRow}>
              <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.surfaceAlt }]}>
                {item.iconLib === 'FontAwesome5' ? (
                  <FontAwesome5 name={item.icon} size={16} color="#00E676" />
                ) : (
                  <Feather name={item.icon} size={18} color="#00E676" />
                )}
              </View>
              <View style={styles.itemTextContainer}>
                <View style={styles.titleBadgeRow}>
                  <Text style={[styles.itemTitle, { color: colors.text }]}>{item.label}</Text>
                  {item.badge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  )}
                </View>
                {!!item.description && (
                  <Text style={[styles.itemDescription, { color: colors.muted }]}>{item.description}</Text>
                )}
              </View>
              <View style={styles.priceContainer}>
                {item.price > 0 && (
                  <Text style={[styles.strikethroughPrice, { color: colors.subtle }]}>${item.price}</Text>
                )}
                <Text style={styles.freeBadge}>FREE</Text>
              </View>
            </View>
          ))}

          <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border }]} />

          {/* Guarantee Footer inside card */}
          <View style={styles.guaranteeRow}>
            <View style={styles.checkIconContainer}>
              <Ionicons name="checkmark-circle" size={24} color="#00E676" />
            </View>
            <Text style={[styles.guaranteeText, { color: colors.muted }]}>
              <Text style={styles.guaranteeBold}>100% refund guarantee</Text> — if we cannot form your company, you pay nothing.
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsContainer}>
          <View style={[styles.statBox, { backgroundColor: isDark ? '#0C1622' : '#FFFFFF', borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border }]}>
            <Text style={styles.statNumber}>2,400+</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>COMPANIES FORMED</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: isDark ? '#0C1622' : '#FFFFFF', borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border }]}>
            <Text style={styles.statNumber}>98%</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>FIRST-TIME APPROVAL</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Button Area */}
      <View style={[styles.footerContainer, { paddingBottom: s(24) + insets.bottom, paddingTop: s(14), backgroundColor: colors.background }]}>
        <TouchableOpacity style={[styles.continueButton, { backgroundColor: colors.buttonBackground }]} activeOpacity={0.8} onPress={handleContinue}>
          <Text style={[styles.continueButtonText, { color: colors.buttonText }]}>Continue</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.buttonText} />
        </TouchableOpacity>

        <Text style={[styles.footerSubtext, { color: colors.subtle }]}>
          {(() => {
            const p = route.params || {};
            if (p.advisorFlow && (p.bestStatePrice || p.bestCountryPrice || p.selectedCountryPrice)) {
              if (p.bestStatePrice) {
                const structPrice = p.selectedStructurePrice ?? getStructurePrice(selectedStructure);
                const delta = structPrice - 299;
                const total = Number(p.bestStatePrice) + (delta > 0 ? delta : 0);
                const stateName = p.bestState || p.selectedState || selectedState;
                return `$${total} total · $${structPrice} structure + $${p.bestStateGovFee ?? (total - structPrice)} ${stateName} state fee`;
              } else {
                const countryPrice = Number(p.bestCountryPrice ?? p.selectedCountryPrice ?? 0) || countryFee;
                const countryName = p.bestCountryName || countryEntry?.name || p.selectedCountry || selectedCountry;
                if (!countryPrice) return 'Custom quote · final price after our team reviews';
                return `$${countryPrice} total · ${countryName} package`;
              }
            }
            const stateName = p.selectedState || p.bestState || selectedState;
            const stateFee = p.selectedStatePrice ?? p.bestStateGovFee ?? 160;
            const structPrice = p.selectedStructurePrice ?? getStructurePrice(selectedStructure);
            if (selectedCountry !== 'US') {
              const cPrice = Number(p.selectedCountryPrice ?? 0) || countryFee;
              const countryName = countryEntry?.name || p.selectedCountry || selectedCountry;
              return cPrice ? `$${cPrice} ${countryName} package` : 'Custom quote · final price after our team reviews';
            }
            return `$${structPrice} Structure package + $${stateFee} ${stateName} state fee`;
          })()}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: s(34),
    marginBottom: s(16),
    paddingHorizontal: s(16),
  },
  topLogo: { width: 150, height: 38, resizeMode: 'contain', marginTop: s(10) },
  scrollContent: {
    paddingHorizontal: s(16),
    paddingBottom: s(20),
  },
  titleContainer: {
    marginVertical: s(15),
  },
  mainTitle: {
    fontSize: s(26),
    fontWeight: '400',
    marginBottom: s(8),
  },
  italicTitle: {
    fontStyle: 'italic',
    fontWeight: '400',
    color: '#D4AF37',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: s(16),
    marginTop: s(10),
  },
  packageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainerGreen: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  packageTextContainer: {
    flex: 1,
    marginLeft: s(12),
  },
  packageTitle: {
    fontSize: s(15),
    fontWeight: '700',
  },
  packageSubtitle: {
    fontSize: 12,
    marginTop: s(2),
  },
  valueContainer: {
    alignItems: 'flex-end',
  },
  valueAmount: {
    color: '#00E676',
    fontSize: 18,
    fontWeight: '700',
  },
  valueAmountQuote: {
    fontSize: 13,
  },
  valueLabel: {
    color: '#00E676',
    fontSize: 10,
    opacity: 0.8,
  },
  divider: {
    height: 1,
    marginVertical: s(14),
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: s(16),
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: s(2),
  },
  itemTextContainer: {
    flex: 1,
    marginLeft: s(12),
    marginRight: s(8),
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  itemTitle: {
    fontSize: s(13),
    fontWeight: '600',
  },
  badge: {
    backgroundColor: 'rgba(21, 101, 192, 0.3)',
    borderColor: '#1E88E5',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: s(6),
    paddingVertical: s(2),
    marginLeft: s(6),
  },
  badgeText: {
    color: '#64B5F6',
    fontSize: 9,
    fontWeight: '700',
  },
  itemDescription: {
    fontSize: 12,
    marginTop: s(3),
    lineHeight: 16,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  strikethroughPrice: {
    fontSize: 11,
    textDecorationLine: 'line-through',
  },
  freeBadge: {
    color: '#00E676',
    fontSize: 12,
    fontWeight: '700',
    marginTop: s(1),
  },
  guaranteeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkIconContainer: {
    marginRight: s(10),
  },
  guaranteeText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 17,
  },
  guaranteeBold: {
    color: '#00E676',
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: s(16),
  },
  statBox: {
    flex: 0.48,
    borderRadius: 12,
    paddingVertical: s(14),
    alignItems: 'center',
    borderWidth: 1,
  },
  statNumber: {
    color: '#D4AF37',
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    marginTop: s(4),
    letterSpacing: 0.5,
  },
  footerContainer: {
    paddingHorizontal: s(16),
    paddingTop: s(10),
    paddingBottom: s(16),
  },
  continueButton: {
    paddingVertical: s(14),
    borderRadius: 26,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: s(15),
    fontWeight: '700',
    marginRight: s(8),
  },
  footerSubtext: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: s(10),
  },
});
