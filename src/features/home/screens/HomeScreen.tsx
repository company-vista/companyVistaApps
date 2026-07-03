import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import styles from './HomeScreen.styles';

import { useAppSelector } from '../../../store/hooks';
import { useThemeColors } from '../../../theme/colors';

// Import subcomponents
import { HomeHeader } from './homeScreenComponent/HomeHeader';
import { BottomNavBar, type TabId } from './homeScreenComponent/BottomNavBar';
import { QuickActionFab } from './homeScreenComponent/QuickActionFab';
import { CompanySwitcherModal } from './homeScreenComponent/CompanySwitcherModal';
import { SearchModal } from './homeScreenComponent/SearchModal';
import { fetchNotifications } from '../../notifications/api/notificationsApi';
import type { CompanyCardItem } from './quickAccess/CompanyCard';
import {
  fetchClientCompanies,
  fetchClientCompanyDetails,
  type ClientCompany,
} from '../api/clientProfileApi';
import { mapCompanyToListItem } from './quickAccess/companyListItem';
import BillingTabContent from './invoices/InvoicesTabContent';
import CompanyTabContent from '../components/CompanyTabContent';
import CompanyDetailScreen, {
  type CompanyDetailSection,
} from '../components/CompanyDetailScreen';
import DocumentsTabContent from './documents/DocumentsTabContent';
import DocumentViewScreen from './documents/DocumentViewScreen';
import type { DocumentItem } from '../api/clientDocumentApi';
import ManageCompanyScreen from './ManageCompanyScreen';
import TransactionsScreen from './TransactionsScreen';
import HomeTabContent from '../components/HomeTabContent';
import MoreTabContent from '../components/MoreTabContent';
import ReportsTabContent from './compliances/ReportsTabContent';
import type { QuickAccessItemId } from '../data/quickAccessItems';

const emptyCompanies: ClientCompany[] = [];

type RenewActionData = {
  id: 'address' | 'annual_filing' | 'resident' | 'federal_filing';
  title: string;
  subtitle: string;
  status: string;
  date: string;
  details: { label: string; value: string; icon?: string }[];
  companyId?: string | null;
  price?: number;
  years?: number;
};

type HomeScreenProps = {
  initialTab?: TabId;
  onFollowUsPress: () => void;
  onHelpFeedbackPress: () => void;
  onGoHome: () => void;
  onInvoicePress?: (invoice: Record<string, unknown>) => void;
  onNotificationPress: () => void;
  onProfilePress: () => void;
  onQuickAccessItemPress: (itemId: QuickAccessItemId) => void;
  onQuickAccessViewAllPress: () => void;
  onCompanyChange?: (companyId: string | null) => void;
  selectedCompanyId?: string | null;
  onOpenRenewPage?: (action: RenewActionData) => void;
  onOpenComplianceHistory?: (action: RenewActionData) => void;
};

export default function HomeScreen({
  initialTab,
  onFollowUsPress,
  onHelpFeedbackPress,
  onGoHome: _onGoHome,
  onInvoicePress,
  onNotificationPress,
  onProfilePress,
  onQuickAccessItemPress,
  onQuickAccessViewAllPress,
  onCompanyChange,
  selectedCompanyId,
  onOpenRenewPage,
  onOpenComplianceHistory,
}: HomeScreenProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const colors = useThemeColors();
  const user = useAppSelector(state => state.auth.user);
  const token = useAppSelector(state => state.auth.token);
  const userId = useAppSelector(
    state => state.auth.user?._id ?? state.auth.user?.id ?? null,
  );
  const userCompanies = useAppSelector(
    state => state.auth.user?.companies ?? emptyCompanies,
  );
  const [activeTab, setActiveTab] = useState<TabId>(initialTab ?? 'home');
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationCount, setNotificationCount] = useState(0);
  const [selectedCompany, setSelectedCompany] =
    useState<CompanyCardItem | null>(null);
  const [activeCompanySection, setActiveCompanySection] = useState<
    CompanyDetailSection | 'menu' | null
  >(null);
  const [isManageScreenOpen, setIsManageScreenOpen] = useState(false);
  const [isTransactionsOpen, setIsTransactionsOpen] = useState(false);
  const [companyOptions, setCompanyOptions] = useState<CompanyCardItem[]>([]);
  const [isCompanySwitcherOpen, setIsCompanySwitcherOpen] = useState(false);
  const [selectedDocumentForView, setSelectedDocumentForView] =
    useState<DocumentItem | null>(null);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const fabMenuAnim = useRef(new Animated.Value(0)).current;
  const companySwitcherAnim = useRef(new Animated.Value(0)).current;
  const moreSlideAnim = useRef(new Animated.Value(320)).current;
  const bellAnim = useRef(new Animated.Value(0)).current;
  const fabMenuOpacity = fabMenuAnim;

  useEffect(() => {
    onCompanyChange?.(selectedCompany?.id ?? null);
  }, [selectedCompany, onCompanyChange]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
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
      ]),
    ).start();
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
  const profileImage =
    user?.profileImage ??
    user?.profilePicture ??
    user?.avatar ??
    user?.image ??
    user?.photo;
  const displayName =
    user?.name ??
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ??
    'User';

  useEffect(() => {
    let isMounted = true;

    fetchNotifications({ token, companyId: selectedCompany?.id }).then(
      result => {
        if (isMounted && result.isSuccess) {
          setNotificationCount(result.notifications.length);
        }
      },
    );

    return () => {
      isMounted = false;
    };
  }, [token, selectedCompany?.id]);

  useEffect(() => {
    let isMounted = true;

    setIsLoadingCompanies(true);

    fetchClientCompanies({ token, userId })
      .then(result => {
        if (!isMounted) {
          return;
        }

        const loadedCompanies =
          result.companies.length > 0 ? result.companies : userCompanies;
        const mappedCompanies = loadedCompanies.map(mapCompanyToListItem);

        setCompanyOptions(mappedCompanies);

        setSelectedCompany(currentCompany => {
          if (currentCompany) {
            return currentCompany;
          }

          if (selectedCompanyId) {
            return (
              mappedCompanies.find(company => company.id === selectedCompanyId) ??
              mappedCompanies[0] ??
              null
            );
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
          countryOfIncorporation:
            detailCompany.countryOfIncorporation ||
            currentCompany.countryOfIncorporation,
          date:
            detailCompany.date === 'N/A'
              ? currentCompany.date
              : detailCompany.date,
          ein: detailCompany.ein || currentCompany.ein,
          status: detailCompany.status || currentCompany.status,
        };
      });

      setCompanyOptions(currentCompanies =>
        currentCompanies.map(company => {
          if (company.id !== selectedCompany.id) {
            return company;
          }

          return {
            ...company,
            companyType: detailCompany.companyType || company.companyType,
            countryOfIncorporation:
              detailCompany.countryOfIncorporation ||
              company.countryOfIncorporation,
            date:
              detailCompany.date === 'N/A' ? company.date : detailCompany.date,
            ein: detailCompany.ein || company.ein,
            status: detailCompany.status || company.status,
          };
        }),
      );
    });

    return () => {
      isMounted = false;
    };
  }, [selectedCompany?.id, token]);

  function openMoreSheet() {
    closeFabMenu();
    setIsMoreOpen(true);
    Animated.timing(moreSlideAnim, {
      toValue: 0,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }

  function closeMoreSheet(onClosed?: () => void) {
    Animated.timing(moreSlideAnim, {
      toValue: 320,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setIsMoreOpen(false);
      onClosed?.();
    });
  }

  function handleTabPress(tabId: TabId) {
    closeFabMenu();

    if (tabId === 'more') {
      openMoreSheet();
      return;
    }

    setActiveTab(tabId);
  }

  function openHelpFeedback() {
    closeMoreSheet(onHelpFeedbackPress);
  }

  function openFollowUs() {
    closeMoreSheet(onFollowUsPress);
  }

  function closeSearch() {
    setIsSearchOpen(false);
    setSearchQuery('');
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
    setIsTransactionsOpen(true);
  }

  function closeTransactionsScreen() {
    setIsTransactionsOpen(false);
  }

  function selectCompanyFromSwitcher(company: CompanyCardItem) {
    setSelectedCompany(company);
    closeCompanySwitcher();
  }

  if (activeCompanySection) {
    return (
      <CompanyDetailScreen
        activeSection={
          activeCompanySection === 'menu' ? undefined : activeCompanySection
        }
        selectedCompany={selectedCompany}
        onBackPress={() => setActiveCompanySection(null)}
      />
    );
  }

  if (isManageScreenOpen) {
    return (
      <ManageCompanyScreen
        selectedCompany={selectedCompany}
        onBackPress={() => setIsManageScreenOpen(false)}
      />
    );
  }

  if (selectedDocumentForView) {
    return (
      <DocumentViewScreen
        documentItem={selectedDocumentForView}
        onBackPress={() => setSelectedDocumentForView(null)}
      />
    );
  }

  if (isTransactionsOpen) {
    return (
      <TransactionsScreen
        onBackPress={closeTransactionsScreen}
        selectedCompany={selectedCompany}
      />
    );
  }

  const HEADER_CONTENT_HEIGHT = 72;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Fixed header wrapper */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: safeAreaInsets.top + HEADER_CONTENT_HEIGHT,
          zIndex: 30,
          justifyContent: 'center',
          paddingTop: safeAreaInsets.top,
          paddingHorizontal: 18,
          backgroundColor: colors.background,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.03,
          shadowRadius: 12,
          elevation: 14,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <HomeHeader
          displayName={displayName}
          profileImage={profileImage}
          notificationCount={notificationCount}
          bellRotation={bellRotation}
          onSearchPress={() => {
            closeFabMenu();
            setIsSearchOpen(true);
          }}
          onNotificationPress={onNotificationPress}
          onProfilePress={onProfilePress}
          colors={colors}
        />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: safeAreaInsets.top + HEADER_CONTENT_HEIGHT + 16, // leave space for fixed header
            paddingBottom: safeAreaInsets.bottom + 116,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'home' ? (
          <HomeTabContent
            isLoadingCompanies={isLoadingCompanies}
            selectedCompany={selectedCompany ?? companyOptions[0] ?? null}
            onCompanyInfoPress={() => setActiveCompanySection('menu')}
            onCompanySwitcherPress={openCompanySwitcher}
            onManagePress={() => setIsManageScreenOpen(true)}
            onQuickAccessItemPress={onQuickAccessItemPress}
            onQuickAccessViewAllPress={onQuickAccessViewAllPress}
            onTransactionsPress={openTransactionsScreen}
          />
        ) : null}
        {activeTab === 'company' ? (
          <CompanyTabContent
            selectedCompany={selectedCompany}
            onSectionPress={setActiveCompanySection}
          />
        ) : null}
        {activeTab === 'reports' ? (
          <ReportsTabContent
            selectedCompany={selectedCompany}
            onOpenRenewPage={onOpenRenewPage}
            onOpenComplianceHistory={onOpenComplianceHistory}
          />
        ) : null}
        {activeTab === 'billing' ? (
          <BillingTabContent
            onInvoicePress={onInvoicePress}
            onGoHome={() => setActiveTab('home')}
            selectedCompany={selectedCompany}
          />
        ) : null}
        {activeTab === 'documents' ? (
          <DocumentsTabContent
            selectedCompany={selectedCompany}
            onDocumentViewPress={doc => setSelectedDocumentForView(doc)}
          />
        ) : null}
      </ScrollView>

      <QuickActionFab
        isFabMenuOpen={isFabMenuOpen}
        fabMenuOpacity={fabMenuOpacity}
        fabMenuScale={fabMenuScale}
        fabMenuTranslateY={fabMenuTranslateY}
        fabIconRotate={fabIconRotate}
        onToggleMenu={toggleFabMenu}
        onCloseMenu={closeFabMenu}
        colors={colors}
        safeAreaInsets={safeAreaInsets}
        onTransactionsPress={openTransactionsScreen}
      />

      <BottomNavBar
        activeTab={activeTab}
        isMoreOpen={isMoreOpen}
        onTabPress={handleTabPress}
        colors={colors}
        safeAreaInsets={safeAreaInsets}
      />

      {isMoreOpen ? (
        <View style={styles.moreOverlay}>
          <Pressable
            onPress={() => closeMoreSheet()}
            style={[styles.moreBackdrop, { backgroundColor: colors.backdrop }]}
          />
          <Animated.View
            style={[
              styles.moreSheet,
              {
                backgroundColor: colors.sheet,
                paddingBottom: safeAreaInsets.bottom + 24,
                transform: [{ translateY: moreSlideAnim }],
              },
            ]}
          >
            <View
              style={[styles.sheetHandle, { backgroundColor: colors.border }]}
            />
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: colors.text }]}>
                More
              </Text>
              <Pressable
                onPress={() => closeMoreSheet()}
                style={[
                  styles.sheetCloseButton,
                  { backgroundColor: colors.surface },
                ]}
              >
                <FontAwesome name="close" size={18} color={colors.text} />
              </Pressable>
            </View>
            <MoreTabContent
              onFollowUsPress={openFollowUs}
              onHelpFeedbackPress={openHelpFeedback}
            />
          </Animated.View>
        </View>
      ) : null}

      <SearchModal
        isOpen={isSearchOpen}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onClose={closeSearch}
        colors={colors}
        safeAreaInsets={safeAreaInsets}
      />

      <CompanySwitcherModal
        isOpen={isCompanySwitcherOpen}
        isLoading={isLoadingCompanies}
        companyOptions={companyOptions}
        selectedCompany={selectedCompany}
        companySwitcherOpacity={companySwitcherOpacity}
        companySwitcherTranslateY={companySwitcherTranslateY}
        onSelectCompany={selectCompanyFromSwitcher}
        onClose={closeCompanySwitcher}
        colors={colors}
        safeAreaInsets={safeAreaInsets}
      />
    </View>
  );
}
