import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import BackButton from '../../../components/buttons/BackButton';
import logoR from '../../../assets/images/logoR.png';
import { CommonActions } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { setPendingOrderData, setAuthSession, setPendingOpenOrderDetails } from '../../../store/slices/authSlice';
import { saveReviewOrderApi, fetchReviewApi, confirmSignupApi } from '../api/orderApi';
import { fetchClientCompanyDetails } from '../../../features/home/api/clientProfileApi';
import { s } from '../../../theme/responsive';

export default function ReviewAndConfirmScreen({ navigation, route }) {
  const dispatch = useAppDispatch();
  const token = useAppSelector(s => s.auth.token);
  React.useEffect(() => {
    console.log('=== REVIEW & SUBMIT SCREEN DATA ===', JSON.stringify(route?.params, null, 2));
  }, []);
  // Hardware back pe bhi Signup (FounderDetails) par bhejo - intermediate screens skip
  React.useEffect(() => {
    const unsub = navigation.addListener('beforeRemove', (e) => {
      if (e.data.action.type === 'GO_BACK' && (route?.params?.from === 'FounderDetails' || route?.params?.advisorFlow)) {
        e.preventDefault();
        // Reset stack to keep only FounderDetails so back won't show EmailVerify/SetPassword
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'FounderDetails', params: route.params }],
          })
        );
      }
    });
    return unsub;
  }, [navigation, route.params]);
  // Signup ke baad sab data backend me save — Review sirf GET /review/:companyId se dikhayega (portal payload ke baad backend hi source of truth)
  const {
    selectedStructure: paramStructure = '',
    companyName: paramCompanyName = '',
    selectedEnding: paramEnding = '',
    selectedState: paramState = 'Delaware',
    selectedCountry: paramCountry = 'US',
    selectedAddOns: paramAddOns = {},
  } = route.params || {};

  // Backend se company + pricing aane ke baad wahi display — fallback me route.params
  const companyName = reviewData?.company?.companyName || paramCompanyName || '';
  const selectedStructure = reviewData?.company?.companyType || paramStructure || '';
  const selectedState = reviewData?.company?.stateOfRegistration || paramState || '';
  const selectedCountry = reviewData?.company?.countryOfIncorporation || paramCountry || '';
  const selectedEnding = paramEnding || '';
  const selectedAddOns = reviewData?.pricing?.addOns || paramAddOns || {};

  // dedup LLC: "Acme LLC LLC" / "Acme L.L.C." + LLC -> single suffix
  const getLegalName = () => {
    if (!companyName) return 'Meridian Global Ventures LLC';
    const suffix = String(selectedEnding || selectedStructure || '').trim();
    if (!suffix) return String(companyName).trim();
    const normalize = (s) => s.toLowerCase().replace(/[\.\s-]/g, '');
    const normSuffix = normalize(suffix);
    let cleaned = String(companyName).trim();
    let parts = cleaned.split(/\s+/);
    while (parts.length > 0 && normalize(parts[parts.length - 1]) === normSuffix) {
      parts.pop();
      cleaned = parts.join(' ');
    }
    return `${cleaned} ${suffix}`.trim();
  };
  const legalName = getLegalName();

  const [isChecked, setIsChecked] = useState(false);
  const [localAddOns, setLocalAddOns] = useState(selectedAddOns || {});

  // Sync if params change (e.g. coming back from OptionalAddOns)
  React.useEffect(() => { setLocalAddOns(selectedAddOns || {}); }, [JSON.stringify(selectedAddOns)]);

  const addOnKeyMap = {
    'Expedited State Filing': 'expeditedFiling',
    'Express EIN': 'expressEin',
    'Bank Approval Assurance': 'bankAssurance',
    'Stripe + PayPal Setup': 'stripePaypal',
  };
  const handleRemoveAddOn = (title) => {
    const key = addOnKeyMap[title];
    if (!key) return;
    setLocalAddOns(prev => ({ ...prev, [key]: false }));
  };

  // derive add-ons list from local state - no fallback, empty if none selected
  const addOns = localAddOns || {};
  const addOnList = [
    addOns.expeditedFiling ? { title: 'Expedited State Filing', subtext: '24-hour Delaware turnaround', price: 99 } : null,
    addOns.expressEin ? { title: 'Express EIN', subtext: 'Tax ID in 3–5 days instead of 4–6 weeks', price: 149 } : null,
    addOns.bankAssurance ? { title: 'Bank Approval Assurance', subtext: 'Guaranteed approval', price: 349 } : null,
    addOns.stripePaypal ? { title: 'Stripe + PayPal Setup', subtext: 'Payment processors ready', price: 179 } : null,
  ].filter(Boolean);

  // Backend GET /review/:companyId -> {company:{companyName,countryOfIncorporation,stateOfRegistration,companyType}, founder, pricing:{structurePrice,statePrice,addOns,addOnsTotal,totalAmount}, pricingType} — frontend calculate nahi
  const pendingOrder = useAppSelector(s => s.auth.pendingOrderData);
  const [reviewData, setReviewData] = useState(null);
  const [backendTotal, setBackendTotal] = useState(
    route.params?.totalAmount ?? route.params?.total_amount ?? pendingOrder?.totalAmount ?? null
  );
  const [loadingTotal, setLoadingTotal] = useState(!reviewData);
  const pricingTypeState = route.params?.pricingType || pendingOrder?.pricingType || '';
  const [fetchedPricingType, setFetchedPricingType] = useState(pricingTypeState);
  const pricingType = fetchedPricingType || pricingTypeState;

  useEffect(() => {
    const cid = route.params?.companyId || pendingOrder?.companyId;
    console.log('=== REVIEW fetch /review/:companyId (signup ke baad backend se) ===', { backendTotal, cid, hasToken: !!token, pricingType, params: route.params });
    if (!cid) return;
    let mounted = true;
    setLoadingTotal(true);
    fetchReviewApi({ companyId: cid, token })
      .then(async res => {
        if (!mounted) return;
        if (res.isSuccess) {
          const d = res.data;
          setReviewData(d);
          // backend: pricing.totalAmount = company.totalAmount || computeOrderTotal(data) — pehle sahi chal raha tha isliye frontend fallback bhi rakho
          // NOTE: structure price sirf USA ke case me add hoga, non-USA me nahi
          let amt = d?.pricing?.totalAmount ?? d?.totalAmount ?? 0;
          if (!amt || Number(amt) === 0) {
            const p = d?.pricing || {};
            const selectedCountryCheck = route.params?.selectedCountry ?? pendingOrder?.selectedCountry ?? d?.company?.countryOfIncorporation ?? selectedCountry ?? 'US';
            const isUS = selectedCountryCheck === 'US';
            const sp = isUS ? Number(route.params?.selectedStructurePrice ?? pendingOrder?.selectedStructurePrice ?? p.structurePrice ?? 299) : 0;
            const st = isUS ? Number(route.params?.selectedStatePrice ?? route.params?.bestStatePrice ?? pendingOrder?.selectedStatePrice ?? pendingOrder?.bestStatePrice ?? p.statePrice ?? 0) : 0;
            const at = Number(route.params?.addOnsTotal ?? pendingOrder?.addOnsTotal ?? p.addOnsTotal ?? 0);
            const fallbackPricing = Number(p.structurePrice || 0) + Number(p.statePrice || 0) + Number(p.addOnsTotal || 0);
            // non-USA me structure add nahi - fallbackCalc me bhi sirf country price ya 0
            const countryPriceFallback = Number(route.params?.selectedCountryPrice ?? pendingOrder?.selectedCountryPrice ?? 0);
            const fallbackCalc = isUS ? (sp + st + at) : (countryPriceFallback || 0) + at;
            const fallbackParams = Number(route.params?.runningTotal || route.params?.totalAmount || route.params?.combinedTotal || pendingOrder?.totalAmount || pendingOrder?.runningTotal || pendingOrder?.combinedTotal || 0);
            // non-USA quoted case me fallback 0 hi rehne do — backend quote ka intezar
            let fallback = fallbackPricing > 0 ? fallbackPricing : fallbackCalc > 0 ? fallbackCalc : fallbackParams;
            if (!isUS && Number(countryPriceFallback) === 0) {
              // quoted non-USA ke liye fallback ko 0 rakho (price define nahi)
              fallback = 0;
            }
            console.log('=== REVIEW fallback compute (backend 0) pehle jaisa calc ===', { pricing: p, sp, st, at, fallbackPricing, fallbackCalc, fallbackParams, fallback, routeParams: route.params, pendingOrder, rawData: d });
            if ((!fallback || fallback === 0) && cid && token) {
              try {
                const compRes = await fetchClientCompanyDetails({ companyId: cid, token });
                const directAmt = compRes.company?.totalAmount ?? compRes.company?.total_amount ?? 0;
                console.log('=== REVIEW direct Company fetch fallback ===', directAmt, compRes.company);
                if (Number(directAmt) > 0) fallback = Number(directAmt);
              } catch (e) { console.log('=== REVIEW direct fetch failed', e.message); }
            }
            if (fallback > 0) amt = fallback;
          }
          if (amt != null) setBackendTotal(Number(amt));
          // Fix: price wale country (allCountries price != '') ko fixed karo, chahe backend quoted de
          const hasCountryPrice = Number(route.params?.selectedCountryPrice || pendingOrder?.selectedCountryPrice || 0) > 0;
          if (hasCountryPrice && d?.pricingType === 'quoted') {
            setFetchedPricingType('fixed');
          } else if (d?.pricingType) setFetchedPricingType(d.pricingType);
          console.log('=== REVIEW /review success ===', JSON.stringify(d, null, 2));
        } else {
          console.log('=== REVIEW /review failed ===', res.error);
        }
      })
      .finally(() => mounted && setLoadingTotal(false));
    return () => { mounted = false; };
  }, [route.params?.companyId, pendingOrder?.companyId, token]);

  // Agar backend 0 bhej raha hai to $0 dikhao (Quote note alag se), "Quote on request" se total hide nahi hoga
  const displayTotal = loadingTotal ? '...' : backendTotal != null ? `$${backendTotal}` : '—';
  // Button logic: quoted (price nahi) -> Continue -> Your Order, price hai -> Confirm & Pay
  const selectedCountryForBtn = route.params?.selectedCountry ?? pendingOrder?.selectedCountry ?? selectedCountry ?? 'US';
  const isUSForBtn = selectedCountryForBtn === 'US';
  const hasPriceForBtn = Number(route.params?.selectedCountryPrice ?? pendingOrder?.selectedCountryPrice ?? 0) > 0
    || Number(route.params?.selectedStatePrice ?? pendingOrder?.selectedStatePrice ?? 0) > 0
    || Number(route.params?.bestStatePrice ?? pendingOrder?.bestStatePrice ?? 0) > 0
    || (isUSForBtn && Number(route.params?.selectedStructurePrice ?? pendingOrder?.selectedStructurePrice ?? 0) > 0)
    || Number(backendTotal ?? 0) > 0;
  const isQuotedForBtn = pricingType === 'quoted' || !hasPriceForBtn;

  const handleConfirm = async () => {
    const companyId = route.params?.companyId || pendingOrder?.companyId;
    if (!companyId) {
      Toast.show({ type: 'error', text1: 'Company ID missing' });
      return;
    }
    // jis country ka price define nahi hai (custom quote) -> Confirm ke baad direct OrderDetailsScreen (Your Order)
    // structure price sirf USA me count hoga
    const selectedCountryForConfirm = route.params?.selectedCountry ?? pendingOrder?.selectedCountry ?? selectedCountry ?? 'US';
    const isUSForConfirm = selectedCountryForConfirm === 'US';
    const hasPriceForConfirm = Number(route.params?.selectedCountryPrice ?? pendingOrder?.selectedCountryPrice ?? 0) > 0
      || Number(route.params?.selectedStatePrice ?? pendingOrder?.selectedStatePrice ?? 0) > 0
      || Number(route.params?.bestStatePrice ?? pendingOrder?.bestStatePrice ?? 0) > 0
      || (isUSForConfirm && Number(route.params?.selectedStructurePrice ?? pendingOrder?.selectedStructurePrice ?? 0) > 0)
      || Number(backendTotal ?? 0) > 0;
    const isQuoted = pricingType === 'quoted' || !hasPriceForConfirm;
    if (isQuoted) {
      const orderData = {
        selectedStructure, companyName, selectedEnding, selectedState, selectedCountry,
        selectedCountryPrice: route.params?.selectedCountryPrice ?? 0,
        selectedStatePrice: route.params?.selectedStatePrice ?? 0,
        selectedStructurePrice: route.params?.selectedStructurePrice ?? 0,
        bestState: route.params?.bestState, bestStatePrice: route.params?.bestStatePrice,
        bestStatePriceNote: route.params?.bestStatePriceNote, bestStateTimeframe: route.params?.bestStateTimeframe,
        selectedAddOns: addOns, totalAmount: 0, pricingType: 'quoted',
        fullName: route.params?.fullName, email: route.params?.email, countryOfResidence: route.params?.countryOfResidence, phone: route.params?.phone,
        companyState: selectedState, structure: selectedStructure, orderId: `CV-${Date.now()}`,
        advisorFlow: route.params?.advisorFlow, selectedJurisdiction: route.params?.selectedJurisdiction,
        purpose: route.params?.purpose, customerLocation: route.params?.customerLocation, priorities: route.params?.priorities,
        dayOneNeeds: route.params?.dayOneNeeds, physicalPresence: route.params?.physicalPresence, usStatePriority: route.params?.usStatePriority,
        countryCode: route.params?.countryCode, companyId, clientId: route.params?.clientId || pendingOrder?.clientId, token: route.params?.token || token,
      };
      console.log('=== REVIEW quoted -> OrderDetails (no price) ===', JSON.stringify(orderData, null, 2));
      dispatch(setPendingOrderData({ ...orderData, amount: 0, runningTotal: 0 }));
      const emailForSession = route.params?.email || pendingOrder?.email || '';
      const full = route.params?.fullName || '';
      const tkn = route.params?.token || token;
      const cId = route.params?.clientId || pendingOrder?.clientId;
      if (tkn) {
        dispatch(setAuthSession({ user: { _id: cId || undefined, id: cId || undefined, email: emailForSession, name: full || emailForSession || 'User', firstName: full.split(' ')[0] || '', lastName: full.split(' ').slice(1).join(' ') || '', isEmailVerified: true, hasCompletedOnboarding: true }, token: tkn }));
      } else {
        dispatch(setAuthSession({ user: { _id: cId || 'demo-id', id: cId || 'demo-id', email: emailForSession || 'user@demo.com', name: full || 'User', firstName: full.split(' ')[0] || 'User', lastName: full.split(' ').slice(1).join(' ') || '', isEmailVerified: true, hasCompletedOnboarding: true }, token: 'demo-token-' + Date.now() }));
      }
      dispatch(setPendingOpenOrderDetails(true));
      Toast.show({ type: 'info', text1: 'Quote requested', text2: 'Track status in Your Order' });
      return;
    }
    try {
      // Step 3 -> 4: Confirm & Pay — backend confirmSignup: computeOrderTotal + payment_pending (quoted pe error)
      const confirmRes = await confirmSignupApi({ companyId, token });
      const confirmedTotal = confirmRes.totalAmount ?? backendTotal;
      Toast.show({ type: 'success', text1: confirmRes.message || 'Signup confirmed' });
      const orderData = {
        selectedStructure,
        companyName,
        selectedEnding,
        selectedState,
        selectedCountry,
        selectedCountryPrice: route.params?.selectedCountryPrice,
        selectedStatePrice: route.params?.selectedStatePrice,
        selectedStructurePrice: route.params?.selectedStructurePrice,
        bestState: route.params?.bestState,
        bestStatePrice: route.params?.bestStatePrice,
        bestStatePriceNote: route.params?.bestStatePriceNote,
        bestStateTimeframe: route.params?.bestStateTimeframe,
        selectedAddOns: addOns,
        totalAmount: confirmedTotal,
        pricingType: confirmRes.pricingType || pricingType,
        fullName: route.params?.fullName,
        email: route.params?.email,
        countryOfResidence: route.params?.countryOfResidence,
        phone: route.params?.phone,
        companyState: selectedState,
        structure: selectedStructure,
        shareCapital: '€25,000',
        shareholdersCount: '3 people',
        orderId: `CV-${Date.now()}`,
        advisorFlow: route.params?.advisorFlow,
        selectedJurisdiction: route.params?.selectedJurisdiction,
        purpose: route.params?.purpose,
        customerLocation: route.params?.customerLocation,
        priorities: route.params?.priorities,
        dayOneNeeds: route.params?.dayOneNeeds,
        physicalPresence: route.params?.physicalPresence,
        usStatePriority: route.params?.usStatePriority,
        countryCode: route.params?.countryCode,
        companyId,
        clientId: route.params?.clientId,
        token: route.params?.token || token,
      };
      console.log('=== REVIEW confirmSignup -> COMPLETE PAYMENT DATA ===', JSON.stringify(orderData, null, 2));
      dispatch(setPendingOrderData(orderData));
      navigation.navigate('CompletePayment', orderData);
    } catch (e) {
      const msg = e?.response?.data?.message || e.message;
      // Fix: price wale country ko fixed treat karo — quoted error aaye to bhi CompletePayment pe bhejo
      const hasCountryPrice = Number(route.params?.selectedCountryPrice || pendingOrder?.selectedCountryPrice || 0) > 0;
      if (hasCountryPrice && String(msg).toLowerCase().includes('quote')) {
        const confirmedTotal = backendTotal;
        const orderData = {
          selectedStructure, companyName, selectedEnding, selectedState, selectedCountry,
          selectedCountryPrice: route.params?.selectedCountryPrice, selectedStatePrice: route.params?.selectedStatePrice,
          selectedStructurePrice: route.params?.selectedStructurePrice, bestState: route.params?.bestState, bestStatePrice: route.params?.bestStatePrice,
          bestStatePriceNote: route.params?.bestStatePriceNote, bestStateTimeframe: route.params?.bestStateTimeframe,
          selectedAddOns: addOns, totalAmount: confirmedTotal, pricingType: 'fixed',
          fullName: route.params?.fullName, email: route.params?.email, countryOfResidence: route.params?.countryOfResidence, phone: route.params?.phone,
          companyState: selectedState, structure: selectedStructure, orderId: `CV-${Date.now()}`,
          advisorFlow: route.params?.advisorFlow, selectedJurisdiction: route.params?.selectedJurisdiction,
          purpose: route.params?.purpose, customerLocation: route.params?.customerLocation, priorities: route.params?.priorities,
          dayOneNeeds: route.params?.dayOneNeeds, physicalPresence: route.params?.physicalPresence, usStatePriority: route.params?.usStatePriority,
          countryCode: route.params?.countryCode, companyId, clientId: route.params?.clientId, token: route.params?.token || token,
        };
        dispatch(setPendingOrderData(orderData));
        navigation.navigate('CompletePayment', orderData);
        return;
      }
      Toast.show({ type: 'error', text1: 'Confirm failed', text2: msg });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#080E18" />

      <View style={styles.header}>
        <BackButton onPress={() => {
          // Review se back pe direct Signup (FounderDetails) par jao - skip EmailVerify/SetPassword
          if (route?.params?.from === 'FounderDetails' || route?.params?.advisorFlow) {
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'FounderDetails', params: route.params }],
              })
            );
          } else {
            navigation.goBack();
          }
        }} />
        <Image source={logoR} style={styles.topLogo} />
        <View style={{ width: 38 }} />
      </View>

     

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>
            Review & <Text style={styles.italicTitle}>confirm</Text>
          </Text>
          <Text style={styles.subtitle}>Check everything is correct before we file.</Text>
        </View>

        {/* GET /review/:companyId ka data — signup ke baad backend se */}
        {loadingTotal && !reviewData ? (
          <View style={[styles.companyCard, { alignItems: 'center', paddingVertical: 20 }]}>
            <ActivityIndicator size="small" color="#D4AF37" />
            <Text style={{ color: '#94A3B8', fontSize: 11, marginTop: 8 }}>Loading review from backend...</Text>
          </View>
        ) : null}
        {/* Company + Founder Summary — reviewData.company + reviewData.founder + reviewData.pricing se */}
        <View style={styles.summarySection}>
          <View style={styles.companyCard}>
            <View style={styles.summaryHeader}>
              <View style={styles.summaryHeaderLeft}>
                <View style={styles.summaryIconBox}>
                  <Feather name="briefcase" size={12} color="#D4AF37" />
                </View>
                <Text style={styles.summaryHeaderTitle}>COMPANY {reviewData ? `· ${String(reviewData.companyId).slice(-6).toUpperCase()}` : ''}</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('CompanyNaming')} style={styles.editBtn}>
                <Feather name="edit-2" size={12} color="#D4AF37" />
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.summaryRowSmall}>
              <Text style={styles.summaryLabel}>Legal name</Text>
              <Text style={styles.summaryValueGold}>{legalName}</Text>
            </View>
            {reviewData?.company?.alternateCompanyName ? (
              <View style={styles.summaryRowSmall}>
                <Text style={styles.summaryLabel}>Alternate name</Text>
                <Text style={styles.summaryValue}>{reviewData.company.alternateCompanyName}</Text>
              </View>
            ) : null}
            <View style={styles.summaryRowSmall}>
              <Text style={styles.summaryLabel}>Jurisdiction</Text>
              <Text style={styles.summaryValue}>{reviewData?.company ? `${reviewData.company.countryOfIncorporation || 'US'} ${reviewData.company.stateOfRegistration || selectedState}, ${reviewData.company.countryOfIncorporation || 'USA'}` : `US ${selectedState}, USA`}</Text>
            </View>
            <View style={styles.summaryRowSmall}>
              <Text style={styles.summaryLabel}>Structure</Text>
              <Text style={styles.summaryValue}>{reviewData?.company?.companyType || selectedStructure}</Text>
            </View>
            {reviewData?.registrationStatus ? (
              <View style={styles.summaryRowSmall}>
                <Text style={styles.summaryLabel}>Status</Text>
                <Text style={[styles.summaryValue, { color: '#10B981' }]}>{reviewData.registrationStatus}</Text>
              </View>
            ) : null}
            {reviewData?.pricingType ? (
              <View style={styles.summaryRowSmall}>
                <Text style={styles.summaryLabel}>Pricing</Text>
                <Text style={styles.summaryValue}>{reviewData.pricingType}</Text>
              </View>
            ) : null}
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
              <Text style={styles.summaryValue}>{reviewData?.founder ? `${reviewData.founder.firstName || ''} ${reviewData.founder.lastName || ''}`.trim() : (route.params?.fullName || 'Rajesh Kumar Sharma')}</Text>
            </View>
            <View style={styles.summaryRowSmall}>
              <Text style={styles.summaryLabel}>Email</Text>
              <Text style={styles.summaryValue} numberOfLines={1}>{reviewData?.founder?.email || route.params?.email || 'rajesh@meridianglobal.com'}</Text>
            </View>
            <View style={styles.summaryRowSmall}>
              <Text style={styles.summaryLabel}>Residence</Text>
              <View style={styles.residenceValue}>
                <Text style={styles.summaryValueSmall}>{reviewData?.founder?.countryCode || 'IN'}</Text>
                <Text style={styles.summaryValue}> {reviewData?.founder?.address?.country || reviewData?.founder?.phoneNumber || route.params?.countryOfResidence || 'India'}</Text>
              </View>
            </View>
            {reviewData?.founder?.phoneNumber ? (
              <View style={styles.summaryRowSmall}>
                <Text style={styles.summaryLabel}>Phone</Text>
                <Text style={styles.summaryValue}>{reviewData.founder.phoneNumber}</Text>
              </View>
            ) : null}
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
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={styles.addOnPrice}>${item.price}</Text>
                    <TouchableOpacity onPress={() => handleRemoveAddOn(item.title)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Ionicons name="close-circle" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
                {idx < addOnList.length - 1 && <View style={styles.itemSeparator} />}
              </View>
            ))
          )}
        </View>

        {route.params?.advisorFlow && route.params?.bestState ? (
          <View style={[styles.summaryCard, { borderColor: 'rgba(16,185,129,0.3)' }]}>
            <View style={styles.summaryRow}>
              <View>
                <Text style={styles.summaryTitle}>Recommended jurisdiction</Text>
                <Text style={styles.summarySubtext}>{route.params.bestState} · {route.params.bestStatePriceNote || ''}</Text>
              </View>
              <Text style={styles.summaryPrice}>${route.params.bestStatePrice}</Text>
            </View>
            <Text style={{ color: '#10B981', fontSize: 11, marginTop: 6 }}>★ Best Match for you · {route.params.bestStateTimeframe || ''}</Text>
          </View>
        ) : null}

        <View style={styles.summaryCard}>
          {/* Backend pricing breakdown — signup ke baad GET /review/:companyId se */}
          {reviewData?.pricing && (
            <>
              <View style={styles.summaryRow}>
                <View>
                  <Text style={styles.summaryTitle}>Structure price</Text>
                  <Text style={styles.summarySubtext}>{selectedStructure}</Text>
                </View>
                <Text style={styles.summaryPrice}>${reviewData.pricing.structurePrice ?? 0}</Text>
              </View>
              <View style={styles.summaryRow}>
                <View>
                  <Text style={styles.summaryTitle}>State fee</Text>
                  <Text style={styles.summarySubtext}>{selectedState}</Text>
                </View>
                <Text style={styles.summaryPrice}>${reviewData.pricing.statePrice ?? 0}</Text>
              </View>
            </>
          )}
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryTitle}>Add-ons ({addOnList.length})</Text>
              <Text style={styles.summarySubtext}>{addOnList.map(a => a.title.split(' ')[0]).join(' · ') || 'None'}</Text>
            </View>
            {loadingTotal && <ActivityIndicator size="small" color="#D4AF37" />}
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalAmount}>{displayTotal}</Text>
          </View>
          {pricingType === 'quoted' && (
            <Text style={{ color: '#94A3B8', fontSize: 11, marginTop: 6 }}>Quoted jurisdiction — final quote backend se aayega</Text>
          )}
          {reviewData && (
            <Text style={{ color: '#64748B', fontSize: 10, marginTop: 6 }}>Company ID: {String(reviewData.companyId).slice(-8)} · {reviewData.registrationStatus}</Text>
          )}
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
          <Text style={styles.confirmButtonText}>{loadingTotal ? 'Confirm & Continue' : isQuotedForBtn ? 'Continue' : `Confirm & Pay ${displayTotal}`}</Text>
          <Ionicons name="arrow-forward" size={18} color="#0A111D" />
        </TouchableOpacity>

        <Text style={styles.footerSubtext}>
          {isQuotedForBtn ? 'Continue to Your Order · Quote will be prepared' : <>Secure payment · <Text style={styles.footerSubtextBold}>100% refund if we can't form</Text></>}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080E18' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: s(34), marginBottom: s(8), paddingHorizontal: s(16) },
  topLogo: { width: 150, height: 38, resizeMode: 'contain', marginTop: s(10) },
  progressContainer: { flexDirection: 'row', paddingHorizontal: s(20), marginTop: s(6), marginBottom: s(10), gap: 8 },
  progressStepActive: { flex: 1, height: 3, backgroundColor: '#D4AF37', borderRadius: 2 },
  scrollContent: { paddingHorizontal: s(16), paddingBottom: s(20) },
  summarySection: { gap: 12, marginBottom: s(12) },
  companyCard: { backgroundColor: '#0C1622', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: s(14), borderTopWidth: 1, borderTopColor: 'rgba(212,175,55,0.15)' },
  summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: s(12) },
  summaryHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  summaryIconBox: { width: 26, height: 26, borderRadius: 7, backgroundColor: 'rgba(212,175,55,0.12)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.25)', justifyContent: 'center', alignItems: 'center' },
  summaryHeaderTitle: { color: '#8E9BAE', fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  editText: { color: '#D4AF37', fontSize: 11, fontWeight: '600' },
  summaryRowSmall: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: s(4) },
  summaryLabel: { color: '#6C7A8E', fontSize: 12 },
  summaryValue: { color: '#FFFFFF', fontSize: 12, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  summaryValueGold: { color: '#D4AF37', fontSize: 12, fontWeight: '700', maxWidth: '60%', textAlign: 'right' },
  summaryValueSmall: { color: '#8E9BAE', fontSize: 10, fontWeight: '700', backgroundColor: 'rgba(255,255,255,0.06)', paddingHorizontal: s(4), paddingVertical: s(1), borderRadius: 3, overflow: 'hidden' },
  residenceValue: { flexDirection: 'row', alignItems: 'center' },
  titleContainer: { marginVertical: s(10) },
  mainTitle: { fontSize: 28, fontWeight: '700', color: '#FFFFFF', marginBottom: s(4) },
  italicTitle: { fontStyle: 'italic', fontWeight: '400', color: '#D4AF37' },
  subtitle: { color: '#8E9BAE', fontSize: 14 },
  includedCard: { backgroundColor: '#0C1622', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.2)', paddingVertical: s(12), paddingHorizontal: s(14), marginVertical: s(10) },
  checkGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 8, columnGap: 16 },
  checkItem: { flexDirection: 'row', alignItems: 'center' },
  checkItemText: { color: '#8E9BAE', fontSize: 12, marginLeft: s(6) },
  addOnsCard: { backgroundColor: '#0C1622', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', padding: s(14), marginBottom: s(12) },
  addOnsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: s(12) },
  addOnsTitleRow: { flexDirection: 'row', alignItems: 'center' },
  addOnsHeaderText: { color: '#8E9BAE', fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginLeft: s(6) },
  changeButton: { flexDirection: 'row', alignItems: 'center' },
  changeText: { color: '#D4AF37', fontSize: 12, fontWeight: '600', marginLeft: s(4) },
  addOnItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: s(4) },
  addOnTextGroup: { flex: 1, paddingRight: s(10) },
  addOnTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  addOnSubtext: { color: '#6C7A8E', fontSize: 11, marginTop: s(2) },
  addOnPrice: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  itemSeparator: { height: 1, backgroundColor: 'rgba(255, 255, 255, 0.05)', marginVertical: s(10) },
  summaryCard: { backgroundColor: '#0C1622', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.3)', padding: s(16), marginBottom: s(12) },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: s(12) },
  summaryTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  summarySubtext: { color: '#6C7A8E', fontSize: 11, marginTop: s(2) },
  summaryPrice: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  summaryDivider: { height: 1, backgroundColor: 'rgba(255, 255, 255, 0.08)', marginVertical: s(10) },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: s(4) },
  totalLabel: { color: '#8E9BAE', fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  totalAmount: { color: '#D4AF37', fontSize: 28, fontWeight: '700' },
  timelineBanner: { backgroundColor: 'rgba(0, 230, 118, 0.05)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.2)', padding: s(12), flexDirection: 'row', alignItems: 'center', marginBottom: s(16) },
  timelineIcon: { marginRight: s(10) },
  timelineText: { color: '#8E9BAE', fontSize: 12, flex: 1 },
  timelineBold: { color: '#00E676', fontWeight: '700' },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: s(10) },
  checkbox: { width: 20, height: 20, borderRadius: 5, borderWidth: 1, borderColor: '#4A5768', backgroundColor: '#0C1622', justifyContent: 'center', alignItems: 'center', marginRight: s(10) },
  checkboxActive: { backgroundColor: '#D4AF37', borderColor: '#D4AF37' },
  checkboxLabel: { color: '#8E9BAE', fontSize: 12, flex: 1, lineHeight: 16 },
  footerContainer: { paddingHorizontal: s(16), paddingTop: s(10), paddingBottom: s(16), backgroundColor: '#080E18' },
  confirmButton: { backgroundColor: '#D4AF37', height: 52, borderRadius: 26, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  confirmButtonText: { color: '#0A111D', fontSize: 16, fontWeight: '700', marginRight: s(8) },
  footerSubtext: { color: '#5B6B7C', fontSize: 11, textAlign: 'center', marginTop: s(10) },
  footerSubtextBold: { color: '#D4AF37', fontWeight: '600' },
});
