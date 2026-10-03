import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, BackHandler, Easing, Pressable, StyleSheet, Text, View, } from 'react-native';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import styles from './HomeScreen.styles';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { logoutUser, setPendingAddCompany, setPendingOpenOrderDetails, setPendingOpenRegistrationProgress, setPendingOpenRegistrationTracking, setPendingCloseAddCompany, setRedirectToLogin } from '../../../store/slices/authSlice';
import { useThemeColors } from '../../../theme/colors';
// Import subcomponents
import { HomeHeader } from './homeScreenComponent/HomeHeader';
import { BottomNavBar } from './homeScreenComponent/BottomNavBar';
import { QuickActionFab } from './homeScreenComponent/QuickActionFab';
import { CompanySwitcherModal } from './homeScreenComponent/CompanySwitcherModal';
import { notifications } from '../../notifications/data/notifications';
import { fetchNotifications } from '../../notifications/api/notificationsApi';
import { fetchClientCompanies, fetchClientCompanyDetails, } from '../api/clientProfileApi';
import { fetchSubscriptionPayments } from '../api/subscriptionPaymentsApi';
import { getCompanyTotalAmount, getSuccessfulPaymentCompanyIds, isCompanyQuoted, isRegistrationUnpaid } from '../../../utils/companyStatus';
import { mapCompanyToListItem } from './quickAccess/companyListItem';
import PullToRefresh from './homeScreenComponent/PullToRefresh';
import BillingTabContent from './invoices/InvoicesTabContent';
import CompanyTabContent from '../components/CompanyTabContent';
import CompanyDetailScreen from '../components/CompanyDetailScreen';
import DocumentsTabContent from './documents/DocumentsTabContent';
import DocumentViewScreen from './documents/DocumentViewScreen';
import ManageCompanyScreen from './manageCompany/ManageCompanyScreen';
import ManageOptionsScreen from './manageCompany/ManageOptionsScreen';
import ServicesScreen from './subscription&services/ServicesScreen';
import SubscriptionScreen from './subscription&services/SubscriptionScreen';
import ExploreServicesScreen from './subscription&services/ExploreServicesScreen';
import ServicesHistoryScreen from './subscription&services/ServicesHistoryScreen';
import RegistrationTrackingScreen from './addCompany/RegistrationTrackingScreen';
import RegistrationProgressScreen from '../../auth/screens/RegistrationProgressScreen';
import ContactSupport from '../../support/screens/SupportScreen';
import HomeTabContent from '../components/HomeTabContent';
import OrderDetailsScreen from '../components/companyInformationSection/yourOrder/OrderDetailsScreen';
import QuoteScreen from '../components/companyInformationSection/yourOrder/QuoteScreen';
import QuoteBreakdownScreen from '../components/companyInformationSection/yourOrder/QuoteBreakdownScreen';
import PaymentMethodScreen from '../components/companyInformationSection/yourOrder/PaymentMethodScreen';
import ShareholdersScreen from '../components/companyInformationSection/yourOrder/ShareholdersScreen';
import VerifyIdentityScreen from '../components/companyInformationSection/yourOrder/VerifyIdentityScreen';
import MoreTabContent from '../components/MoreTabContent';
import ReportsTabContent from './compliances/ReportsTabContent';
import DashboardSkeleton from '../../../components/skeletons/HomeScreen';
const emptyCompanies = [];
// userCompanies ki array identity har profile update par nayi ho jaati hai
// (updateProfileUser naya object banata hai), jabki contents same rehte hain.
// Is liye dep me array nahi, uska content-key use hota hai.
const companyIdsKey = list => (list || []).map(c => String(c?.id ?? c?._id ?? '')).join('|');
export default function HomeScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { initialTab, pendingCompanySection: routePendingCompanySection, pendingHomeAction: routePendingHomeAction, openOrderDetails } = route.params ?? {};
    const safeAreaInsets = useSafeAreaInsets();
    const colors = useThemeColors();
    const dispatch = useAppDispatch();
    const user = useAppSelector(state => state.auth.user);
    const token = useAppSelector(state => state.auth.token);
    const userId = useAppSelector(state => state.auth.user?._id ?? state.auth.user?.id ?? null);
    const userCompanies = useAppSelector(state => state.auth.user?.companies ?? emptyCompanies);
    // Fetch effect ko company list ke CONTENTS se trigger karana hai, identity
    // se nahi — warna har profile update par dobara fetch hota.
    const userCompaniesKey = companyIdsKey(userCompanies);
    const userCompaniesRef = useRef(userCompanies);
    userCompaniesRef.current = userCompanies;
    const pendingAddCompany = useAppSelector(state => state.auth.pendingAddCompany);
    const [activeTab, setActiveTab] = useState(initialTab ?? 'home');
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [activeCompanySection, setActiveCompanySection] = useState(null);
    const [isManageOptionsOpen, setIsManageOptionsOpen] = useState(false);
    const [isManageScreenOpen, setIsManageScreenOpen] = useState(false);
    const [isServicesOpen, setIsServicesOpen] = useState(false);
    const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
    const [searchOpenedScreen, setSearchOpenedScreen] = useState(null);
    const [isExploreServicesOpen, setIsExploreServicesOpen] = useState(false);
    const [isServicesHistoryOpen, setIsServicesHistoryOpen] = useState(false);
    const [isRegistrationTrackingOpen, setIsRegistrationTrackingOpen] = useState(false);
    const [trackingCompanyId, setTrackingCompanyId] = useState(null);
    const [isRegistrationProgressOpen, setIsRegistrationProgressOpen] = useState(false);
    const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
    const [isQuoteOpen, setIsQuoteOpen] = useState(false);
    const [isQuoteBreakdownOpen, setIsQuoteBreakdownOpen] = useState(false);
    const [isPaymentMethodOpen, setIsPaymentMethodOpen] = useState(false);
    const [currentQuote, setCurrentQuote] = useState(null);
    const [isShareholdersOpen, setIsShareholdersOpen] = useState(false);
    const [isVerifyIdentityOpen, setIsVerifyIdentityOpen] = useState(false);
    const [isSupportOpen, setIsSupportOpen] = useState(false);
    const [supportFromRegistrationTracking, setSupportFromRegistrationTracking] = useState(false);
    // AddCompany ab ek alag modal route hai, is liye local "open" boolean se
    // pata nahi chalta ki modal sach me khula hai ya nahi. Ye flag navigate
    // karte waqt set hota hai aur Home dobara focus hone par clear hota hai —
    // is tarah ye hamesha modal ke lifetime se matched rehta hai.
    const [isAddCompanyFlowActive, setIsAddCompanyFlowActive] = useState(false);
    const prevNotificationCount = useRef(0);
    const [companyOptions, setCompanyOptions] = useState([]);
    const [isCompanySwitcherOpen, setIsCompanySwitcherOpen] = useState(false);
    const [selectedDocumentForView, setSelectedDocumentForView] = useState(null);
    // true se shuru karo, false nahi. Warna first render pe companyOptions
    // khali hone ki wajah se real (khaali) Home dikhta hai, phir fetch effect
    // loading true karta hai aur skeleton aa jaata hai — user ko content →
    // skeleton ka flash dikhta hai. true se pehla frame hi skeleton hota hai.
    const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
    // Company list me stale 'payment_pending' status dikhne par bhi, agar us
    // company ki koi SUCCESS payment hui hai to use unpaid na maano.
    // (Backend payment success par purana Payment record update karta hi nahi —
    // DB me pending + success dono reh jaate hain, isliye subscription payments
    // se cross-check kar ke paidCompanyIdsSet banate hain.)
    const [paidCompanyIdsSet, setPaidCompanyIdsSet] = useState(() => new Set());
    const fabMenuAnim = useRef(new Animated.Value(0)).current;
    const companySwitcherAnim = useRef(new Animated.Value(0)).current;
    const moreSlideAnim = useRef(new Animated.Value(320)).current;
    const bellAnim = useRef(new Animated.Value(0)).current;
    const fabMenuOpacity = fabMenuAnim;

    
    useEffect(() => {
        if (routePendingCompanySection) {
            setActiveCompanySection(routePendingCompanySection);
        }
    }, [routePendingCompanySection]);
    const pendingOpenOrderDetails = useAppSelector((s) => s.auth.pendingOpenOrderDetails);
    const pendingOpenRegistrationProgress = useAppSelector((s) => s.auth.pendingOpenRegistrationProgress);
    const pendingOpenRegistrationTracking = useAppSelector((s) => s.auth.pendingOpenRegistrationTracking);
    useEffect(() => {
        if (pendingOpenRegistrationProgress) {
            setIsRegistrationProgressOpen(true);
            dispatch(setPendingOpenRegistrationProgress(false));
        }
    }, [pendingOpenRegistrationProgress, dispatch]);
    // AddCompany wizard poora ho gaya (payment + KYC). Ab modal band karo.
    //
    // Ye Home ke focus pe nahi, plain useEffect me hai — kyun ki abhi Home
    // ke peeche PEECHE chhupa hua hai (modal open hai), to useFocusEffect
    // chalega hi nahi. Wizard screens (VerifyIdentity/Status) khud ye
    // dispatch karte hain, kyunki wo modal ke andar hain aur unke paas
    // MainStack ka navigation nahi hai.
    //
    // Order zaroori: goBack() se pehle flag clear karna, warna effect dobara
    // chal kar dobara goBack() karega.
    const pendingCloseAddCompany = useAppSelector((s) => s.auth.pendingCloseAddCompany);
    useEffect(() => {
        if (!pendingCloseAddCompany) {
            return;
        }
        dispatch(setPendingCloseAddCompany(false));
        navigation.goBack();
    }, [pendingCloseAddCompany, dispatch, navigation]);
    const pendingOrderData = useAppSelector(s => s.auth.pendingOrderData);
    const pendingSignup = useAppSelector(s => s.auth.pendingSignup);
    useEffect(() => {
        if (pendingOpenRegistrationTracking) {
            const pendingId = pendingOrderData?.companyId || pendingOrderData?.company_id || user?.companies?.[0]?._id || user?.companies?.[0]?.id || null;
            const firstPending = companyOptions.find(c => String(c.registrationStatus ?? c.raw?.registrationStatus ?? '').toLowerCase() === 'pending') || companyOptions[0] || selectedCompany;
            const resolvedId = firstPending?.id || selectedCompany?.id || pendingId;
            setTrackingCompanyId(resolvedId || null);
            setIsRegistrationTrackingOpen(true);
            dispatch(setPendingOpenRegistrationTracking(false));
        }
    }, [pendingOpenRegistrationTracking, dispatch, companyOptions, selectedCompany, pendingOrderData, user]);
    // pending lock: sirf tab jab status pending ho AUR amount abhi 0/empty ho - jaise pehle wala Vista/SG case
    // naya Xyz vista C-Corp jaise totalAmount 897 + status pending ho to company show karo (sab fill hai)
    const isCompanyPending = (c) => {
        const raw = c?.raw ?? c;
        // Payment success -> pending order-lock mat lagao (stale status ki wajah se
        // company list atki na rehne jaye).
        if (paidCompanyIdsSet.has(String(c?.id ?? '').trim())) {
            return false;
        }
        const status = String(c?.registrationStatus ?? raw?.registrationStatus ?? c?.status ?? raw?.status ?? '').toLowerCase();
        const totalAmount = raw?.totalAmount ?? raw?.registrationRequestData?.totalAmount ?? c?.totalAmount ?? null;
        const companyType = raw?.companyType ?? c?.companyType ?? '';
        const isPendingStatus = status === 'pending';
        const isZeroAmount = totalAmount === null || totalAmount === '' || Number(totalAmount) === 0;
        // status pending + amount 0 => block, warna show karo
        if (isPendingStatus && isZeroAmount) return true;
        // agar companyType bhi empty aur amount 0 toh bhi pending (incomplete draft)
        if (isZeroAmount && !companyType) return true;
        return false;
    };
    const hasCompletedPaymentFlag = useAppSelector(s => s.auth.hasCompletedPayment);
    // paid user ka auto-detect: agar koi company me totalAmount >0 hai to payment ho chuka maano (purane users ke liye fallback)
    const hasPaidCompany = companyOptions.some(c => Number(c?.raw?.totalAmount ?? c?.raw?.registrationRequestData?.totalAmount ?? c?.totalAmount ?? 0) > 0) || (Array.isArray(user?.companies) && user.companies.some(c => Number(c?.totalAmount ?? c?.registrationRequestData?.totalAmount ?? 0) > 0));
    const isPaid = hasCompletedPaymentFlag || hasPaidCompany;
    // VerifyIdentity/payment ke baad Home dikhao, dubara login pe bhi Home (paid hone pe lock nahi)
    const hasPendingRegistration = !isPaid && companyOptions.some(isCompanyPending);
    // also check raw user.companies as fallback before fetch completes (login response) - but skip if payment already done
    const hasPendingInUser = !isPaid && !hasPendingRegistration && Array.isArray(user?.companies) && user.companies.some(isCompanyPending);
    const isOrderLockedPending = !isPaid && (hasPendingRegistration || hasPendingInUser);

    // ---- Unpaid company detection (per company, global isPaid flag par depend nahi) ----
    // Shared logic: src/utils/companyStatus.js (HomeScreen + Transactions + RegistrationTracking)
    // Banner sirf SELECTED company ka dikhega - doosri company select karne par CTA nahi banega.
    //
    // QUOTED company kabhi unpaid count nahi hoti: uska price define hi nahi hota,
    // admin quote banata hai. Uski payment "pending" status me hoti hai par uske
    // paise maange hi nahi gaye - is liye "Payment pending" + "Pay now" CTA galat
    // message hota. Wo companies apna "Your Order" screen par track hoti hain.
    const isCompanyUnpaid = (c) => {
        if (!c) return false;
        // Payment success ho chuki hai to unpaid check laga hi mat - registrationStatus
        // stale pending bhi ho to paid maano (backend ke stale fields se cross-check tarjeeh).
        if (paidCompanyIdsSet.has(String(c?.id ?? '').trim())) return false;
        if (isCompanyQuoted(c)) return false;
        if (isRegistrationUnpaid(c)) return true;
        const pendingId = pendingSignup?.companyId;
        if (pendingId && String(c?.id ?? '') === String(pendingId)) return true;
        return false;
    };
    // Sirf selected company ka unpaid state matter karta hai.
    // Exception: koi company selected hi nahi hai (list abhi load nahi hui) tab persisted pending
    // signup se CTA dikhao - taaki app restart ke baad resume payment ka raasta na toote.
    const unpaidCompany = (() => {
        if (isCompanyUnpaid(selectedCompany)) return selectedCompany;
        if (selectedCompany) return null;
        if (pendingSignup?.companyId) {
            // persisted quoted signup ka resume-payment CTA bhi nahi chahiye -
            // quote admin se aata hai, user se nahi
            if (isCompanyQuoted({ pricingType: pendingSignup.pricingType, totalAmount: pendingSignup.totalAmount })) return null;
            const amount = Number(pendingSignup.totalAmount) || 0;
            return {
                id: pendingSignup.companyId,
                name: 'your company',
                registrationStatus: 'payment_pending',
                totalAmount: amount,
                raw: { totalAmount: amount },
            };
        }
        return null;
    })();
    const unpaidCompanyAmount = getCompanyTotalAmount(unpaidCompany);
    const unpaidCompanyLabel = unpaidCompany?.name || 'your company';
    const handleResumePaymentPress = useCallback(() => {
        if (!unpaidCompany?.id) {
            Toast.show({ type: 'error', text1: 'Company not found', text2: 'Please contact support to complete this payment' });
            return;
        }
        navigation.navigate('ResumePayment', {
            companyId: String(unpaidCompany.id),
            companyName: unpaidCompanyLabel,
            totalAmount: unpaidCompanyAmount,
            registrationStatus: unpaidCompany?.registrationStatus ?? '',
            state: unpaidCompany?.raw?.state ?? unpaidCompany?.state ?? pendingSignup?.selectedState ?? null,
            country: unpaidCompany?.raw?.countryOfIncorporation ?? pendingSignup?.selectedCountry ?? null,
        });
    }, [unpaidCompany, unpaidCompanyAmount, unpaidCompanyLabel, navigation, pendingSignup?.selectedState, pendingSignup?.selectedCountry]);

    // ---- Naya company banane ka entry point ----
    // Do guards:
    //
    // 1. loading — list abhi aayi hi nahi, to "0 companies" ka conclusion
    //    galat hoga aur unpaid-company ka pata hi nahi chalega. Is liye
    //    isLoadingCompanies par block karte hain.
    //
    // 2. Koi bhi ek company payment pending hai → naya company mat banao. Ye
    //    deliberate rule hai: pichle order ki payment register hone tak aage
    //    ki company nahi banti. Reason technical bhi hai — pendingOrderData /
    //    pendingSignup redux me ek hi slot wale globals hain, do saath chal
    //    rahe orders aapas me data corrupt kar denge.
    //
    //    Ye guard payment registration se khud release hota hai: payment hone
    //    par company ka registrationStatus 'formation_in_progress' ho jaata
    //    hai (finalizeCheckout ya Stripe webhook), isRegistrationUnpaid false
    //    ho jaata hai, aur guard unlock ho jaata hai.
    //
    //    Agar payment KARNE KE BAAD bhi company pending atki rahe, to asli
    //    masla guard ka nahi balki payment status ka hai — us company ka
    //    registrationRequestData.packagePayment.paymentIntentId dekhein.
    const hasUnpaidAnyCompany = companyOptions.some(isCompanyUnpaid);
    const addCompanyBlocked = isLoadingCompanies || hasUnpaidAnyCompany;
    const unpaidCompanies = companyOptions.filter(isCompanyUnpaid);
    const addCompanyBlockedReason = hasUnpaidAnyCompany
        ? (unpaidCompanies.length > 1
            ? `${unpaidCompanies.length} companies ka payment pending hai. Pehle unki payment complete karein.`
            : `Payment pending: ${unpaidCompanies[0]?.name || 'company'}. Pehle iski payment complete karein.`)
        : null;
    // Company list fetch karte waqt ka "loading" snapshot, ref me — kyun ki
    // isLoadingCompanies state se ye effect khud trigger hota hai (upar note
    // dekho). isAddCompanyMandatory is ref ko padhta hai taaki back-press
    // force-logout list load hone tak na ho.
    const isLoadingCompaniesRef = useRef(false);
    // ── Selected company ko live list ke saath reconcile karo ──────────────
    // Company delete/merge hone par wo list se hat jaati hai, par selection ek
    // stale object pakde rehta tha — setCompanyOptions list theek karta hai,
    // setSelectedCompany nahi. Isi wajah se hero card me ghost company dikhti
    // rahi jabki list se hat chuki thi. List me current id dhoondh kar hi
    // selection rakhte hain, warna pehli company par shift (ya null).
    //
    // Ye ek jagah se har path cover karta hai — initial fetch, refreshCompanies,
    // pull-to-refresh. Setter ke andar check karna unsafe tha: wo turant
    // chalta hai jab list set hoti hai, aur yahan list already final hai.
    const companyOptionsKey = companyIdsKey(companyOptions);
    useEffect(() => {
        // Loading ke dauran list khaali/adhuri hoti hai — check karne se
        // valid selection galat se null ho jayegi.
        if (isLoadingCompanies) return;
        const currentList = companyOptions;
        setSelectedCompany(current => {
            if (!current?.id) {
                return currentList[0] ?? null;
            }
            const stillListed = currentList.some(c => String(c.id) === String(current.id));
            return stillListed ? current : (currentList[0] ?? null);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [companyOptionsKey, isLoadingCompanies]);
    // AddCompany modal khola tha ya nahi. Home dobara focus hone par iska pata
    // lagta hai — tabhi company list refresh karni hoti hai (nayi company add
    // hone ke baad). Modal close hone se pehle kabhi focus nahi hota, is liye
    // ye ref poore modal lifetime ko sahi se track karta hai.
    const addCompanyFlowWasOpenRef = useRef(false);
    // skipGuards: sirf apne flow ke internal auto-open ke liye
    // (signup ke baad ka redirect, deep-link 'addCompany'). Wo trigger tabhi
    // chalti hai jab app jaanta hai is user ko company banana hai, is liye
    // loading/unpaid guard wahan rona galat hota — list us waqt load ya
    // payment pending hoti hai. User ke apne tap par guards lagte rahenge.
    const openAddCompanyFlow = useCallback(({ skipGuards = false } = {}) => {
        if (!skipGuards && addCompanyBlocked) {
            Toast.show({
                type: 'error',
                text1: 'Payment pending',
                text2: addCompanyBlockedReason ?? 'Please wait for the current request to finish.',
            });
            return;
        }
        setIsAddCompanyFlowActive(true);
        addCompanyFlowWasOpenRef.current = true;
        navigation.navigate('AddCompany');
    }, [addCompanyBlocked, addCompanyBlockedReason, navigation]);
    // Auto-open (signup redirect / fresh incomplete registration) ke liye
    // one-shot guard. Bina iske company list har refresh par re-navigate hui
    // to user jab bhi fetch settle hota, uska wizard RegistrationLanding par
    // wapas reset ho jata — bahut aakhri aur confusing behaviour.
    const hasAutoOpenedAddCompanyRef = useRef(false);
    const autoOpenAddCompanyFlow = useCallback(() => {
        if (hasAutoOpenedAddCompanyRef.current) return;
        hasAutoOpenedAddCompanyRef.current = true;
        openAddCompanyFlow({ skipGuards: true });
    }, [openAddCompanyFlow]);
    // Company-list fetch effect ise CALL karta hai, is liye us callback ko
    // ref me rakhna zaroori hai — nahi to openAddCompanyFlow ki identity
    // (jo addCompanyBlocked se badalti hai) dep ban kar loading flip ke saath
    // effect ko dobara chala degi: setLoading(true) → refetch →
    // setLoading(false) → refetch... yani home/skeleton baar-baar flash.
    const autoOpenAddCompanyFlowRef = useRef(autoOpenAddCompanyFlow);
    autoOpenAddCompanyFlowRef.current = autoOpenAddCompanyFlow;

    // Payment/registration complete hone ke baad user jab Home par wapas aata
    // hai, company list stale hoti hai — nayi company dikhti hi nahi aur
    // "Payment pending" banner ghoomta rehta hai.
    //
    // Signal: AddCompany modal band hua (Home dobara focus hua) aur wo tab
    // se khula tha. Pehle ka ref-based check har mount par sirf ek refresh
    // karta tha, is liye ye transition miss ho jati thi.
    // ref me hota hai kyunki ye effect kabhi bhi future refresh par chalta
    // hai (jaise app resume), tab tak tab band ho chuka hota hai.
    const pendingSignupCompanyIdToSelectRef = useRef(null);
    const [refreshTick, setRefreshTick] = useState(0);
    // AddCompany modal band hone par nayi company ko select karne ke liye
    // target id. Ref isliye ki focus effect ke `[]` deps me pendingSignup
    // stale na ho — latest value hamesha ref se padhi jaati hai.
    // Sticky rakha gaya hai (sirf non-null par update): payment complete hote
    // hi redux se pendingSignup clear ho jaata hai, aur tab modal band hota
    // hai — agar ref har render par reset hota to yahan null milta aur
    // auto-select kabhi hota hi nahi.
    const latestPendingSignupIdRef = useRef(pendingSignup?.companyId ?? null);
    if (pendingSignup?.companyId) {
        latestPendingSignupIdRef.current = pendingSignup.companyId;
    }
    useFocusEffect(useCallback(() => {
        const flowJustClosed = addCompanyFlowWasOpenRef.current;
        addCompanyFlowWasOpenRef.current = false;
        setIsAddCompanyFlowActive(false);
        if (!flowJustClosed) return;
        // Nayi company ka id yahan khoch lete hain. Refetch ke baad list me
        // wo mil jaayegi to neeche wala effect usko select kar dega. Agar
        // backend list me abhi nahi dikhi (eventual consistency / stale
        // profile cache) to ref reh jaata hai aur agli refresh par select
        // ho jaati hai — current selection tab tak bachayi rehti hai.
        pendingSignupCompanyIdToSelectRef.current = latestPendingSignupIdRef.current;
        // refetch karte waqt poora skeleton mat dikhao. Companies already
        // loaded hain, to refresh ke dauran existing list hi dikhti rahegi —
        // sirf nayi company add hone par content naturally update hoga. Warna
        // har Add-Company close par skeleton flash hota.
        setRefreshTick(t => t + 1);
    }, []));

    // Quoted country (price undefined) -> Review ke baad Your Order (OrderDetailsScreen) khulega.
    // Ab real route par navigate karte hain — pehle setIsOrderDetailsOpen() se sirf
    // Home ka internal state badalta tha, jo tab kaam karta tha jab Home screen pehle se
    // mounted ho. Signup ke baad AuthStack poora unmount ho jaata hai, to navigate karna hi
    // sahi tareeka hai.
    useEffect(() => {
        if (pendingOpenOrderDetails) {
            dispatch(setPendingOpenOrderDetails(false));
            navigation.navigate('YourOrder');
        }
    }, [pendingOpenOrderDetails, dispatch, navigation]);

    // Back allow — quoted/fixed chahe pending ho, back pe dusri company dekh sake (toast block hata diya)
    // Previous block: BackHandler return true + toast "Complete payment to continue" removed
    // Route param sirf ek hi baar handle karna hai. openAddCompanyFlow ki
    // identity har render badal sakti hai (guard state change hone par), to
    // bina ref ke ye effect dobara chal kar user ko beech me kahi aur bhej
    // deta — is liye last handled action yaad rakhte hain.
    const handledRouteActionRef = useRef(null);
    useEffect(() => {
        if (!routePendingHomeAction) {
            return;
        }
        if (handledRouteActionRef.current === routePendingHomeAction) {
            return;
        }
        handledRouteActionRef.current = routePendingHomeAction;
        if (routePendingHomeAction === 'subscription') {
            setIsSubscriptionOpen(true);
            setSearchOpenedScreen('subscription');
        }
        else if (routePendingHomeAction === 'addCompany') {
            openAddCompanyFlow({ skipGuards: true });
        }
        else if (routePendingHomeAction === 'manageOptions') {
            setIsManageOptionsOpen(true);
        }
        else if (routePendingHomeAction === 'requestService') {
            setIsExploreServicesOpen(true);
            setSearchOpenedScreen('exploreServices');
        }
        else if (routePendingHomeAction === 'servicesHistory') {
            setIsServicesHistoryOpen(true);
            setSearchOpenedScreen('servicesHistory');
        }
        else if (routePendingHomeAction === 'transactions') {
            navigation.navigate('Transactions', { companyId: selectedCompany?.id });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- handledRouteActionRef upar hi ek hi action ko ek hi baar handle karne ki guarantee kar raha hai, is liye extra deps (jo beech me identity badal sakte hain) add karne se effect dobara trigger hoga aur user beech me redirect ho jayega.
    }, [routePendingHomeAction, navigation, openAddCompanyFlow, selectedCompany?.id]);
    // Signup flow: after login, open AddCompany directly without showing Home (per requirement)
    useEffect(() => {
        if (pendingAddCompany) {
            autoOpenAddCompanyFlow();
            dispatch(setPendingAddCompany(false));
        }
    }, [pendingAddCompany, dispatch, autoOpenAddCompanyFlow]);
    // Back-out block: ek brand-new user jiske paas 0 company hai aur
    // registration complete nahi hui, wizard se back nahi nikal sakta.
    // Ye sirf tab chalta hai jab AddCompany modal ACTUALLY khula hai —
    // isliye isLoadingCompanies guard zaroori hai, warna list load hone tak
    // user ko force-logout kar deta.
    const isAddCompanyMandatory = isAddCompanyFlowActive && !isLoadingCompaniesRef.current && companyOptions.length === 0 && user?.isCompleteRegistration === false;
    useEffect(() => {
        if (!isAddCompanyMandatory) return;
        const sub = BackHandler.addEventListener('hardwareBackPress', () => {
            dispatch(setRedirectToLogin(true));
            dispatch(logoutUser());
            return true;
        });
        return () => sub.remove();
    }, [isAddCompanyMandatory, dispatch]);
    useEffect(() => {
        Animated.loop(Animated.sequence([
            Animated.timing(bellAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(bellAnim, {
                toValue: -1,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(bellAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(bellAnim, {
                toValue: -1,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(bellAnim, {
                toValue: 0,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.delay(2000),
        ])).start();
    }, [bellAnim]);
    const bellRotation = bellAnim.interpolate({
        inputRange: [-1, 1],
        outputRange: ['-15deg', '15deg'],
    });
    const fabMenuScale = fabMenuAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.2, 1],
    });
    const fabMenuTranslateY = fabMenuAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [22, 0],
    });
    const fabIconRotate = fabMenuAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '45deg'],
    });
    const companySwitcherOpacity = companySwitcherAnim;
    const companySwitcherTranslateY = companySwitcherAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-10, 0],
    });
    const displayName = user?.name ??
        [user?.firstName, user?.lastName].filter(Boolean).join(' ') ??
        'User';
    const isDemoToken = typeof token === 'string' && token.startsWith('demo-token');
    useEffect(() => {
        if (isDemoToken) { setNotificationCount(0); return; }
        if (!selectedCompany?.id) {
            setNotificationCount(0);
            return;
        }
        let isMounted = true;
        fetchNotifications({ token: token ?? undefined }).then(result => {
            if (isMounted) {
                const allList = result.isSuccess ? result.notifications : notifications;
                const filtered = allList.filter(n => n.companyId === selectedCompany.id && !n.isRead);
                setNotificationCount(filtered.length);
            }
        });
        return () => {
            isMounted = false;
        };
    }, [token, selectedCompany?.id, isDemoToken]);
    useEffect(() => {
        prevNotificationCount.current = notificationCount;
    }, [notificationCount]);
    useEffect(() => {
        if (isDemoToken) { setIsLoadingCompanies(false); return; }
        let isMounted = true;
        // Skeleton sirf tab dikhao jab list actually khaali ho. Refresh
        // (refreshTick) ke dauran purani list screen par rehne di jayegi,
        // warna har Add-Company close par skeleton flash hota.
        const isInitialLoad = companyOptions.length === 0;
        if (isInitialLoad) {
            setIsLoadingCompanies(true);
        }
        // NOTE: isLoadingCompanies/companyOptions ko is effect ke dep me
        // nahi daala jaata. Ye effect khud inhe set karta hai, to dep me hone
        // se har change par dobara chalega → refetch → state change → refetch
        // (infinite loop). companyOptions.length sirf effect ke shuru me padha
        // jaata hai, live value ke liye ref use hota hai.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        isLoadingCompaniesRef.current = isInitialLoad;
        fetchClientCompanies({ token, userId })
            .then(result => {
                if (!isMounted) {
                    return;
                }
                const loadedCompanies = result.companies.length > 0 ? result.companies : userCompaniesRef.current;
                const mappedCompanies = loadedCompanies.map(mapCompanyToListItem);
                setCompanyOptions(mappedCompanies);
                // AddCompany ke baad band hua tha → nayi company yahan se
                // select karo. Pehle current selection bachayi rehti thi, jisse
                // user ko nayi company dekhne ke liye manually switch karna
                // padta tha. List me mil jaaye to select, warna ref reh jaata
                // hai aur agli refresh par resolve ho jaata hai.
                const targetId = pendingSignupCompanyIdToSelectRef.current;
                if (targetId) {
                    const match = mappedCompanies.find(c => String(c.id) === String(targetId));
                    if (match) {
                        pendingSignupCompanyIdToSelectRef.current = null;
                        setSelectedCompany(match);
                    }
                } else {
                    setSelectedCompany(currentCompany => {
                        if (currentCompany) {
                            return currentCompany;
                        }
                        return mappedCompanies[0] ?? null;
                    });
                }
                // Auto-open Add Company only if registration incomplete (fresh signup) and no companies.
                // hasCompletedPayment guard zaroori hai: signup ke baad backend ka
                // isCompleteRegistration abhi bhi false bhej sakta hai aur company list
                // abhi empty dikh sakti hai — dono hone par user payment+KYC poora kar
                // chuka hota hai phir bhi RegistrationLanding par wapas aa jaata.
                if (mappedCompanies.length === 0 && user?.isCompleteRegistration === false && !hasCompletedPaymentFlag) {
                    autoOpenAddCompanyFlowRef.current?.();
                }
            })
            .finally(() => {
                isLoadingCompaniesRef.current = false;
                if (isMounted) {
                    setIsLoadingCompanies(false);
                }
            });
        return () => {
            isMounted = false;
        };
        // autoOpenAddCompanyFlow jaan-boojh kar dep me NAHI hai — wo
        // addCompanyBlocked (→ isLoadingCompanies) se derive hota hai, to
        // loading flip par ye effect dobara chalta aur skeleton flash hota.
        // Upar ref ke through call hota hai, jo hamesha latest fn deta hai.
        // companyOptions.length bhi jaan-boojh kar bahar hai (upar padha ja
        // raha hai), warna ye effect apne hi setCompanyOptions se trigger hota.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, userCompaniesKey, userId, refreshTick, isDemoToken, user?.isCompleteRegistration]);
    // Subscription payments se cross-check: agar kisi company ki payment success
    // ho chuki hai to use paid maano - chahe company ka registrationStatus abhi
    // bhi stale 'payment_pending' bheja ja raha ho. Ye pending banner + AddCompany
    // guard dono ko release karta hai. Fail ho jaye to paidCompanyIdsSet khaali
    // rahega, koi galat release nahi - sirf cross-check skip hoga.
    useEffect(() => {
        if (isDemoToken) {
            setPaidCompanyIdsSet(new Set());
            return;
        }
        let isMounted = true;
        fetchSubscriptionPayments(token ?? undefined).then(result => {
            if (!isMounted) return;
            setPaidCompanyIdsSet(getSuccessfulPaymentCompanyIds(result.payments));
        });
        return () => { isMounted = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, refreshTick, isDemoToken, userCompaniesKey]);
    // ResumePayment/payment ke baad Home wapas focus par banner release
    // karne ke liye subscription payments dobara gross karo. Pehle ye set khaali
    // ya purana reh jaata tha jab user Add-Company modal se nahi balki Home ke
    // banner → ResumePayment flow se payment karke lautta tha.
    useFocusEffect(useCallback(() => {
        if (isDemoToken) return;
        fetchSubscriptionPayments(token ?? undefined).then(result => {
            setPaidCompanyIdsSet(getSuccessfulPaymentCompanyIds(result.payments));
        }).catch(() => {});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, isDemoToken, setPaidCompanyIdsSet]));
    useEffect(() => {
        if (isDemoToken) return;
        if (!selectedCompany?.id) {
            return;
        }
        let isMounted = true;
        fetchClientCompanyDetails({
            companyId: selectedCompany.id,
            token,
        }).then(result => {
            if (!isMounted || !result.company) {
                return;
            }
            const detailCompany = mapCompanyToListItem(result.company, 0);
            setSelectedCompany(currentCompany => {
                if (!currentCompany || currentCompany.id !== selectedCompany.id) {
                    return currentCompany;
                }
                return {
                    ...currentCompany,
                    companyType: detailCompany.companyType || currentCompany.companyType,
                    countryOfIncorporation: detailCompany.countryOfIncorporation ||
                        currentCompany.countryOfIncorporation,
                    date: detailCompany.date === 'N/A'
                        ? currentCompany.date
                        : detailCompany.date,
                    ein: detailCompany.ein || currentCompany.ein,
                    formationDate: detailCompany.formationDate && detailCompany.formationDate !== 'N/A'
                        ? detailCompany.formationDate
                        : currentCompany.formationDate,
                    state: detailCompany.state && detailCompany.state !== 'N/A'
                        ? detailCompany.state
                        : currentCompany.state,
                    status: detailCompany.status || currentCompany.status,
                };
            });
            setCompanyOptions(currentCompanies => currentCompanies.map(company => {
                if (company.id !== selectedCompany.id) {
                    return company;
                }
                return {
                    ...company,
                    companyType: detailCompany.companyType || company.companyType,
                    countryOfIncorporation: detailCompany.countryOfIncorporation ||
                        company.countryOfIncorporation,
                    date: detailCompany.date === 'N/A' ? company.date : detailCompany.date,
                    ein: detailCompany.ein || company.ein,
                    formationDate: detailCompany.formationDate && detailCompany.formationDate !== 'N/A'
                        ? detailCompany.formationDate
                        : company.formationDate,
                    state: detailCompany.state && detailCompany.state !== 'N/A'
                        ? detailCompany.state
                        : company.state,
                    status: detailCompany.status || company.status,
                };
            }));
        });
        return () => {
            isMounted = false;
        };
    }, [selectedCompany?.id, token, isDemoToken]);
    function openMoreSheet() {
        closeFabMenu();
        moreSlideAnim.setValue(320);
        setIsMoreOpen(true);
        requestAnimationFrame(() => {
            Animated.timing(moreSlideAnim, {
                toValue: 0,
                duration: 400,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }).start();
        });
    }
    function closeMoreSheet(onClosed) {
        Animated.timing(moreSlideAnim, {
            toValue: 320,
            duration: 220,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
        }).start(() => {
            setIsMoreOpen(false);
            onClosed?.();
        });
    }
    function handleTabPress(tabId) {
        closeFabMenu();
        if (tabId === 'more') {
            openMoreSheet();
            return;
        }
        setActiveTab(tabId);
    }
    function openHelpFeedback() {
        closeMoreSheet(() => navigation.navigate('HelpFeedback'));
    }
    function openFollowUs() {
        closeMoreSheet(() => navigation.navigate('FollowUs'));
    }
    function openSupport() {
        closeMoreSheet(() => navigation.navigate('Support'));
    }
    function openFabMenu() {
        setIsFabMenuOpen(true);
        Animated.timing(fabMenuAnim, {
            toValue: 1,
            duration: 220,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start();
    }
    function closeFabMenu() {
        Animated.timing(fabMenuAnim, {
            toValue: 0,
            duration: 170,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
        }).start(() => {
            setIsFabMenuOpen(false);
        });
    }
    function toggleFabMenu() {
        if (isFabMenuOpen) {
            closeFabMenu();
            return;
        }
        openFabMenu();
    }
    function openCompanySwitcher() {
        setIsCompanySwitcherOpen(true);
        companySwitcherAnim.setValue(0);
        requestAnimationFrame(() => {
            Animated.timing(companySwitcherAnim, {
                toValue: 1,
                duration: 240,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }).start();
        });
    }
    function closeCompanySwitcher() {
        Animated.timing(companySwitcherAnim, {
            toValue: 0,
            duration: 160,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
        }).start(() => {
            setIsCompanySwitcherOpen(false);
        });
    }
    function openTransactionsScreen() {
        closeFabMenu();
        navigation.navigate('Transactions', { companyId: selectedCompany?.id });
    }
    function openServicesScreen() {
        closeFabMenu();
        setIsServicesOpen(true);
    }
    function closeServicesScreen() {
        setIsServicesOpen(false);
    }
    function openExploreServicesScreen() {
        setIsServicesOpen(false);
        setIsExploreServicesOpen(true);
    }
    function closeExploreServicesScreen() {
        setIsExploreServicesOpen(false);
        if (searchOpenedScreen === 'exploreServices') {
            setSearchOpenedScreen(null);
            navigation.navigate('Search', { companyId: selectedCompany?.id });
            return;
        }
        setIsServicesOpen(true);
    }
    function openServicesHistoryScreen() {
        setIsServicesOpen(false);
        setIsServicesHistoryOpen(true);
    }
    function closeServicesHistoryScreen() {
        setIsServicesHistoryOpen(false);
        if (searchOpenedScreen === 'servicesHistory') {
            setSearchOpenedScreen(null);
            navigation.navigate('Search', { companyId: selectedCompany?.id });
            return;
        }
        setIsServicesOpen(true);
    }
    function openRegistrationTrackingScreen() {
        setTrackingCompanyId(selectedCompany?.id ?? null);
        setIsRegistrationTrackingOpen(true);
    }
    // selectCompanyId diya ho to usi company ko select karo, warna "jo company
    // pehle selected thi wo bani rahi hai" usko prefer karo. Default
    // mappedCompanies[0] lena WRONG hai — API order badalne par user ka
    // selected company silently switch ho jata hai.
    const refreshCompanies = useCallback((selectCompanyId) => {
        return fetchClientCompanies({ token, userId }).then(result => {
            const loadedCompanies = result.companies.length > 0 ? result.companies : userCompaniesRef.current;
            const mappedCompanies = loadedCompanies.map(mapCompanyToListItem);
            setCompanyOptions(mappedCompanies);
            setSelectedCompany(current => {
                const targetId = selectCompanyId ?? current?.id;
                if (targetId) {
                    const found = mappedCompanies.find(c => String(c.id) === String(targetId));
                    // Target list me abhi nahi hai (backend ne abhi sync kiya
                    // hua ho) to current selection ko mat todho.
                    if (found)
                        return found;
                    return current;
                }
                return mappedCompanies[0] ?? null;
            });
            return mappedCompanies;
        });
    }, [token, userId]);
    function closeRegistrationTrackingScreen() {
        setIsRegistrationTrackingOpen(false);
        setTrackingCompanyId(null);
        refreshCompanies();
    }
    function openSubscriptionScreen() {
        setIsServicesOpen(false);
        setIsSubscriptionOpen(true);
    }
    function closeSubscriptionScreen() {
        setIsSubscriptionOpen(false);
        if (searchOpenedScreen === 'subscription') {
            setSearchOpenedScreen(null);
            navigation.navigate('Search', { companyId: selectedCompany?.id });
            return;
        }
        setIsServicesOpen(true);
    }
    function selectCompanyFromSwitcher(company) {
        setSelectedCompany(company);
        closeCompanySwitcher();
        if (isCompanyQuoted(company)) {
            // quoted company pe click -> Your Order dikhe, fixed -> dashboard
            setIsOrderDetailsOpen(true);
        } else {
            setIsOrderDetailsOpen(false);
        }
    }
    // quoted company auto open Your Order when selected (hero or switcher initial load), fixed pe dashboard
    useEffect(() => {
        if (!selectedCompany) return;
        const isQuotedAuto = isCompanyQuoted(selectedCompany);
        if (isQuotedAuto && !isOrderDetailsOpen) {
            setIsOrderDetailsOpen(true);
        } else if (!isQuotedAuto && isOrderDetailsOpen) {
            setIsOrderDetailsOpen(false);
        }
    }, [selectedCompany?.id]);
    if (isVerifyIdentityOpen) {
        return <VerifyIdentityScreen onBackPress={() => { setIsVerifyIdentityOpen(false); setIsShareholdersOpen(true); }} />;
    }
    if (isShareholdersOpen) {
        return <ShareholdersScreen onBackPress={() => setIsShareholdersOpen(false)} onContinue={() => { setIsShareholdersOpen(false); setIsVerifyIdentityOpen(true); }} />;
    }
    if (isPaymentMethodOpen) {
        const payAmount = currentQuote?.total ?? 3090;
        const payCurrency = currentQuote?.currency || 'EUR';
        return <PaymentMethodScreen companyId={selectedCompany?.id} amount={payAmount} invoice={{ id: currentQuote?.quoteId || 'Q-2026-0412', companyId: selectedCompany?.id, amount: payAmount, currency: payCurrency }} onBackPress={() => { setIsPaymentMethodOpen(false); setIsQuoteBreakdownOpen(true); }} onPaymentSuccess={() => { setIsPaymentMethodOpen(false); setIsQuoteBreakdownOpen(false); setIsQuoteOpen(false); setIsOrderDetailsOpen(false); setIsShareholdersOpen(false); setIsVerifyIdentityOpen(false); Toast.show({ type: 'success', text1: 'Payment successful!', text2: 'Your order is confirmed - redirecting to Home' }); }} onSelectPayment={(method) => { const label = method === 'stripe' ? 'Stripe' : method === 'razorpay' ? 'Razorpay' : 'UPI'; Toast.show({ type: 'info', text1: `${label} selected` }); }} />;
    }
    if (isQuoteBreakdownOpen) {
        return <QuoteBreakdownScreen quote={currentQuote} onBackPress={() => { setIsQuoteBreakdownOpen(false); setIsQuoteOpen(true); }} onDecline={() => { setIsQuoteBreakdownOpen(false); setIsQuoteOpen(false); setIsOrderDetailsOpen(true); }} onAccept={() => { setIsQuoteBreakdownOpen(false); setIsPaymentMethodOpen(true); }} />;
    }
    if (isQuoteOpen) {
        const quoteAmount = selectedCompany?.amount ?? selectedCompany?.quoteAmount ?? 0;
        return <QuoteScreen amount={quoteAmount} selectedCompany={selectedCompany} quote={currentQuote} onBackPress={() => { setIsQuoteOpen(false); setIsOrderDetailsOpen(true); }} onViewBreakdown={(q) => { if(q) setCurrentQuote(q); setIsQuoteOpen(false); setIsQuoteBreakdownOpen(true); }} />;
    }
    if (isOrderDetailsOpen) {
        const handleOrderBack = () => {
            setIsOrderDetailsOpen(false);
        };
        return <OrderDetailsScreen selectedCompany={selectedCompany} onBackPress={handleOrderBack} onNextPress={(q) => { if(q) setCurrentQuote(q); setIsOrderDetailsOpen(false); setIsQuoteOpen(true); }} onMessagePress={() => { setIsOrderDetailsOpen(false); setIsSupportOpen(true); }} />;
    }
    if (activeCompanySection) {
        return (<CompanyDetailScreen activeSection={activeCompanySection === 'menu' ? undefined : activeCompanySection} selectedCompany={selectedCompany} isLoading={isLoadingCompanies} onBackPress={() => setActiveCompanySection(null)} />);
    }
    if (isManageOptionsOpen) {
        return (<ManageOptionsScreen onBackPress={() => setIsManageOptionsOpen(false)} onRequestChangePress={() => {
            setIsManageOptionsOpen(false);
            setIsManageScreenOpen(true);
        }} />);
    }
    if (isManageScreenOpen) {
        return (<ManageCompanyScreen selectedCompany={selectedCompany} onBackPress={() => {
            setIsManageScreenOpen(false);
            setIsManageOptionsOpen(true);
        }} />);
    }
    if (selectedDocumentForView) {
        return (<DocumentViewScreen documentItem={selectedDocumentForView} onBackPress={() => setSelectedDocumentForView(null)} />);
    }
    if (isServicesOpen) {
        return (<ServicesScreen onBackPress={closeServicesScreen} onSubscriptionPress={openSubscriptionScreen} onExploreServicesPress={openExploreServicesScreen} onServicesHistoryPress={openServicesHistoryScreen} />);
    }
    if (isExploreServicesOpen) {
        return (<ExploreServicesScreen onBackPress={closeExploreServicesScreen} selectedCompany={selectedCompany} />);
    }
    if (isServicesHistoryOpen) {
        return (<ServicesHistoryScreen onBackPress={closeServicesHistoryScreen} selectedCompany={selectedCompany} />);
    }
    if (isSubscriptionOpen) {
        return (<SubscriptionScreen onBackPress={closeSubscriptionScreen} selectedCompany={selectedCompany} />);
    }
    if (isRegistrationProgressOpen) {
        return (<RegistrationProgressScreen navigation={{ goBack: () => setIsRegistrationProgressOpen(false) }} route={{ params: {} }} onActive={() => setIsRegistrationProgressOpen(false)} />);
    }
    if (isRegistrationTrackingOpen) {
        return (<RegistrationTrackingScreen onBackPress={closeRegistrationTrackingScreen} companyId={trackingCompanyId ?? selectedCompany?.id} onPayPress={() => {
            const payTarget = companyOptions.find(c => String(c.id) === String(trackingCompanyId ?? selectedCompany?.id)) ?? selectedCompany;
            if (!isRegistrationUnpaid(payTarget)) {
                handleResumePaymentPress();
                return;
            }
            const amount = getCompanyTotalAmount(payTarget);
            navigation.navigate('ResumePayment', {
                companyId: String(payTarget?.id ?? ''),
                companyName: payTarget?.name ?? 'your company',
                totalAmount: amount,
                registrationStatus: payTarget?.registrationStatus ?? '',
                state: payTarget?.raw?.state ?? payTarget?.state ?? null,
                country: payTarget?.raw?.countryOfIncorporation ?? null,
            });
        }} onRefreshCompanies={() => refreshCompanies(trackingCompanyId ?? selectedCompany?.id)} onEditPress={() => {
            setIsRegistrationTrackingOpen(false);
            // Pehle ye 'add company' wizard kholta tha — jo company EDIT karne
            // ke bajaye ek NAYI company bana deta tha. Wizard me koi edit mode
            // nahi hai, is liye ab user ko usi company ke detail screen par
            // bheja ja raha hai.
            setActiveCompanySection('menu');
        }} onContactSupport={() => {
            setIsRegistrationTrackingOpen(false);
            setSupportFromRegistrationTracking(true);
            setIsSupportOpen(true);
        }} />);
    }
    if (isSupportOpen) {
        return (<ContactSupport onBackPress={() => {
            setIsSupportOpen(false);
            if (supportFromRegistrationTracking) {
                setSupportFromRegistrationTracking(false);
                setIsRegistrationTrackingOpen(true);
            }
        }} />);
    }
    const HEADER_CONTENT_HEIGHT = 72;
    return (<View style={styles.screen}>
        {/* Full-screen skeleton overlay (covers fixed header too) */}
        {isLoadingCompanies ? (<View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 40,
            paddingTop: safeAreaInsets.top,
            backgroundColor: colors.surface,
        }}>
            <DashboardSkeleton />
        </View>) : null}

        {/* Fixed header wrapper */}
        <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: safeAreaInsets.top + HEADER_CONTENT_HEIGHT,
            zIndex: 30,
            justifyContent: 'center',
            paddingTop: safeAreaInsets.top,
            backgroundColor: colors.surface,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.03,
            shadowRadius: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        }}>
            <HomeHeader displayName={displayName} notificationCount={notificationCount} bellRotation={bellRotation} onSearchPress={() => navigation.navigate('Search', { companyId: selectedCompany?.id })} onNotificationPress={() => navigation.navigate('Notifications', { companyId: selectedCompany?.id })} colors={colors} />
        </View>

        <PullToRefresh token={token} selectedCompanyId={selectedCompany?.id} colors={colors} onNotificationCountChange={setNotificationCount} progressViewOffset={safeAreaInsets.top + HEADER_CONTENT_HEIGHT + 16} contentContainerStyle={[
            styles.content,
            {
                flexGrow: 1,
                paddingTop: safeAreaInsets.top + HEADER_CONTENT_HEIGHT + 16, // leave space for fixed header
                paddingBottom: safeAreaInsets.bottom + 75,
            },
        ]} showsVerticalScrollIndicator={false}>
            {activeTab === 'home' && unpaidCompany ? (
                <View style={styles.pendingPaymentBanner}>
                    <Text style={styles.pendingPaymentTitle}>Payment pending</Text>
                    <Text style={styles.pendingPaymentText}>
                        Payment is still pending for {unpaidCompanyLabel}{unpaidCompanyAmount > 0 ? ` · $${unpaidCompanyAmount} due` : ''}
                    </Text>
                    <Pressable style={styles.pendingPaymentButton} onPress={handleResumePaymentPress}>
                        <FontAwesome name="credit-card" size={15} color="#0A111D" />
                        <Text style={styles.pendingPaymentButtonText}>
                            {unpaidCompanyAmount > 0 ? `Pay $${unpaidCompanyAmount} now` : 'Pay now'}
                        </Text>
                    </Pressable>
                </View>
            ) : null}
            {activeTab === 'home' ? (isLoadingCompanies ? <DashboardSkeleton /> : <HomeTabContent isLoadingCompanies={isLoadingCompanies} selectedCompany={selectedCompany ?? companyOptions[0] ?? null} onCompanyInfoPress={() => setActiveCompanySection('menu')} onCompanySwitcherPress={openCompanySwitcher} onManagePress={() => setIsManageOptionsOpen(true)} onAddToCompanyPress={() => openAddCompanyFlow()} onRegistrationTrackingPress={openRegistrationTrackingScreen} onOrderPress={() => setIsOrderDetailsOpen(true)} onQuickAccessItemPress={(itemId) => {                if (itemId === 'companyProfile')
                    navigation.navigate('CompanyProfile');
                else if (itemId === 'invoiceCenter')
                    navigation.navigate('InvoiceCenter');
                else if (itemId === 'businessReports')
                    navigation.navigate('BusinessReports');
                else if (itemId === 'helpDesk')
                    navigation.navigate('HelpDesk');
                else if (itemId === 'federalFiling')
                    navigation.navigate('FederalFiling');
            }} onQuickAccessViewAllPress={() => navigation.navigate('QuickAccess')} onTransactionsPress={openTransactionsScreen} onServicesPress={openServicesScreen} onOpenComplianceHistory={(action) => navigation.navigate('ComplianceHistory', { selectedAction: action })} colors={colors} />) : null}
            {activeTab === 'company' ? (<CompanyTabContent selectedCompany={selectedCompany} onSectionPress={setActiveCompanySection} />) : null}
            {activeTab === 'reports' ? (<ReportsTabContent selectedCompany={selectedCompany} onOpenRenewPage={(action) => {
                if (action.id === 'federal_filing')
                    navigation.navigate('FederalFiling', { selectedAction: action });
                else if (action.id === 'address')
                    navigation.navigate('AddressRenewal', { selectedAction: action });
                else if (action.id === 'annual_filing')
                    navigation.navigate('AnnualFiling');
                else if (action.id === 'resident')
                    navigation.navigate('RenewCompliance', { selectedAction: action });
            }} onOpenComplianceHistory={(action) => navigation.navigate('ComplianceHistory', { selectedAction: action })} />) : null}
            {activeTab === 'billing' ? (<BillingTabContent onInvoicePress={(invoice) => navigation.navigate('InvoiceDetail', { invoice })} selectedCompany={selectedCompany} />) : null}
            {activeTab === 'documents' ? (<DocumentsTabContent selectedCompany={selectedCompany} onDocumentViewPress={doc => setSelectedDocumentForView(doc)} />) : null}
        </PullToRefresh>

        {activeTab === 'home' ? <QuickActionFab isFabMenuOpen={isFabMenuOpen} fabMenuOpacity={fabMenuOpacity} fabMenuScale={fabMenuScale} fabMenuTranslateY={fabMenuTranslateY} fabIconRotate={fabIconRotate} onToggleMenu={toggleFabMenu} onCloseMenu={closeFabMenu} colors={colors} safeAreaInsets={safeAreaInsets} onTransactionsPress={openTransactionsScreen} onAddCompanyPress={() => {
            closeFabMenu();
            openAddCompanyFlow();
        }} onRegistrationTrackingPress={openRegistrationTrackingScreen} /> : null}

        <BottomNavBar activeTab={activeTab} isMoreOpen={isMoreOpen} onTabPress={handleTabPress} colors={colors} safeAreaInsets={safeAreaInsets} />

        {isMoreOpen ? (<View style={styles.moreOverlay}>
            <Pressable onPress={() => closeMoreSheet()} style={[styles.moreBackdrop, { backgroundColor: colors.backdrop }]} />
            <Animated.View style={[
                styles.moreSheet,
                {
                    backgroundColor: colors.sheet,
                    paddingBottom: safeAreaInsets.bottom + 24,
                    transform: [{ translateY: moreSlideAnim }],
                },
            ]}>
                <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
                <View style={styles.sheetHeader}>
                    <Text style={[styles.sheetTitle, { color: colors.text }]}>
                        More
                    </Text>
                    <Pressable onPress={() => closeMoreSheet()} style={[
                        styles.sheetCloseButton,
                        { backgroundColor: colors.surface },
                    ]}>
                        <FontAwesome name="close" size={18} color={colors.text} />
                    </Pressable>
                </View>
                <MoreTabContent onFollowUsPress={openFollowUs} onHelpFeedbackPress={openHelpFeedback} onSupportPress={openSupport} onProfilePress={() => navigation.navigate('Profile')} onSettingsPress={() => { closeMoreSheet(); navigation.navigate('Settings'); }} />
            </Animated.View>
        </View>) : null}

        <CompanySwitcherModal isOpen={isCompanySwitcherOpen} isLoading={isLoadingCompanies} companyOptions={companyOptions} selectedCompany={selectedCompany} companySwitcherOpacity={companySwitcherOpacity} companySwitcherTranslateY={companySwitcherTranslateY} onSelectCompany={selectCompanyFromSwitcher} onClose={closeCompanySwitcher} onAddCompany={openAddCompanyFlow} addCompanyBlocked={addCompanyBlocked} addCompanyBlockedReason={addCompanyBlockedReason} colors={colors} safeAreaInsets={safeAreaInsets} />
    </View>);
}
