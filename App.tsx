import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Share,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast, { type ToastConfig } from 'react-native-toast-message';
import styles from './App.styles';

import LoginScreen from './src/features/auth/screens/LoginScreen';
import HelpFeedbackScreen from './src/features/help/screens/HelpFeedbackScreen';
import SupportScreen from './src/features/support/screens/SupportScreen';
import FollowUsScreen from './src/features/home/screens/FollowUsScreen';
import HomeScreen from './src/features/home/screens/HomeScreen';
import QuickAccessScreen from './src/features/home/screens/QuickAccessScreen';
import BusinessReportsScreen from './src/features/home/screens/quickAccess/BusinessReportsScreen';
import CompanyProfileScreen from './src/features/home/screens/quickAccess/CompanyProfileScreen';
import HelpDeskScreen from './src/features/home/screens/quickAccess/HelpDeskScreen';
import InvoiceCenterScreen from './src/features/home/screens/quickAccess/InvoiceCenterScreen';
import InvoiceDetailScreen from './src/features/home/screens/invoices/InvoiceDetailScreen';
import NotificationDetailScreen from './src/features/notifications/screens/NotificationDetailScreen';
import NotificationScreen from './src/features/notifications/screens/NotificationScreen';
import SearchScreen from './src/features/home/screens/SearchScreen';
import RenewComplianceScreen from './src/features/home/screens/compliances/RenewComplianceScreen';
import AddressRenewalScreen from './src/features/home/screens/compliances/AddressRenewalScreen';
import FederalFilingScreen from './src/features/home/screens/compliances/FederalFilingScreen';
import AnnualStateFilingScreen from './src/features/home/screens/compliances/AnnualFilingScreen';
import ComplianceHistoryScreen from './src/features/home/screens/compliances/ComplianceHistoryScreen';
import EditProfileScreen from './src/features/profile/screens/EditProfileScreen';
import ProfileAddressScreen from './src/features/profile/screens/ProfileAddressScreen';
import ProfileScreen from './src/features/profile/screens/ProfileScreen';
import SignupScreen from './src/features/auth/screens/SignupScreen';
import logoImage from './src/assets/images/logoR.png';
import { useAppDispatch, useAppSelector } from './src/store/hooks';
import { restoreAuth } from './src/store/slices/authSlice';
import { store } from './src/store';
import { useThemeColors } from './src/theme/colors';
import type { QuickAccessItemId } from './src/features/home/data/quickAccessItems';
import type { NotificationItem } from './src/features/notifications/data/notifications';

type AuthScreen = 'login' | 'signup';
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
  services?: Array<{
    id?: number | string | null;
    name?: string | null;
    lastDate?: string | null;
    dueDate?: string | null;
    price?: number | null;
    years?: number | null;
    isExpired?: boolean | null;
  }> | null;
};

type AppScreen =
  | 'auth'
  | 'editProfile'
  | 'federalFiling'
  | 'annualFiling'
  | 'followUs'
  | 'helpFeedback'
  | 'home'
  | 'invoiceDetail'
  | 'notificationDetail'
  | 'notifications'
  | 'addressRenewal'
  | 'renewCompliance'
  | 'complianceHistory'
  | 'profile'
  | 'profileAddress'
  | 'search'
  | 'support'
  | `quickAccess:${QuickAccessItemId}`
  | 'quickAccess';

const toastConfig: ToastConfig = {
  success: ({ text1, text2 }) => (
    <View style={[styles.toastCard, styles.successToast]}>
      <Text style={styles.toastTitle}>{text1}</Text>
      {text2 ? <Text style={styles.toastMessage}>{text2}</Text> : null}
    </View>
  ),
  error: ({ text1, text2 }) => (
    <View style={[styles.toastCard, styles.errorToast]}>
      <Text style={styles.toastTitle}>{text1}</Text>
      {text2 ? <Text style={styles.toastMessage}>{text2}</Text> : null}
    </View>
  ),
};

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

function AppContent() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isRestoring } = useAppSelector(state => state.auth);
  const themeMode = useAppSelector(state => state.theme.mode);
  const colors = useThemeColors();
  const isDarkMode = themeMode === 'dark';
  const [showSplash, setShowSplash] = useState(true);
  const [appScreen, setAppScreen] = useState<AppScreen>('home');
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login');
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationItem | null>(null);
  const [selectedInvoice, setSelectedInvoice] =
    useState<Record<string, unknown> | null>(null);
  const [renewComplianceAction, setRenewComplianceAction] =
    useState<RenewActionData | null>(null);
  const [selectedComplianceAction, setSelectedComplianceAction] =
    useState<RenewActionData | null>(null);
  const [quickAccessBackScreen, setQuickAccessBackScreen] =
    useState<'home' | 'quickAccess'>('home');
  const [homeInitialTab, setHomeInitialTab] = useState<'home' | 'company' | 'reports' | 'billing' | 'more'>('home');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [pendingCompanySection, setPendingCompanySection] = useState<'companyInfo' | 'shareholders' | 'menu' | null>(null);
  const [pendingHomeAction, setPendingHomeAction] = useState<'subscription' | 'addCompany' | 'manageOptions' | null>(null);
  const authFadeAnim = useRef(new Animated.Value(1)).current;
  const authSlideAnim = useRef(new Animated.Value(0)).current;

  function openQuickAccessItem(
    itemId: QuickAccessItemId,
    backScreen: 'home' | 'quickAccess',
  ) {
    setQuickAccessBackScreen(backScreen);
    setAppScreen(`quickAccess:${itemId}`);
  }

  function openNotificationDetail(notification: NotificationItem) {
    setSelectedNotification(notification);
    setAppScreen('notificationDetail');
  }

  function openInvoiceDetail(invoice: Record<string, unknown>) {
    setSelectedInvoice(invoice);
    setAppScreen('invoiceDetail');
  }

  useEffect(() => {
    dispatch(restoreAuth());
  }, [dispatch]);

  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(splashTimer);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setAppScreen('home');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (showSplash) {
      return;
    }

    authFadeAnim.setValue(0);
    authSlideAnim.setValue(22);

    Animated.parallel([
      Animated.timing(authFadeAnim, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.timing(authSlideAnim, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start();
  }, [authFadeAnim, authScreen, authSlideAnim, showSplash]);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      {showSplash || isRestoring ? (
        <SplashScreen />
      ) : isAuthenticated && appScreen === 'home' ? (
        <HomeScreen
          initialTab={homeInitialTab}
          onFollowUsPress={() => setAppScreen('followUs')}
          onHelpFeedbackPress={() => setAppScreen('helpFeedback')}
          onSupportPress={() => setAppScreen('support')}
          onInvoicePress={openInvoiceDetail}
          onNotificationPress={() => setAppScreen('notifications')}
          onSearchPress={() => setAppScreen('search')}
          onProfilePress={() => setAppScreen('profile')}
          onQuickAccessItemPress={itemId => openQuickAccessItem(itemId, 'home')}
          onQuickAccessViewAllPress={() => setAppScreen('quickAccess')}
          onGoHome={() => setHomeInitialTab('home')}
          selectedCompanyId={selectedCompanyId}
          onCompanyChange={setSelectedCompanyId}
          pendingCompanySection={pendingCompanySection}
          onClearPendingCompanySection={() => setPendingCompanySection(null)}
          pendingHomeAction={pendingHomeAction}
          onClearPendingHomeAction={() => setPendingHomeAction(null)}
          onOpenRenewPage={(action) => {
            setRenewComplianceAction(action);
            if (action.id === 'federal_filing') {
              setAppScreen('federalFiling');
            } else if (action.id === 'address') {
              setAppScreen('addressRenewal');
            } else if (action.id === 'annual_filing') {
              setAppScreen('annualFiling');
            } else {
              setAppScreen('renewCompliance');
            }
          }}
          onOpenComplianceHistory={(action) => {
            setSelectedComplianceAction(action);
            setAppScreen('complianceHistory');
          }}
        />
      ) : isAuthenticated && appScreen === 'invoiceDetail' && selectedInvoice ? (
        <InvoiceDetailScreen
          invoice={selectedInvoice}
          onBackPress={() => { setHomeInitialTab('billing'); setAppScreen('home'); }}
        />
      ) : isAuthenticated && appScreen === 'addressRenewal' && renewComplianceAction ? (
        <AddressRenewalScreen
          onBackPress={() => {
            setRenewComplianceAction(null);
            setAppScreen('home');
          }}
          selectedAction={renewComplianceAction}
        />
      ) : isAuthenticated && appScreen === 'helpFeedback' ? (
        <HelpFeedbackScreen onBackPress={() => setAppScreen('home')} />
      ) : isAuthenticated && appScreen === 'support' ? (
        <SupportScreen onBackPress={() => setAppScreen('home')} />
      ) : isAuthenticated && appScreen === 'followUs' ? (
        <FollowUsScreen onBackPress={() => setAppScreen('home')} />
      ) : isAuthenticated && appScreen === 'notifications' ? (
        <NotificationScreen
          companyId={selectedCompanyId}
          onBackPress={() => { setHomeInitialTab('home'); setAppScreen('home'); }}
          onNotificationPress={openNotificationDetail}
        />
      ) : isAuthenticated && appScreen === 'search' ? (
        <SearchScreen
          onBackPress={() => setAppScreen('home')}
          onCompanyInfoPress={() => { setPendingCompanySection('companyInfo'); setAppScreen('home'); }}
          onShareholdersPress={() => { setPendingCompanySection('shareholders'); setAppScreen('home'); }}
          onManageCompanyPress={() => { setPendingHomeAction('manageOptions'); setAppScreen('home'); }}
          onTransactionsPress={() => { setHomeInitialTab('billing'); setAppScreen('home'); }}
          onStateFilingPress={() => setAppScreen('annualFiling')}
          onFederalFilingPress={() => setAppScreen('federalFiling')}
          onAddEntityPress={() => { setAppScreen('home'); }}
          onChangeAgentPress={() => setAppScreen('addressRenewal')}
          onSubscriptionPress={() => { setPendingHomeAction('subscription'); setAppScreen('home'); }}
          onSupportPress={() => setAppScreen('support')}
          onInviteFriendsPress={() => { Share.share({ message: 'Join me on Company Vista to manage company work in one place.', title: 'Invite Friends' }); }}
          onFollowUsPress={() => setAppScreen('followUs')}
          onHelpFeedbackPress={() => setAppScreen('helpFeedback')}
          onAgentRenewalPress={() => { setRenewComplianceAction({ id: 'resident', title: 'Agent Renewal', subtitle: '', status: '', date: '', details: [] }); setAppScreen('renewCompliance'); }}
          onAddressRenewalPress={() => { setRenewComplianceAction({ id: 'address', title: 'Address Renewal', subtitle: '', status: '', date: '', details: [] }); setAppScreen('addressRenewal'); }}
          onAnnualFilingPress={() => setAppScreen('annualFiling')}
        />
      ) : isAuthenticated && appScreen === 'notificationDetail' && selectedNotification ? (
        <NotificationDetailScreen
          notification={selectedNotification}
          onBackPress={() => setAppScreen('notifications')}
        />
      ) : isAuthenticated && appScreen === 'quickAccess' ? (
        <QuickAccessScreen
          onBackPress={() => setAppScreen('home')}
          onItemPress={itemId => openQuickAccessItem(itemId, 'quickAccess')}
        />
      ) : isAuthenticated && appScreen === 'quickAccess:companyProfile' ? (
        <CompanyProfileScreen onBackPress={() => setAppScreen(quickAccessBackScreen)} />
      ) : isAuthenticated && appScreen === 'quickAccess:invoiceCenter' ? (
        <InvoiceCenterScreen onBackPress={() => setAppScreen(quickAccessBackScreen)} />
      ) : isAuthenticated && appScreen === 'quickAccess:businessReports' ? (
        <BusinessReportsScreen onBackPress={() => setAppScreen(quickAccessBackScreen)} />
      ) : isAuthenticated && appScreen === 'quickAccess:helpDesk' ? (
        <HelpDeskScreen onBackPress={() => setAppScreen(quickAccessBackScreen)} />
      ) : isAuthenticated && appScreen === 'quickAccess:federalFiling' ? (
        <FederalFilingScreen
          selectedAction={null}
          onBackPress={() => setAppScreen(quickAccessBackScreen)}
        />
      ) : isAuthenticated && appScreen === 'federalFiling' ? (
        <FederalFilingScreen
          selectedAction={renewComplianceAction}
          onBackPress={() => {
            setHomeInitialTab('reports');
            setAppScreen('home');
          }}
        />
      ) : isAuthenticated && appScreen === 'annualFiling' ? (
        <AnnualStateFilingScreen
          onBackPress={() => {
            setHomeInitialTab('reports');
            setAppScreen('home');
          }}
          selectedCompanyId={selectedCompanyId}
        />
      ) : isAuthenticated && appScreen === 'complianceHistory' && selectedComplianceAction ? (
        <ComplianceHistoryScreen
          selectedAction={selectedComplianceAction}
          onBackPress={() => {
            setHomeInitialTab('reports');
            setAppScreen('home');
            setSelectedComplianceAction(null);
          }}
        />
      ) : isAuthenticated && appScreen === 'renewCompliance' ? (
        <RenewComplianceScreen
          selectedAction={renewComplianceAction}
          onBackPress={() => {
            setHomeInitialTab('reports');
            setAppScreen('home');
          }}
        />
      ) : isAuthenticated && appScreen === 'profile' ? (
        <ProfileScreen
          onAddressPress={() => setAppScreen('profileAddress')}
          onBackPress={() => setAppScreen('home')}
          onEditPress={() => setAppScreen('editProfile')}
        />
      ) : isAuthenticated && appScreen === 'profileAddress' ? (
        <ProfileAddressScreen onBackPress={() => setAppScreen('profile')} />
      ) : isAuthenticated && appScreen === 'editProfile' ? (
        <EditProfileScreen onBackPress={() => setAppScreen('profile')} />
      ) : (
        <View style={[styles.authScreen, { backgroundColor: colors.authBackground }]}>
          <Animated.View
            style={[
              styles.authTransition,
              {
                backgroundColor: colors.authBackground,
                opacity: authFadeAnim,
                transform: [{ translateY: authSlideAnim }],
              },
            ]}>
            {authScreen === 'login' ? (
              <LoginScreen
                onSignupPress={() => setAuthScreen('signup')}
              />
            ) : (
              <SignupScreen onLoginPress={() => setAuthScreen('login')} />
            )}
          </Animated.View>
        </View>
      )}
      <Toast config={toastConfig} />
    </SafeAreaProvider>
  );
}

function SplashScreen() {
  const colors = useThemeColors();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const riseAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(riseAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, riseAnim, scaleAnim]);

  return (
    <View style={[styles.splashScreen, { backgroundColor: colors.authBackground }]}>
      <Animated.View
        style={[
          styles.logo,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { translateY: riseAnim }],
          },
        ]}>
        <Image source={logoImage} style={styles.logoImage} />
      </Animated.View>
    </View>
  );
}


export default App;
