import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, Text, View, } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import styles from './HomeScreen.styles';
import { useAppSelector } from '../../../store/hooks';
import { useThemeColors } from '../../../theme/colors';
// Import subcomponents
import { HomeHeader } from './homeScreenComponent/HomeHeader';
import { BottomNavBar } from './homeScreenComponent/BottomNavBar';
import { QuickActionFab } from './homeScreenComponent/QuickActionFab';
import { CompanySwitcherModal } from './homeScreenComponent/CompanySwitcherModal';
import { notifications } from '../../notifications/data/notifications';
import { fetchNotifications } from '../../notifications/api/notificationsApi';
import { fetchClientCompanies, fetchClientCompanyDetails, } from '../api/clientProfileApi';
import { mapCompanyToListItem } from './quickAccess/companyListItem';
import PullToRefresh from './homeScreenComponent/PullToRefresh';
import BillingTabContent from './invoices/InvoicesTabContent';
import CompanyTabContent from '../components/CompanyTabContent';
import CompanyDetailScreen from '../components/CompanyDetailScreen';
import DocumentsTabContent from './documents/DocumentsTabContent';
import DocumentViewScreen from './documents/DocumentViewScreen';
import ManageCompanyScreen from './manageCompany/ManageCompanyScreen';
import ManageOptionsScreen from './manageCompany/ManageOptionsScreen';
import ServicesScreen from './ServicesScreen';
import SubscriptionScreen from './SubscriptionScreen';
import AddCompanyScreen from './addCompany/AddCompanyScreen';
import RegistrationTrackingScreen from './addCompany/RegistrationTrackingScreen';
import ContactSupport from '../../support/screens/SupportScreen';
import HomeTabContent from '../components/HomeTabContent';
import MoreTabContent from '../components/MoreTabContent';
import ReportsTabContent from './compliances/ReportsTabContent';
const emptyCompanies = [];
export default function HomeScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { initialTab, pendingCompanySection: routePendingCompanySection, pendingHomeAction: routePendingHomeAction } = route.params ?? {};
    const safeAreaInsets = useSafeAreaInsets();
    const colors = useThemeColors();
    const user = useAppSelector(state => state.auth.user);
    const token = useAppSelector(state => state.auth.token);
    const userId = useAppSelector(state => state.auth.user?._id ?? state.auth.user?.id ?? null);
    const userCompanies = useAppSelector(state => state.auth.user?.companies ?? emptyCompanies);
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
    const [isRegistrationTrackingOpen, setIsRegistrationTrackingOpen] = useState(false);
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
    useEffect(() => {
        if (routePendingHomeAction === 'subscription') {
            setIsSubscriptionOpen(true);
        }
        else if (routePendingHomeAction === 'addCompany') {
            setIsAddCompanyOpen(true);
        }
        else if (routePendingHomeAction === 'manageOptions') {
            setIsManageOptionsOpen(true);
        }
        else if (routePendingHomeAction === 'transactions') {
            navigation.navigate('Transactions', { companyId: selectedCompany?.id });
        }
    }, [routePendingHomeAction]);
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
    useEffect(() => {
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
    }, [token, selectedCompany?.id]);
    useEffect(() => {
        prevNotificationCount.current = notificationCount;
    }, [notificationCount]);
    useEffect(() => {
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
            })
            .finally(() => {
                if (isMounted) {
                    setIsLoadingCompanies(false);
                }
            });
        return () => {
            isMounted = false;
        };
    }, [token, userCompanies, userId]);
    useEffect(() => {
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
                    status: detailCompany.status || company.status,
                };
            }));
        });
        return () => {
            isMounted = false;
        };
    }, [selectedCompany?.id, token]);
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
    function openRegistrationTrackingScreen() {
        closeFabMenu();
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
        refreshCompanies();
    }
    function openSubscriptionScreen() {
        setIsServicesOpen(false);
        setIsSubscriptionOpen(true);
    }
    function closeSubscriptionScreen() {
        setIsSubscriptionOpen(false);
        setIsServicesOpen(true);
    }
    function selectCompanyFromSwitcher(company) {
        setSelectedCompany(company);
        closeCompanySwitcher();
    }
    if (activeCompanySection) {
        return (<CompanyDetailScreen activeSection={activeCompanySection === 'menu' ? undefined : activeCompanySection} selectedCompany={selectedCompany} onBackPress={() => setActiveCompanySection(null)} />);
    }
    if (isAddCompanyOpen) {
        return (<AddCompanyScreen onBackPress={() => { setIsAddCompanyOpen(false); setEditingCompanyId(null); }} onSubmit={(companyId) => {
            setIsAddCompanyOpen(false);
            setEditingCompanyId(null);
            setIsRegistrationTrackingOpen(true);
            refreshCompanies(companyId);
        }} companyId={editingCompanyId} />);
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
        return (<ServicesScreen onBackPress={closeServicesScreen} onSubscriptionPress={openSubscriptionScreen} />);
    }
    if (isSubscriptionOpen) {
        return (<SubscriptionScreen onBackPress={closeSubscriptionScreen} selectedCompany={selectedCompany} />);
    }
    if (isRegistrationTrackingOpen) {
        return (<RegistrationTrackingScreen onBackPress={closeRegistrationTrackingScreen} companyId={selectedCompany?.id} onRefreshCompanies={() => refreshCompanies(selectedCompany?.id)} onEditPress={(companyId) => {
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
                paddingTop: safeAreaInsets.top + HEADER_CONTENT_HEIGHT + 16, // leave space for fixed header
                paddingBottom: safeAreaInsets.bottom + 116,
            },
        ]} showsVerticalScrollIndicator={false}>
            {activeTab === 'home' ? (<HomeTabContent isLoadingCompanies={isLoadingCompanies} selectedCompany={selectedCompany ?? companyOptions[0] ?? null} onCompanyInfoPress={() => setActiveCompanySection('menu')} onCompanySwitcherPress={openCompanySwitcher} onManagePress={() => setIsManageOptionsOpen(true)} onAddToCompanyPress={() => setIsAddCompanyOpen(true)} onQuickAccessItemPress={(itemId) => {
                if (itemId === 'companyProfile')
                    navigation.navigate('CompanyProfile');
                else if (itemId === 'invoiceCenter')
                    navigation.navigate('InvoiceCenter');
                else if (itemId === 'businessReports')
                    navigation.navigate('BusinessReports');
                else if (itemId === 'helpDesk')
                    navigation.navigate('HelpDesk');
                else if (itemId === 'federalFiling')
                    navigation.navigate('FederalFiling');
            }} onQuickAccessViewAllPress={() => navigation.navigate('QuickAccess')} onTransactionsPress={openTransactionsScreen} onServicesPress={openServicesScreen} colors={colors} />) : null}
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
                <MoreTabContent onFollowUsPress={openFollowUs} onHelpFeedbackPress={openHelpFeedback} onSupportPress={openSupport} onProfilePress={() => navigation.navigate('Profile')} />
            </Animated.View>
        </View>) : null}

        <CompanySwitcherModal isOpen={isCompanySwitcherOpen} isLoading={isLoadingCompanies} companyOptions={companyOptions} selectedCompany={selectedCompany} companySwitcherOpacity={companySwitcherOpacity} companySwitcherTranslateY={companySwitcherTranslateY} onSelectCompany={selectCompanyFromSwitcher} onClose={closeCompanySwitcher} colors={colors} safeAreaInsets={safeAreaInsets} />
    </View>);
}
