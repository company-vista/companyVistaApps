import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, BackHandler, Easing, Pressable, StyleSheet, Text, View, } from 'react-native';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import styles from './HomeScreen.styles';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { logoutUser, setPendingAddCompany, setPendingOpenOrderDetails, setPendingOpenRegistrationProgress, setPendingOpenRegistrationTracking, setRedirectToLogin } from '../../../store/slices/authSlice';
import { useThemeColors } from '../../../theme/colors';
// Import subcomponents
import { HomeHeader } from './homeScreenComponent/HomeHeader';
import { BottomNavBar } from './homeScreenComponent/BottomNavBar';
import { QuickActionFab } from './homeScreenComponent/QuickActionFab';
import { CompanySwitcherModal } from './homeScreenComponent/CompanySwitcherModal';
import { notifications } from '../../notifications/data/notifications';
import { fetchNotifications } from '../../notifications/api/notificationsApi';
import { fetchClientCompanies, fetchClientCompanyDetails, } from '../api/clientProfileApi';
import { getCompanyTotalAmount, isRegistrationUnpaid } from '../../../utils/companyStatus';
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
    const pendingAddCompany = useAppSelector(state => state.auth.pendingAddCompany);
    const [activeTab, setActiveTab] = useState(initialTab ?? 'home');
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [activeCompanySection, setActiveCompanySection] = useState(null);
    const [isManageOptionsOpen, setIsManageOptionsOpen] = useState(false);
    const [isManageScreenOpen, setIsManageScreenOpen] = useState(false);
    const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);
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
    const [editingCompanyId, setEditingCompanyId] = useState(null);
    const prevNotificationCount = useRef(0);
    const [companyOptions, setCompanyOptions] = useState([]);
    const [isCompanySwitcherOpen, setIsCompanySwitcherOpen] = useState(false);
    const [selectedDocumentForView, setSelectedDocumentForView] = useState(null);
    const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
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
    const isCompanyUnpaid = (c) => {
        if (!c) return false;
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

    // Payment complete hone ke baad Home par wapas aane par company list refresh karo,
    // warna "Payment pending" banner stale status ki wajah se ghoomta rahega
    const [refreshTick, setRefreshTick] = useState(0);
    const refreshedAfterPaymentRef = useRef(false);
    useFocusEffect(useCallback(() => {
        if (hasCompletedPaymentFlag && !refreshedAfterPaymentRef.current) {
            refreshedAfterPaymentRef.current = true;
            setRefreshTick(t => t + 1);
        }
    }, [hasCompletedPaymentFlag]));

    // Quoted country (price undefined) -> Review ke baad auto OrderDetailsScreen khulega
    useEffect(() => {
        if (pendingOpenOrderDetails) {
            setIsOrderDetailsOpen(true);
            dispatch(setPendingOpenOrderDetails(false));
        }
    }, [pendingOpenOrderDetails, dispatch]);

    // Back allow — quoted/fixed chahe pending ho, back pe dusri company dekh sake (toast block hata diya)
    // Previous block: BackHandler return true + toast "Complete payment to continue" removed
    useEffect(() => {
        if (routePendingHomeAction === 'subscription') {
            setIsSubscriptionOpen(true);
            setSearchOpenedScreen('subscription');
        }
        else if (routePendingHomeAction === 'addCompany') {
            setIsAddCompanyOpen(true);
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
    }, [routePendingHomeAction]);
    // Signup flow: after login, open AddCompany directly without showing Home (per requirement)
    useEffect(() => {
        if (pendingAddCompany) {
            setIsAddCompanyOpen(true);
            dispatch(setPendingAddCompany(false));
        }
    }, [pendingAddCompany, dispatch]);
    const isAddCompanyMandatory = isAddCompanyOpen && !editingCompanyId && companyOptions.length === 0 && user?.isCompleteRegistration === false;
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
        setIsLoadingCompanies(true);
        fetchClientCompanies({ token, userId })
            .then(result => {
                if (!isMounted) {
                    return;
                }
                const loadedCompanies = result.companies.length > 0 ? result.companies : userCompanies;
                const mappedCompanies = loadedCompanies.map(mapCompanyToListItem);
                setCompanyOptions(mappedCompanies);
                setSelectedCompany(currentCompany => {
                    if (currentCompany) {
                        return currentCompany;
                    }
                    return mappedCompanies[0] ?? null;
                });
                // Auto-open Add Company only if registration incomplete (fresh signup) and no companies
                if (mappedCompanies.length === 0 && !isLoadingCompanies && user?.isCompleteRegistration === false) {
                    setIsAddCompanyOpen(true);
                }
            })
            .finally(() => {
                if (isMounted) {
                    setIsLoadingCompanies(false);
                }
            });
        return () => {
            isMounted = false;
        };
    }, [token, userCompanies, userId, refreshTick]);
    // Registration incomplete (false) -> dashboard block
    // Agar koi company ka payment pending hai to Add Company force mat karo - user ko pehle pay karne do
    useEffect(() => {
        if (user?.isCompleteRegistration === false && !isAddCompanyOpen && !isRegistrationTrackingOpen && token && !unpaidCompany) {
            setIsAddCompanyOpen(true);
        }
    }, [user?.isCompleteRegistration, isAddCompanyOpen, isRegistrationTrackingOpen, token, unpaidCompany]);
    // Ensure onboarding AddCompany auto-opens only for incomplete registration with no companies
    useEffect(() => {
        if (!isLoadingCompanies && companyOptions.length === 0 && !isAddCompanyOpen && !isRegistrationTrackingOpen && token && user?.isCompleteRegistration === false && !unpaidCompany) {
            setIsAddCompanyOpen(true);
        }
    }, [isLoadingCompanies, companyOptions.length, isAddCompanyOpen, isRegistrationTrackingOpen, token, user?.isCompleteRegistration, unpaidCompany]);
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
    const refreshCompanies = useCallback((selectCompanyId) => {
        fetchClientCompanies({ token, userId }).then(result => {
            const loadedCompanies = result.companies.length > 0 ? result.companies : userCompanies;
            const mappedCompanies = loadedCompanies.map(mapCompanyToListItem);
            setCompanyOptions(mappedCompanies);
            if (selectCompanyId) {
                const found = mappedCompanies.find(c => c.id === selectCompanyId);
                if (found)
                    setSelectedCompany(found);
            }
            else if (mappedCompanies.length > 0) {
                setSelectedCompany(mappedCompanies[0]);
            }
        });
    }, [token, userId, userCompanies]);
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
        const raw = company?.raw ?? {};
        const pType = String(company?.pricingType ?? raw?.pricingType ?? raw?.pricing_type ?? raw?.registrationRequestData?.pricingType ?? raw?.pricing?.pricingType ?? raw?.registrationRequestData?.pricing_type ?? '').toLowerCase();
        const totalAmt = Number(company?.totalAmount ?? raw?.totalAmount ?? raw?.registrationRequestData?.totalAmount ?? 0);
        const status = String(raw?.registrationStatus ?? company?.registrationStatus ?? '').toLowerCase();
        const isQuotedSel = pType === 'quoted' || (!pType && totalAmt === 0 && status === 'pending');
        setSelectedCompany(company);
        closeCompanySwitcher();
        if (isQuotedSel) {
            // quoted company pe click -> Your Order dikhe, fixed -> dashboard
            setIsOrderDetailsOpen(true);
        } else {
            setIsOrderDetailsOpen(false);
        }
    }
    // quoted company auto open Your Order when selected (hero or switcher initial load), fixed pe dashboard
    useEffect(() => {
        if (!selectedCompany) return;
        const raw = selectedCompany?.raw ?? {};
        const pType = String(selectedCompany?.pricingType ?? raw?.pricingType ?? raw?.pricing_type ?? raw?.registrationRequestData?.pricingType ?? raw?.pricing?.pricingType ?? raw?.registrationRequestData?.pricing_type ?? '').toLowerCase();
        const totalAmt = Number(selectedCompany?.totalAmount ?? raw?.totalAmount ?? raw?.registrationRequestData?.totalAmount ?? 0);
        const status = String(raw?.registrationStatus ?? selectedCompany?.registrationStatus ?? '').toLowerCase();
        const isQuotedAuto = pType === 'quoted' || (!pType && totalAmt === 0 && status === 'pending');
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
        }} onRefreshCompanies={() => refreshCompanies(trackingCompanyId ?? selectedCompany?.id)} onEditPress={(companyId) => {
            setIsRegistrationTrackingOpen(false);
            setEditingCompanyId(companyId || selectedCompany?.id || null);
            setIsAddCompanyOpen(true);
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
            {activeTab === 'home' ? (isLoadingCompanies ? <DashboardSkeleton /> : <HomeTabContent isLoadingCompanies={isLoadingCompanies} selectedCompany={selectedCompany ?? companyOptions[0] ?? null} onCompanyInfoPress={() => setActiveCompanySection('menu')} onCompanySwitcherPress={openCompanySwitcher} onManagePress={() => setIsManageOptionsOpen(true)} onAddToCompanyPress={() => setIsAddCompanyOpen(true)} onRegistrationTrackingPress={openRegistrationTrackingScreen} onOrderPress={() => setIsOrderDetailsOpen(true)} onQuickAccessItemPress={(itemId) => {                if (itemId === 'companyProfile')
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
            setIsAddCompanyOpen(true);
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

        <CompanySwitcherModal isOpen={isCompanySwitcherOpen} isLoading={isLoadingCompanies} companyOptions={companyOptions} selectedCompany={selectedCompany} companySwitcherOpacity={companySwitcherOpacity} companySwitcherTranslateY={companySwitcherTranslateY} onSelectCompany={selectCompanyFromSwitcher} onClose={closeCompanySwitcher} colors={colors} safeAreaInsets={safeAreaInsets} />
    </View>);
}
