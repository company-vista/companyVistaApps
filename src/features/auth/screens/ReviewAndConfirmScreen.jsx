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
import BackButton from '../../../components/buttons/BackButton';
import logoR from '../../../assets/images/logoR.png';
import { useAppDispatch } from '../../../store/hooks';
import { setPendingOrderData } from '../../../store/slices/authSlice';

export default function ReviewAndConfirmScreen({ navigation, route }) {
  const dispatch = useAppDispatch();
  const {
    selectedStructure = '',
    companyName = '',
    selectedEnding = '',
    selectedState = 'Delaware',
    selectedCountry = 'US',
    selectedAddOns = {},
    addOnsTotal = 0,
    runningTotal = 0,
  } = route.params || {};

  const [isChecked, setIsChecked] = useState(true);

  // derive add-ons list from params, fallback to default 2 if empty
  const hasAddOnsParam = selectedAddOns && Object.keys(selectedAddOns).length > 0;
  const addOns = hasAddOnsParam ? selectedAddOns : { expeditedFiling: true, expressEin: true };
  const addOnList = [
    addOns.expeditedFiling ? { title: 'Expedited State Filing', subtext: '24-hour Delaware turnaround', price: 99 } : null,
    addOns.expressEin ? { title: 'Express EIN', subtext: 'Tax ID in 3–5 days instead of 4–6 weeks', price: 149 } : null,
    addOns.bankAssurance ? { title: 'Bank Approval Assurance', subtext: 'Guaranteed approval', price: 349 } : null,
    addOns.stripePaypal ? { title: 'Stripe + PayPal Setup', subtext: 'Payment processors ready', price: 179 } : null,
  ].filter(Boolean);

  const computedAddOnsTotal = addOnList.reduce((s, i) => s + i.price, 0);
  const computedRunningTotal = 459 + computedAddOnsTotal; // base 459 as per OptionalAddOns
  const displayAddOnsTotal = addOnsTotal || computedAddOnsTotal;
  const displayTotal = runningTotal ? runningTotal + 160 - 0 : computedRunningTotal + 160; // +160 state fee as per design (299 package +160 =459 base, total 707 example)
  // For exact UI match, use 707 if 2 add-ons selected, else compute
  const packagePrice = 299;
  const stateFee = 160;
  const finalTotal = packagePrice + stateFee + displayAddOnsTotal;

  const handleConfirm = () => {
    const orderData = {
      selectedStructure,
      companyName,
      selectedEnding,
      selectedState,
      selectedCountry,
      selectedAddOns: addOns,
      addOnsTotal: displayAddOnsTotal,
      runningTotal: finalTotal,
      fullName: route.params?.fullName,
      email: route.params?.email,
      countryOfResidence: route.params?.countryOfResidence,
      phone: route.params?.phone,
      companyState: selectedState,
      structure: selectedStructure,
      shareCapital: '€25,000',
      shareholdersCount: '3 people',
      orderId: `CV-${Date.now()}`,
    };
    dispatch(setPendingOrderData(orderData));
    navigation.navigate('CompletePayment', orderData);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#080E18" />

      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Image source={logoR} style={styles.topLogo} />
        <View style={{ width: 38 }} />
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressStepActive} />
        <View style={styles.progressStepActive} />
        <View style={styles.progressStepActive} />
        <View style={styles.progressStepActive} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>
            Review & <Text style={styles.italicTitle}>confirm</Text>
          </Text>
          <Text style={styles.subtitle}>Check everything is correct before we file.</Text>
        </View>

        {/* Company + Founder Summary - as per image */}
        <View style={styles.summarySection}>
          <View style={styles.companyCard}>
            <View style={styles.summaryHeader}>
              <View style={styles.summaryHeaderLeft}>
                <View style={styles.summaryIconBox}>
                  <Feather name="briefcase" size={12} color="#D4AF37" />
                </View>
                <Text style={styles.summaryHeaderTitle}>COMPANY</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('CompanyNaming')} style={styles.editBtn}>
                <Feather name="edit-2" size={12} color="#D4AF37" />
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.summaryRowSmall}>
              <Text style={styles.summaryLabel}>Legal name</Text>
              <Text style={styles.summaryValueGold}>{companyName ? `${companyName} ${selectedEnding || selectedStructure}`.trim() : 'Meridian Global Ventures LLC'}</Text>
            </View>
            <View style={styles.summaryRowSmall}>
              <Text style={styles.summaryLabel}>Jurisdiction</Text>
              <Text style={styles.summaryValue}>US {selectedState}, USA</Text>
            </View>
            <View style={styles.summaryRowSmall}>
              <Text style={styles.summaryLabel}>Structure</Text>
              <Text style={styles.summaryValue}>{selectedStructure}</Text>
            </View>
          </View>

          <View style={styles.companyCard}>
            <View style={styles.summaryHeader}>
              <View style={styles.summaryHeaderLeft}>
                <View style={[styles.summaryIconBox, { backgroundColor: 'rgba(100,181,246,0.12)', borderColor: 'rgba(100,181,246,0.25)' }]}>
                  <Feather name="user" size={12} color="#64B5F6" />
                </View>
                <Text style={styles.summaryHeaderTitle}>PRINCIPAL FOUNDER</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('FounderDetails', route.params)} style={styles.editBtn}>
                <Feather name="edit-2" size={12} color="#D4AF37" />
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.summaryRowSmall}>
              <Text style={styles.summaryLabel}>Full name</Text>
              <Text style={styles.summaryValue}>{route.params?.fullName || 'Rajesh Kumar Sharma'}</Text>
            </View>
            <View style={styles.summaryRowSmall}>
              <Text style={styles.summaryLabel}>Email</Text>
              <Text style={styles.summaryValue} numberOfLines={1}>{route.params?.email || 'rajesh@meridianglobal.com'}</Text>
            </View>
            <View style={styles.summaryRowSmall}>
              <Text style={styles.summaryLabel}>Residence</Text>
              <View style={styles.residenceValue}>
                <Text style={styles.summaryValueSmall}>IN</Text>
                <Text style={styles.summaryValue}> {route.params?.countryOfResidence || 'India'}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.includedCard}>
          <View style={styles.checkGrid}>
            <View style={styles.checkItem}>
              <Ionicons name="checkmark" size={14} color="#00E676" />
              <Text style={styles.checkItemText}>Registered agent</Text>
            </View>
            <View style={styles.checkItem}>
              <Ionicons name="checkmark" size={14} color="#00E676" />
              <Text style={styles.checkItemText}>EIN application</Text>
            </View>
            <View style={styles.checkItem}>
              <Ionicons name="checkmark" size={14} color="#00E676" />
              <Text style={styles.checkItemText}>Bank assistance</Text>
            </View>
          </View>
        </View>

        <View style={styles.addOnsCard}>
          <View style={styles.addOnsHeader}>
            <View style={styles.addOnsTitleRow}>
              <Feather name="zap" size={16} color="#D4AF37" />
              <Text style={styles.addOnsHeaderText}>ADD-ONS SELECTED</Text>
            </View>
            <TouchableOpacity activeOpacity={0.7} style={styles.changeButton} onPress={() => navigation.navigate('OptionalAddOns', route.params)}>
              <Feather name="edit-2" size={12} color="#D4AF37" />
              <Text style={styles.changeText}>Change</Text>
            </TouchableOpacity>
          </View>

          {addOnList.length === 0 ? (
            <Text style={styles.addOnSubtext}>No add-ons selected</Text>
          ) : (
            addOnList.map((item, idx) => (
              <View key={item.title}>
                <View style={styles.addOnItem}>
                  <View style={styles.addOnTextGroup}>
                    <Text style={styles.addOnTitle}>{item.title}</Text>
                    <Text style={styles.addOnSubtext}>{item.subtext}</Text>
                  </View>
                  <Text style={styles.addOnPrice}>${item.price}</Text>
                </View>
                {idx < addOnList.length - 1 && <View style={styles.itemSeparator} />}
              </View>
            ))
          )}
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryTitle}>CompanyVista package</Text>
              <Text style={styles.summarySubtext}>5 services · $740 value</Text>
            </View>
            <Text style={styles.summaryPrice}>${packagePrice}</Text>
          </View>

          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryTitle}>Delaware state fee</Text>
              <Text style={styles.summarySubtext}>Charged at cost</Text>
            </View>
            <Text style={styles.summaryPrice}>${stateFee}</Text>
          </View>

          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryTitle}>Add-ons ({addOnList.length})</Text>
              <Text style={styles.summarySubtext}>{addOnList.map(a => a.title.split(' ')[0]).join(' · ') || 'None'}</Text>
            </View>
            <Text style={styles.summaryPrice}>${displayAddOnsTotal}</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalAmount}>${finalTotal}</Text>
          </View>
        </View>

        <View style={styles.timelineBanner}>
          <Ionicons name="checkmark-circle" size={20} color="#00E676" style={styles.timelineIcon} />
          <Text style={styles.timelineText}>
            <Text style={styles.timelineBold}>Ready in 2–3 days</Text> with your add-ons, instead of 5–7
          </Text>
        </View>

        <TouchableOpacity style={styles.checkboxContainer} activeOpacity={0.8} onPress={() => setIsChecked(!isChecked)}>
          <View style={[styles.checkbox, isChecked && styles.checkboxActive]}>
            {isChecked && <Ionicons name="checkmark" size={14} color="#0A111D" />}
          </View>
          <Text style={styles.checkboxLabel}>I confirm these details match my passport and are accurate.</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footerContainer}>
        <TouchableOpacity style={[styles.confirmButton, !isChecked && { opacity: 0.5 }]} activeOpacity={0.8} onPress={handleConfirm} disabled={!isChecked}>
          <Text style={styles.confirmButtonText}>Confirm & Pay ${finalTotal}</Text>
          <Ionicons name="arrow-forward" size={18} color="#0A111D" />
        </TouchableOpacity>

        <Text style={styles.footerSubtext}>
          Secure payment · <Text style={styles.footerSubtextBold}>100% refund if we can't form</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080E18' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 34, marginBottom: 8, paddingHorizontal: 16 },
  topLogo: { width: 150, height: 38, resizeMode: 'contain', marginTop: 10 },
  progressContainer: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 6, marginBottom: 10, gap: 8 },
  progressStepActive: { flex: 1, height: 3, backgroundColor: '#D4AF37', borderRadius: 2 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 20 },
  summarySection: { gap: 12, marginBottom: 12 },
  companyCard: { backgroundColor: '#0C1622', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 14, borderTopWidth: 1, borderTopColor: 'rgba(212,175,55,0.15)' },
  summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  summaryHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  summaryIconBox: { width: 26, height: 26, borderRadius: 7, backgroundColor: 'rgba(212,175,55,0.12)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.25)', justifyContent: 'center', alignItems: 'center' },
  summaryHeaderTitle: { color: '#8E9BAE', fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  editText: { color: '#D4AF37', fontSize: 11, fontWeight: '600' },
  summaryRowSmall: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  summaryLabel: { color: '#6C7A8E', fontSize: 12 },
  summaryValue: { color: '#FFFFFF', fontSize: 12, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  summaryValueGold: { color: '#D4AF37', fontSize: 12, fontWeight: '700', maxWidth: '60%', textAlign: 'right' },
  summaryValueSmall: { color: '#8E9BAE', fontSize: 10, fontWeight: '700', backgroundColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 3, overflow: 'hidden' },
  residenceValue: { flexDirection: 'row', alignItems: 'center' },
  titleContainer: { marginVertical: 10 },
  mainTitle: { fontSize: 28, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  italicTitle: { fontStyle: 'italic', fontWeight: '400', color: '#D4AF37' },
  subtitle: { color: '#8E9BAE', fontSize: 14 },
  includedCard: { backgroundColor: '#0C1622', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.2)', paddingVertical: 12, paddingHorizontal: 14, marginVertical: 10 },
  checkGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 8, columnGap: 16 },
  checkItem: { flexDirection: 'row', alignItems: 'center' },
  checkItemText: { color: '#8E9BAE', fontSize: 12, marginLeft: 6 },
  addOnsCard: { backgroundColor: '#0C1622', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', padding: 14, marginBottom: 12 },
  addOnsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  addOnsTitleRow: { flexDirection: 'row', alignItems: 'center' },
  addOnsHeaderText: { color: '#8E9BAE', fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginLeft: 6 },
  changeButton: { flexDirection: 'row', alignItems: 'center' },
  changeText: { color: '#D4AF37', fontSize: 12, fontWeight: '600', marginLeft: 4 },
  addOnItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  addOnTextGroup: { flex: 1, paddingRight: 10 },
  addOnTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  addOnSubtext: { color: '#6C7A8E', fontSize: 11, marginTop: 2 },
  addOnPrice: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  itemSeparator: { height: 1, backgroundColor: 'rgba(255, 255, 255, 0.05)', marginVertical: 10 },
  summaryCard: { backgroundColor: '#0C1622', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.3)', padding: 16, marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  summaryTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  summarySubtext: { color: '#6C7A8E', fontSize: 11, marginTop: 2 },
  summaryPrice: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  summaryDivider: { height: 1, backgroundColor: 'rgba(255, 255, 255, 0.08)', marginVertical: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 },
  totalLabel: { color: '#8E9BAE', fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  totalAmount: { color: '#D4AF37', fontSize: 28, fontWeight: '700' },
  timelineBanner: { backgroundColor: 'rgba(0, 230, 118, 0.05)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.2)', padding: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  timelineIcon: { marginRight: 10 },
  timelineText: { color: '#8E9BAE', fontSize: 12, flex: 1 },
  timelineBold: { color: '#00E676', fontWeight: '700' },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  checkbox: { width: 20, height: 20, borderRadius: 5, borderWidth: 1, borderColor: '#4A5768', backgroundColor: '#0C1622', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  checkboxActive: { backgroundColor: '#D4AF37', borderColor: '#D4AF37' },
  checkboxLabel: { color: '#8E9BAE', fontSize: 12, flex: 1, lineHeight: 16 },
  footerContainer: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 16, backgroundColor: '#080E18' },
  confirmButton: { backgroundColor: '#D4AF37', height: 52, borderRadius: 26, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  confirmButtonText: { color: '#0A111D', fontSize: 16, fontWeight: '700', marginRight: 8 },
  footerSubtext: { color: '#5B6B7C', fontSize: 11, textAlign: 'center', marginTop: 10 },
  footerSubtextBold: { color: '#D4AF37', fontWeight: '600' },
});
