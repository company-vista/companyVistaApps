import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import BackButton from '../../../components/buttons/BackButton';
import logoR from '../../../assets/images/logoR.png';
import { CommonActions } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { setPendingOrderData, setAuthSession, setPendingOpenOrderDetails, setPendingCloseAddCompany, setPendingAddCompany, signupUser } from '../../../store/slices/authSlice';
import { fetchReviewApi, confirmSignupApi } from '../api/orderApi';
import { fetchClientCompanyDetails } from '../../../features/home/api/clientProfileApi';
import { resolvePricingType, hasRealPrice } from '../../../utils/priceCalculator';
import { s } from '../../../theme/responsive';

export default function ReviewAndConfirmScreen({ navigation, route }) {
  const dispatch = useAppDispatch();
  const token = useAppSelector(s => s.auth.token);
  React.useEffect(() => {
    console.log('=== REVIEW & SUBMIT SCREEN DATA ===', JSON.stringify(route?.params, null, 2));
  }, []);
  // Add Company flow me existing client auto-skip hota hai FounderDetails se —
  // Review ke back par wapas FounderDetails par kyun bhyeja (form khulna galat hai).
  // Sirf normal signup flow me back → FounderDetails reset zaroori hai taaki
  // EmailVerify/SetNewPassword intermediate screens skip ho jayen.
  React.useEffect(() => {
    const unsub = navigation.addListener('beforeRemove', (e) => {
      if (e.data.action.type === 'GO_BACK' && !route?.params?.isAddCompanyFlow && (route?.params?.from === 'FounderDetails' || route?.params?.advisorFlow)) {
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
    // LLC/structure suffix sirf USA ke liye — quoted/non-US me backend bhi LLC add nahi karta
    const suffix = selectedCountry === 'US' ? String(selectedEnding || selectedStructure || '').trim() : '';
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
  const [confirming, setConfirming] = useState(false);

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
  // Add-ons total yahi se nikalo (UI list ka hi source) — route param stale ho
  // sakta hai aur CompletePayment dueNow is value par based hai.
  const selectedAddOnsTotal = addOnList.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  // Backend GET /review/:companyId -> {company:{companyName,countryOfIncorporation,stateOfRegistration,companyType}, founder, pricing:{structurePrice,statePrice,addOns,addOnsTotal,totalAmount}, pricingType} — frontend calculate nahi
  const pendingOrder = useAppSelector(s => s.auth.pendingOrderData);
  const [reviewData, setReviewData] = useState(null);
  // Deferred Add-Company flow: company abhi backend me bani hi nahi => backend me
  // se total nahi aayega. Params se compute karke dikhao (fixed) ya 0 (quoted).
  const [backendTotal, setBackendTotal] = useState(() => {
    const fromParams = route.params?.totalAmount ?? route.params?.total_amount ?? pendingOrder?.totalAmount ?? null;
    if (fromParams != null) return Number(fromParams);
    const hasDeferredPayload = !!(route.params?.signupPayload || pendingOrder?.signupPayload);
    if (hasDeferredPayload) {
      const cCheck = route.params?.selectedCountry ?? pendingOrder?.selectedCountry ?? 'US';
      const isUSCalc = cCheck === 'US';
      const cp = Number(route.params?.selectedCountryPrice ?? pendingOrder?.selectedCountryPrice ?? 0);
      const stp = isUSCalc ? Number(route.params?.selectedStatePrice ?? route.params?.bestStatePrice ?? pendingOrder?.selectedStatePrice ?? pendingOrder?.bestStatePrice ?? 0) : 0;
      const scp = isUSCalc ? Number(route.params?.selectedStructurePrice ?? pendingOrder?.selectedStructurePrice ?? 299) : 0;
      const at = Number(route.params?.addOnsTotal ?? pendingOrder?.addOnsTotal ?? 0);
      if (isUSCalc) return scp + stp + at;
      return cp > 0 ? cp + at : 0;
    }
    return null;
  });
  const [loadingTotal, setLoadingTotal] = useState(!reviewData);
  const pricingTypeState = route.params?.pricingType || pendingOrder?.pricingType || '';
  const [fetchedPricingType, setFetchedPricingType] = useState(pricingTypeState);
  // Backend computeOrderTotal sirf USA ko 'fixed' maanta hai — GB/HK/CA jaise
  // priced jurisdictions ko wo 'quoted' + total 0 bhej deta hai. Isliye params
  // me koi real price hai to frontend 'fixed' resolve karta hai, warna backend.
  // Ye companyId ke bina bhi chalta hai (Add Company deferred flow).
  const pricingType = resolvePricingType(
    { ...(pendingOrder || {}), ...(route.params || {}) },
    fetchedPricingType || pricingTypeState
  );

  useEffect(() => {
    const cid = route.params?.companyId || pendingOrder?.companyId;
    console.log('=== REVIEW fetch /review/:companyId (signup ke baad backend se) ===', { backendTotal, cid, hasToken: !!token, pricingType, params: route.params });
    if (!cid) {
      // Add Company deferred flow — company abhi backend me nahi bani, "Your Order"
      // click par banege. Loading state mat atko (button label freeze na ho).
      setLoadingTotal(false);
      return;
    }
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
              // Sach custom-quote (price define nahi) country ke liye 0 rakho.
              // Priced non-US (GB/HK/CA) ka countryPriceFallback > 0 hota hai,
              // isliye wo is block se guzarta nahi aur uska price dikhta hai.
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
          // Backend non-US priced country ko 'quoted' + total 0 bhejta hai —
          // params me real price ho to resolved value hi use karo.
          if (d?.pricingType) {
            setFetchedPricingType(resolvePricingType(
              { ...(pendingOrder || {}), ...(route.params || {}) },
              d.pricingType
            ));
          }
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
  const hasPriceForBtn = hasRealPrice({ ...(pendingOrder || {}), ...(route.params || {}) })
    || Number(backendTotal ?? 0) > 0;
  // Fixed-price jurisdiction ke liye kabhi "quoted/Your Order" mat dikhao —
  // chahe stale param ya backend pricingType 'quoted' kyun na ho. Jaise hi koi
  // price present hota hai company fixed hai. Sach price-less (custom quote)
  // country hi quoted dikh sakti hai.
  const isQuotedForBtn = !hasPriceForBtn;

  const handleConfirm = async () => {
    if (confirming) return; // double-click se duplicate company na bane
    setConfirming(true);
    // Deferred flow me pendingOrder purani company ka companyId carry kar sakta hai —
    // ise kabhi reuse mat karo (nai company tabhi banegi jab client yahan click kare).
    const hasDeferredParams = !!(route.params?.signupPayload || route.params?.signupDeferred);
    let companyId = route.params?.companyId || (hasDeferredParams ? undefined : pendingOrder?.companyId);
    // ── Deferred backend save (Add Company flow) ─────────────────────────
    // FounderDetails auto-skip me signupUser call NAHI hota — wahan signupPayload
    // params me carry hota hai. Company backend me tabhi save hoti hai jab client
    // yahan "Your Order"/"Continue" button dabata hai. Isse back/forward loop me
    // duplicate companies nahi banti.
    const deferredPayload = route.params?.signupPayload || pendingOrder?.signupPayload;
    let resolvedClientId = route.params?.clientId || pendingOrder?.clientId;
    let resolvedToken = route.params?.token || pendingOrder?.token || token;
    if (!companyId && deferredPayload) {
      try {
        const res = await dispatch(signupUser(deferredPayload));
        if (!signupUser.fulfilled.match(res) || !res.payload?.companyId) {
          const msg = res.payload?.errors?.email || res.payload?.message || 'Signup failed';
          Toast.show({ type: 'error', text1: 'Could not create company', text2: msg });
          setConfirming(false);
          return;
        }
        companyId = res.payload.companyId;
        resolvedClientId = resolvedClientId || res.payload?.clientId;
        resolvedToken = resolvedToken || res.payload?.token;
        // Recreate the params flow — backend response ke companyId/clientId ke saath
        const confirmedPayload = {
          ...(route.params || {}),
          ...(pendingOrder || {}),
          companyId,
          clientId: resolvedClientId,
          token: resolvedToken,
          isAddCompanyFlow: true,
        };
        dispatch(setPendingOrderData(confirmedPayload));
        console.log('=== REVIEW deferred signup created company ===', companyId, 'clientId', res.payload?.clientId);
      } catch (e) {
        Toast.show({ type: 'error', text1: 'Could not create company', text2: e?.message || 'Network error' });
        setConfirming(false);
        return;
      }
    }
    if (!companyId) {
      Toast.show({ type: 'error', text1: 'Company ID missing' });
      setConfirming(false);
      return;
    }
    // jis country ka price define nahi hai (custom quote) -> Confirm ke baad direct OrderDetailsScreen (Your Order)
    const hasPriceForConfirm = hasPriceForBtn;
    // Same rule as button above — price ho to confirm hamesha fixed rahe
    const isQuoted = !hasPriceForConfirm;
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
        countryCode: route.params?.countryCode, companyId, clientId: resolvedClientId, token: resolvedToken,
        isAddCompanyFlow: route.params?.isAddCompanyFlow === true,
      };
      console.log('=== REVIEW quoted -> OrderDetails (no price) ===', JSON.stringify(orderData, null, 2));
      dispatch(setPendingOrderData({ ...orderData, amount: 0, runningTotal: 0 }));
      const emailForSession = route.params?.email || pendingOrder?.email || '';
      const full = route.params?.fullName || '';
      const tkn = resolvedToken;
      const cId = resolvedClientId;
      if (tkn) {
        dispatch(setAuthSession({ user: { _id: cId || undefined, id: cId || undefined, email: emailForSession, name: full || emailForSession || 'User', firstName: full.split(' ')[0] || '', lastName: full.split(' ').slice(1).join(' ') || '', isEmailVerified: true, hasCompletedOnboarding: true }, token: tkn }));
      } else {
        dispatch(setAuthSession({ user: { _id: cId || 'demo-id', id: cId || 'demo-id', email: emailForSession || 'user@demo.com', name: full || 'User', firstName: full.split(' ')[0] || 'User', lastName: full.split(' ').slice(1).join(' ') || '', isEmailVerified: true, hasCompletedOnboarding: true }, token: 'demo-token-' + Date.now() }));
      }
      dispatch(setPendingOpenOrderDetails(true));
      // Quoted (Your Order) confirm par wizard DONE hai — AddCompany/RegistrationLanding
      // dobara auto-open mat karo (SetNewPassword ne pendingAddCompany true kiya tha)
      dispatch(setPendingAddCompany(false));
      // Add Company (modal) me ho to modal band karo — HomeScreen pendingOpenOrderDetails
      // dekhega aur OrderDetailsScreen (Your Order) auto-khulega. Status/VerifyIdentity wala hi pattern.
      if (route?.params?.isAddCompanyFlow === true) {
        dispatch(setPendingCloseAddCompany(true));
      }
      Toast.show({ type: 'info', text1: 'Quote requested', text2: 'Track status in Your Order' });
      return;
    }
    try {
      // Step 3 -> 4: Confirm & Pay — backend confirmSignup: computeOrderTotal + payment_pending (quoted pe error)
      const confirmRes = await confirmSignupApi({ companyId, token: resolvedToken });
      // Backend non-US priced country ka total 0 + pricingType 'quoted' bhejta
      // hai. Params me price hai to frontend ka total/pricingType hi source hai.
      const backendConfirmedTotal = Number(confirmRes.totalAmount ?? 0);
      const confirmedTotal = hasPriceForConfirm && backendConfirmedTotal === 0
        ? (Number(route.params?.runningTotal ?? route.params?.combinedTotal ?? route.params?.selectedCountryPrice ?? 0) || Number(backendTotal ?? 0))
        : (confirmRes.totalAmount ?? backendTotal);
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
        // CompletePayment dueNow = runningTotal || (base + addOns). Add-ons ke
        // saath total yahan se aata hai, warna payment amount se add-ons hat jate hain.
        addOnsTotal: selectedAddOnsTotal,
        runningTotal: confirmedTotal,
        // Backend 'quoted' bhej sakta hai priced country ke liye — params me
        // price hai to resolved pricingType ('fixed') hi use karo.
        pricingType: resolvePricingType(
          { ...(pendingOrder || {}), ...(route.params || {}) },
          confirmRes.pricingType || pricingType
        ),
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
        clientId: resolvedClientId,
        token: resolvedToken,
        // Add Company flow ki identity poore chain me carried karni hai —
        // CompletePayment ise Status tak aage bhejta hai, aur Status/VerifyIdentity
        // isi se decide karte hain ki modal band karna hai ya nahi.
        isAddCompanyFlow: route.params?.isAddCompanyFlow === true,
      };
      console.log('=== REVIEW confirmSignup -> COMPLETE PAYMENT DATA ===', JSON.stringify(orderData, null, 2));
      dispatch(setPendingOrderData(orderData));
      // SetNewPassword ne pendingAddCompany true kiya tha. Ab company ban rahi
      // hai (payment + KYC chain), to wo flag HONA hi chahiye — warna VerifyIdentity
      // ke baad Home mount hote hi us flag par AddCompany wizard (RegistrationLanding)
      // khul jaata tha. Quoted path upar ye same clear karta hai.
      dispatch(setPendingAddCompany(false));
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
          addOnsTotal: selectedAddOnsTotal, runningTotal: confirmedTotal,
          fullName: route.params?.fullName, email: route.params?.email, countryOfResidence: route.params?.countryOfResidence, phone: route.params?.phone,
          companyState: selectedState, structure: selectedStructure, orderId: `CV-${Date.now()}`,
          advisorFlow: route.params?.advisorFlow, selectedJurisdiction: route.params?.selectedJurisdiction,
          purpose: route.params?.purpose, customerLocation: route.params?.customerLocation, priorities: route.params?.priorities,
          dayOneNeeds: route.params?.dayOneNeeds, physicalPresence: route.params?.physicalPresence, usStatePriority: route.params?.usStatePriority,
          countryCode: route.params?.countryCode, companyId, clientId: resolvedClientId, token: resolvedToken,
          isAddCompanyFlow: route.params?.isAddCompanyFlow === true,
        };
        dispatch(setPendingOrderData(orderData));
        // Same reason as success path — ye bhi payment chain start karta hai
        dispatch(setPendingAddCompany(false));
        navigation.navigate('CompletePayment', orderData);
        return;
      }
      Toast.show({ type: 'error', text1: 'Confirm failed', text2: msg });
      setConfirming(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#080E18" />

      <View style={styles.header}>
        <BackButton onPress={() => {
          // Add Company flow me FounderDetails auto-skip hota hai — back par wapas
          // founder page dikhana galat hai. Normal goBack (CompanyNaming/OptionalAddOns)
          // karo. Sirf normal signup flow me reset to FounderDetails skip ke liye.
          if (!route?.params?.isAddCompanyFlow && (route?.params?.from === 'FounderDetails' || route?.params?.advisorFlow)) {
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
            <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 8 }}>Loading review from backend...</Text>
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
              <Text style={styles.summaryValue}>
                {reviewData?.company
                  ? (selectedCountry === 'US'
                    ? `${reviewData.company.countryOfIncorporation || 'US'} ${reviewData.company.stateOfRegistration || selectedState}, ${reviewData.company.countryOfIncorporation || 'USA'}`
                    : String(selectedCountry || reviewData.company.countryOfIncorporation || '—'))
                  : `US ${selectedState}, USA`}
              </Text>
            </View>
            {/* Structure sirf USA jurisdiction me dikhao — quoted/non-US me LLC galat dikhta hai */}
            {selectedCountry === 'US' && (
              <View style={styles.summaryRowSmall}>
                <Text style={styles.summaryLabel}>Structure</Text>
                <Text style={styles.summaryValue}>{reviewData?.company?.companyType || selectedStructure}</Text>
              </View>
            )}
            {reviewData?.registrationStatus ? (
              <View style={styles.summaryRowSmall}>
                <Text style={styles.summaryLabel}>Status</Text>
                <Text style={[styles.summaryValue, { color: '#10B981' }]}>{reviewData.registrationStatus}</Text>
              </View>
            ) : null}
            {pricingType ? (
              <View style={styles.summaryRowSmall}>
                <Text style={styles.summaryLabel}>Pricing</Text>
                <Text style={styles.summaryValue}>{pricingType}</Text>
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

        {/* Add-ons sirf priced (fixed) jurisdictions me dikhte hain — quoted me hidden */}
        {!isQuotedForBtn && (
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
        )}

        {route.params?.advisorFlow && route.params?.bestState ? (
          <View style={[styles.summaryCard, { borderColor: 'rgba(16,185,129,0.3)' }]}>
            <View style={styles.summaryRow}>
              <View>
                <Text style={styles.summaryTitle}>Recommended jurisdiction</Text>
                <Text style={styles.summarySubtext}>{route.params.bestState} · {route.params.bestStatePriceNote || ''}</Text>
              </View>
              <Text style={styles.summaryPrice}>${route.params.bestStatePrice}</Text>
            </View>
            <Text style={{ color: '#10B981', fontSize: 12, marginTop: 6 }}>★ Best Match for you · {route.params.bestStateTimeframe || ''}</Text>
          </View>
        ) : null}

        <View style={styles.summaryCard}>
          {/* Backend pricing breakdown — signup ke baad GET /review/:companyId se */}
          {/* Quoted (custom quote) me structure/state fee nahi dikhate — quoted country ke liye ye price add hi nahi hota */}
          {reviewData?.pricing && pricingType !== 'quoted' && (
            <>
              {/* Structure price sirf USA jurisdiction me dikhta hai — quoted/non-US me nahi */}
              {selectedCountry === 'US' && (
                <View style={styles.summaryRow}>
                  <View>
                    <Text style={styles.summaryTitle}>Structure price</Text>
                    <Text style={styles.summarySubtext}>{selectedStructure}</Text>
                  </View>
                  <Text style={styles.summaryPrice}>${reviewData.pricing.structurePrice ?? 0}</Text>
                </View>
              )}
              <View style={styles.summaryRow}>
                <View>
                  <Text style={styles.summaryTitle}>State fee</Text>
                  <Text style={styles.summarySubtext}>{selectedState}</Text>
                </View>
                <Text style={styles.summaryPrice}>${reviewData.pricing.statePrice ?? 0}</Text>
              </View>
            </>
          )}
          {!isQuotedForBtn && (
            <View style={styles.summaryRow}>
              <View>
                <Text style={styles.summaryTitle}>Add-ons ({addOnList.length})</Text>
                <Text style={styles.summarySubtext}>{addOnList.map(a => a.title.split(' ')[0]).join(' · ') || 'None'}</Text>
              </View>
              {loadingTotal && <ActivityIndicator size="small" color="#D4AF37" />}
            </View>
          )}

          {!isQuotedForBtn && (
            <>
              <View style={styles.summaryDivider} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>TOTAL</Text>
                <Text style={styles.totalAmount}>{displayTotal}</Text>
              </View>
            </>
          )}
          {pricingType === 'quoted' && (
            <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 6 }}>Quoted jurisdiction — final quote backend se aayega</Text>
          )}
          {reviewData && (
            <Text style={{ color: '#64748B', fontSize: 11, marginTop: 6 }}>Company ID: {String(reviewData.companyId).slice(-8)} · {reviewData.registrationStatus}</Text>
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
        <TouchableOpacity style={[styles.confirmButton, (confirming || !isChecked) && { opacity: 0.5 }]} activeOpacity={0.8} onPress={handleConfirm} disabled={confirming || !isChecked}>
          {/* quoted -> "Your Order" (OrderDetails pe le jata hai), fixed -> "Continue" (payment ke liye) */}
          <Text style={styles.confirmButtonText}>{confirming ? 'Creating…' : loadingTotal ? 'Confirm & Continue' : isQuotedForBtn ? 'Your Order' : 'Continue'}</Text>
          <Ionicons name="arrow-forward" size={18} color="#0A111D" />
        </TouchableOpacity>

        <Text style={styles.footerSubtext}>
          {isQuotedForBtn ? 'Your Order · Quote will be prepared' : <>Secure payment · <Text style={styles.footerSubtextBold}>100% refund if we can't form</Text></>}
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
  summaryHeaderTitle: { color: '#8E9BAE', fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  editText: { color: '#D4AF37', fontSize: 12, fontWeight: '600' },
  summaryRowSmall: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: s(4) },
  summaryLabel: { color: '#6C7A8E', fontSize: 13 },
  summaryValue: { color: '#FFFFFF', fontSize: 13, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  summaryValueGold: { color: '#D4AF37', fontSize: 13, fontWeight: '700', maxWidth: '60%', textAlign: 'right' },
  summaryValueSmall: { color: '#8E9BAE', fontSize: 11, fontWeight: '700', backgroundColor: 'rgba(255,255,255,0.06)', paddingHorizontal: s(4), paddingVertical: s(1), borderRadius: 3, overflow: 'hidden' },
  residenceValue: { flexDirection: 'row', alignItems: 'center' },
  titleContainer: { marginVertical: s(10) },
  mainTitle: { fontSize: 28, fontWeight: '700', color: '#FFFFFF', marginBottom: s(4) },
  italicTitle: { fontStyle: 'italic', fontWeight: '400', color: '#D4AF37' },
  subtitle: { color: '#8E9BAE', fontSize: 15 },
  includedCard: { backgroundColor: '#0C1622', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.2)', paddingVertical: s(12), paddingHorizontal: s(14), marginVertical: s(10) },
  checkGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 8, columnGap: 16 },
  checkItem: { flexDirection: 'row', alignItems: 'center' },
  checkItemText: { color: '#8E9BAE', fontSize: 13, marginLeft: s(6) },
  addOnsCard: { backgroundColor: '#0C1622', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', padding: s(14), marginBottom: s(12) },
  addOnsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: s(12) },
  addOnsTitleRow: { flexDirection: 'row', alignItems: 'center' },
  addOnsHeaderText: { color: '#8E9BAE', fontSize: 12, fontWeight: '700', letterSpacing: 0.5, marginLeft: s(6) },
  changeButton: { flexDirection: 'row', alignItems: 'center' },
  changeText: { color: '#D4AF37', fontSize: 13, fontWeight: '600', marginLeft: s(4) },
  addOnItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: s(4) },
  addOnTextGroup: { flex: 1, paddingRight: s(10) },
  addOnTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  addOnSubtext: { color: '#6C7A8E', fontSize: 12, marginTop: s(2) },
  addOnPrice: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  itemSeparator: { height: 1, backgroundColor: 'rgba(255, 255, 255, 0.05)', marginVertical: s(10) },
  summaryCard: { backgroundColor: '#0C1622', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.3)', padding: s(16), marginBottom: s(12) },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: s(12) },
  summaryTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  summarySubtext: { color: '#6C7A8E', fontSize: 12, marginTop: s(2) },
  summaryPrice: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  summaryDivider: { height: 1, backgroundColor: 'rgba(255, 255, 255, 0.08)', marginVertical: s(10) },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: s(4) },
  totalLabel: { color: '#8E9BAE', fontSize: 13, fontWeight: '700', letterSpacing: 1 },
  totalAmount: { color: '#D4AF37', fontSize: 28, fontWeight: '700' },
  timelineBanner: { backgroundColor: 'rgba(0, 230, 118, 0.05)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.2)', padding: s(12), flexDirection: 'row', alignItems: 'center', marginBottom: s(16) },
  timelineIcon: { marginRight: s(10) },
  timelineText: { color: '#8E9BAE', fontSize: 13, flex: 1 },
  timelineBold: { color: '#00E676', fontWeight: '700' },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: s(10) },
  checkbox: { width: 20, height: 20, borderRadius: 5, borderWidth: 1, borderColor: '#4A5768', backgroundColor: '#0C1622', justifyContent: 'center', alignItems: 'center', marginRight: s(10) },
  checkboxActive: { backgroundColor: '#D4AF37', borderColor: '#D4AF37' },
  checkboxLabel: { color: '#8E9BAE', fontSize: 13, flex: 1, lineHeight: 18 },
  footerContainer: { paddingHorizontal: s(16), paddingTop: s(10), paddingBottom: s(16), backgroundColor: '#080E18' },
  confirmButton: { backgroundColor: '#D4AF37', height: 52, borderRadius: 26, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  confirmButtonText: { color: '#0A111D', fontSize: 16, fontWeight: '700', marginRight: s(8) },
  footerSubtext: { color: '#5B6B7C', fontSize: 12, textAlign: 'center', marginTop: s(10) },
  footerSubtextBold: { color: '#D4AF37', fontWeight: '600' },
});
