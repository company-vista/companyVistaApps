import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import BackButton from '../../../components/buttons/BackButton';
import logoR from '../../../assets/images/logoR.png';
import { s } from '../../../theme/responsive';

export default function OptionalAddOnsScreen({ navigation, route }) {
  const { selectedStructure = 'LLC', companyName = '', selectedEnding = '', selectedState = 'Delaware', selectedCountry = 'US' } = route.params || {};

  const [selectedAddOns, setSelectedAddOns] = useState(() => {
    const init = route.params?.selectedAddOns;
    if (init && typeof init === 'object' && Object.keys(init).length > 0) return { expeditedFiling: !!init.expeditedFiling, expressEin: !!init.expressEin, bankAssurance: !!init.bankAssurance, stripePaypal: !!init.stripePaypal };
    return { expeditedFiling: false, expressEin: false, bankAssurance: false, stripePaypal: false };
  });

  // Frontend me total calculate nahi karna — sirf raw selectedAddOns backend bhejenge, backend computeOrderTotal karega
  const prices = {
    expeditedFiling: 99,
    expressEin: 149,
    bankAssurance: 349,
    stripePaypal: 179,
  };

  const toggleAddOn = (key) => {
    setSelectedAddOns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const selectedCount = Object.values(selectedAddOns).filter(Boolean).length;
  const addOnsTotal = Object.keys(selectedAddOns).reduce((sum, key) => selectedAddOns[key] ? sum + (prices[key] || 0) : sum, 0);
  // structure me jo total add hokar aaya (combinedTotal) + addons = final runningTotal backend me bhejna
  // GB/AE jaise price wale non-US ke liye combinedTotal 0 hota hai, isliye countryPrice + structure se fallback
  let baseTotal = Number(route.params?.combinedTotal ?? route.params?.runningTotal ?? route.params?.totalAmount ?? 0);
  if (!baseTotal) {
    const cp = Number(route.params?.selectedCountryPrice ?? 0);
    const sp = Number(route.params?.selectedStructurePrice ?? (selectedStructure === 'C-Corp' ? 399 : 299));
    const st = Number(route.params?.selectedStatePrice ?? 0);
    const isUS = (route.params?.selectedCountry || selectedCountry) === 'US';
    if (isUS) {
      baseTotal = sp + st;
      // US direct me countryPrice usually 0, but agar ho to add karo
      if (cp > 0) baseTotal += cp;
    } else {
      // non-USA: sirf country price, structure add nahi
      baseTotal = cp;
    }
  }
  const runningTotal = baseTotal + addOnsTotal;

  const handleContinue = () => {
    const updatedParams = {
      ...(route.params || {}),
      selectedStructure,
      companyName,
      selectedEnding,
      selectedState,
      selectedCountry,
      selectedAddOns,
      addOnsTotal,
      runningTotal,
      totalAmount: runningTotal,
      combinedTotal: baseTotal,
      fromOptionalAddOns: true,
    };
    // Agar Review se Change karke aaye ho to seedha Review pe wapas jao taaki total update dikhe
    const fromReview = route.params?.from === 'FounderDetails' || route.params?.email || route.params?.fullName;
    // Check if we came via ReviewAndConfirm Change button (params contain Review data)
    const isReviewFlow = route.params?.runningTotal !== undefined && (route.params?.fullName || route.params?.email);
    if (isReviewFlow || (fromReview && navigation.getState?.()?.routes?.some(r => r.name === 'ReviewAndConfirm'))) {
      // Prefer replace/navigate to ReviewAndConfirm with updated totals
      if (navigation.replace) navigation.replace('ReviewAndConfirm', updatedParams);
      else navigation.navigate('ReviewAndConfirm', updatedParams);
    } else {
      navigation.navigate('FounderDetails', updatedParams);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#080e18" />

      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Image source={logoR} style={styles.topLogo} />
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>
            Optional <Text style={styles.italicTitle}>add-ons</Text>
          </Text>
          <Text style={styles.subtitle}>
            Everything here is genuinely optional — your company is complete without them.
          </Text>
        </View>

        <View style={styles.totalBanner}>
          <View>
            <Text style={styles.runningTotalLabel}>Add-ons total</Text>
            <Text style={styles.runningTotalAmount}>${addOnsTotal}</Text>
          </View>
          <View style={styles.runningTotalRight}>
            <Text style={styles.addOnsCountText}>{selectedCount} selected · Total backend se calculate hoga</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>SPEED</Text>
          <View style={styles.sectionLine} />
        </View>

        <TouchableOpacity activeOpacity={0.8} onPress={() => toggleAddOn('expeditedFiling')} style={[styles.card, selectedAddOns.expeditedFiling && styles.selectedCard]}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Feather name="zap" size={18} color="#D4AF37" />
            </View>
            <View style={styles.cardTextContainer}>
              <View style={styles.titleRow}>
                <Text style={styles.cardTitle}>Expedited State Filing</Text>
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
                </View>
              </View>
              <Text style={styles.cardDescription}>Delaware processes your filing in 24 hours instead of 5–7 business days.</Text>
            </View>
            <View style={[styles.checkbox, selectedAddOns.expeditedFiling && styles.checkboxSelected]}>
              {selectedAddOns.expeditedFiling && <Ionicons name="checkmark" size={14} color="#0A111D" />}
            </View>
          </View>
          <View style={styles.cardFooter}>
            <View style={styles.tagRow}>
              <View style={styles.tagGreen}><Text style={styles.tagGreenText}>24-hour turnaround</Text></View>
              <View style={styles.tagGray}><Text style={styles.tagGrayText}>Delaware fee included</Text></View>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>+${prices.expeditedFiling}</Text>
              <Text style={styles.priceSubtext}>one-time</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.8} onPress={() => toggleAddOn('expressEin')} style={[styles.card, selectedAddOns.expressEin && styles.selectedCard]}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Feather name="file-text" size={18} color="#64B5F6" />
            </View>
            <View style={styles.cardTextContainer}>
              <View style={styles.titleRow}>
                <Text style={styles.cardTitle}>Express EIN</Text>
                <View style={styles.purpleBadge}><Text style={styles.purpleBadgeText}>SAVES 5 WEEKS</Text></View>
              </View>
              <Text style={styles.cardDescription}>Your Federal Tax ID in 3–5 days. The standard route takes 4–6 weeks for non-residents.</Text>
            </View>
            <View style={[styles.checkbox, selectedAddOns.expressEin && styles.checkboxSelected]}>
              {selectedAddOns.expressEin && <Ionicons name="checkmark" size={14} color="#0A111D" />}
            </View>
          </View>
          <View style={styles.cardFooter}>
            <View style={styles.tagRow}>
              <View style={styles.tagGreen}><Text style={styles.tagGreenText}>3–5 days</Text></View>
              <View style={styles.tagBlue}><Text style={styles.tagBlueText}>vs 4–6 weeks standard</Text></View>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>+${prices.expressEin}</Text>
              <Text style={styles.priceSubtext}>one-time</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>BANKING</Text>
          <View style={styles.sectionLine} />
        </View>

        <TouchableOpacity activeOpacity={0.8} onPress={() => toggleAddOn('bankAssurance')} style={[styles.card, selectedAddOns.bankAssurance && styles.selectedCard]}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <FontAwesome5 name="university" size={16} color="#00E676" />
            </View>
            <View style={styles.cardTextContainer}>
              <View style={styles.titleRow}>
                <Text style={styles.cardTitle}>Bank Approval Assurance</Text>
              </View>
              <View style={styles.guaranteeBadge}><Text style={styles.guaranteeBadgeText}>GUARANTEED</Text></View>
              <Text style={styles.cardDescription}>We guarantee approval with at least one partner bank for permitted activities — or your money back.</Text>
            </View>
            <View style={[styles.checkbox, selectedAddOns.bankAssurance && styles.checkboxSelected]}>
              {selectedAddOns.bankAssurance && <Ionicons name="checkmark" size={14} color="#0A111D" />}
            </View>
          </View>
          <View style={styles.cardFooter}>
            <View style={styles.tagRow}>
              <View style={styles.tagGreen}><Text style={styles.tagGreenText}>Guaranteed approval</Text></View>
              <View style={styles.tagGray}><Text style={styles.tagGrayText}>Money-back</Text></View>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>+${prices.bankAssurance}</Text>
              <Text style={styles.priceSubtext}>one-time</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.8} onPress={() => toggleAddOn('stripePaypal')} style={[styles.card, selectedAddOns.stripePaypal && styles.selectedCard]}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="credit-card-outline" size={18} color="#00E676" />
            </View>
            <View style={styles.cardTextContainer}>
              <View style={styles.titleRow}>
                <Text style={styles.cardTitle}>Stripe + PayPal Setup</Text>
              </View>
              <Text style={styles.cardDescription}>We handle the paperwork to get your payment processors approved and ready to accept payments.</Text>
            </View>
            <View style={[styles.checkbox, selectedAddOns.stripePaypal && styles.checkboxSelected]}>
              {selectedAddOns.stripePaypal && <Ionicons name="checkmark" size={14} color="#0A111D" />}
            </View>
          </View>
          <View style={styles.cardFooter}>
            <View style={styles.tagRow}>
              <View style={styles.tagGreen}><Text style={styles.tagGreenText}>Done for you</Text></View>
              <View style={styles.tagGray}><Text style={styles.tagGrayText}>Fast approval</Text></View>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>+${prices.stripePaypal}</Text>
              <Text style={styles.priceSubtext}>one-time</Text>
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footerContainer}>
        <TouchableOpacity style={styles.continueButton} activeOpacity={0.8} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={18} color="#0A111D" />
        </TouchableOpacity>
        <Text style={styles.footerSubtext}>${addOnsTotal} add-ons · {selectedCount} selected</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080E18' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 34, marginBottom: 16, paddingHorizontal: s(16) },
  topLogo: { width: 150, height: 38, resizeMode: 'contain', marginTop: 10 },
  scrollContent: { paddingHorizontal: s(16), paddingBottom: 20 },
  titleContainer: { marginVertical: 15 },
  mainTitle: { fontSize: s(24), fontWeight: '700', color: '#FFFFFF', marginBottom: s(8) },
  italicTitle: { fontStyle: 'italic', fontWeight: '400', color: '#D4AF37' },
  subtitle: { color: '#8E9BAE', fontSize: 14, lineHeight: 20 },
  totalBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0C1622', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)', padding: 16, marginTop: 10, marginBottom: 16 },
  runningTotalLabel: { color: '#8E9BAE', fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase' },
  runningTotalAmount: { color: '#D4AF37', fontSize: 22, fontWeight: '700', marginTop: 2 },
  runningTotalRight: { alignItems: 'flex-end' },
  basePriceText: { color: '#8E9BAE', fontSize: 12 },
  addOnsCountText: { color: '#00E676', fontSize: 12, fontWeight: '600', marginTop: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16, marginBottom: 10 },
  sectionTitle: { color: '#6C7A8E', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  sectionLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  card: { width: '100%', backgroundColor: '#0C1622', borderRadius: s(12), borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', padding: s(14), marginBottom: s(12) },
  selectedCard: { borderColor: '#D4AF37', backgroundColor: 'rgba(212,175,55,0.06)' },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  iconContainer: { width: 36, height: 36, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  cardTextContainer: { flex: 1, marginLeft: 12, marginRight: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  cardTitle: { color: '#FFFFFF', fontSize: s(13), fontWeight: '600' },
  popularBadge: { backgroundColor: 'rgba(212,175,55,0.15)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)', borderRadius: 4, paddingHorizontal: s(6), paddingVertical: 2 },
  popularBadgeText: { color: '#D4AF37', fontSize: 8, fontWeight: '700' },
  purpleBadge: { backgroundColor: 'rgba(100,80,255,0.15)', borderWidth: 1, borderColor: 'rgba(100,80,255,0.3)', borderRadius: 4, paddingHorizontal: s(6), paddingVertical: 2 },
  purpleBadgeText: { color: '#A78BFA', fontSize: 8, fontWeight: '700' },
  guaranteeBadge: { backgroundColor: 'rgba(0,230,118,0.12)', borderWidth: 1, borderColor: 'rgba(0,230,118,0.3)', borderRadius: 4, paddingHorizontal: s(6), paddingVertical: 2, alignSelf: 'flex-start', marginTop: 4 },
  guaranteeBadgeText: { color: '#00E676', fontSize: 8, fontWeight: '700' },
  cardDescription: { color: '#7C8BA1', fontSize: 12, marginTop: 4, lineHeight: 16 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.04)', justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  checkboxSelected: { backgroundColor: '#D4AF37', borderColor: '#D4AF37' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 12 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, flex: 1, marginRight: 10 },
  tagGreen: { backgroundColor: 'rgba(0,230,118,0.1)', borderRadius: 12, paddingHorizontal: s(8), paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(0,230,118,0.2)' },
  tagGreenText: { color: '#00E676', fontSize: 10, fontWeight: '500' },
  tagGray: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, paddingHorizontal: s(8), paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  tagGrayText: { color: '#8E9BAE', fontSize: 10 },
  tagBlue: { backgroundColor: 'rgba(100,149,237,0.1)', borderRadius: 12, paddingHorizontal: s(8), paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(100,149,237,0.2)' },
  tagBlueText: { color: '#64B5F6', fontSize: 10 },
  priceContainer: { alignItems: 'flex-end' },
  priceText: { color: '#D4AF37', fontSize: 14, fontWeight: '700' },
  priceSubtext: { color: '#6C7A8E', fontSize: 10 },
  footerContainer: { paddingHorizontal: s(16), paddingTop: 10, paddingBottom: 16, backgroundColor: '#080E18', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  continueButton: { backgroundColor: '#D4AF37', height: 52, borderRadius: 26, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  continueButtonText: { color: '#0A111D', fontSize: 16, fontWeight: '700', marginRight: 8 },
  footerSubtext: { color: '#5B6B7C', fontSize: 12, textAlign: 'center', marginTop: 10 },
});
