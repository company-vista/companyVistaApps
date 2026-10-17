import React from 'react';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import { getCompanyTotalAmount, isRegistrationUnpaid } from '../../../../utils/companyStatus';
import CompanyDetailScreen from '../../components/CompanyDetailScreen';
import ManageCompanyScreen from '../manageCompany/ManageCompanyScreen';
import ManageOptionsScreen from '../manageCompany/ManageOptionsScreen';
import DocumentViewScreen from '../documents/DocumentViewScreen';
import ServicesScreen from '../subscription&services/ServicesScreen';
import SubscriptionScreen from '../subscription&services/SubscriptionScreen';
import ExploreServicesScreen from '../subscription&services/ExploreServicesScreen';
import ServicesHistoryScreen from '../subscription&services/ServicesHistoryScreen';
import RegistrationTrackingScreen from '../addCompany/RegistrationTrackingScreen';
import RegistrationProgressScreen from '../../../auth/screens/RegistrationProgressScreen';
import ContactSupport from '../../../support/screens/SupportScreen';
import OrderDetailsScreen from '../../components/companyInformationSection/yourOrder/OrderDetailsScreen';
import QuoteScreen from '../../components/companyInformationSection/yourOrder/QuoteScreen';
import QuoteBreakdownScreen from '../../components/companyInformationSection/yourOrder/QuoteBreakdownScreen';
import PaymentMethodScreen from '../../components/companyInformationSection/yourOrder/PaymentMethodScreen';
import ShareholdersScreen from '../../components/companyInformationSection/yourOrder/ShareholdersScreen';
import VerifyIdentityScreen from '../../components/companyInformationSection/yourOrder/VerifyIdentityScreen';

// Home ke upar jo full-screen overlays (order/quote/payment/manage/services/
// registration/support) hote hain, wo sab yahan route hote hain. Pehle ye
// HomeScreen.jsx me hi ek lambi `if (isX) return <XScreen/>` chain ke roop me
// the; ab ek alag component me hain. HomeScreen inhe sirf tab render karta
// hai jab koi overlay active ho.
//
// Agar koi overlay active nahi hai to ye `null` return karta hai.
export function HomeOverlayScreens({
    isVerifyIdentityOpen, isShareholdersOpen, isPaymentMethodOpen, isQuoteBreakdownOpen,
    isQuoteOpen, isOrderDetailsOpen, currentQuote, selectedCompany, activeCompanySection,
    isManageOptionsOpen, isManageScreenOpen, selectedDocumentForView, isServicesOpen,
    isExploreServicesOpen, isServicesHistoryOpen, isSubscriptionOpen,
    isRegistrationProgressOpen, isRegistrationTrackingOpen, isSupportOpen,
    isLoadingCompanies, companyOptions, trackingCompanyId, supportFromRegistrationTracking,
    setIsVerifyIdentityOpen, setIsShareholdersOpen, setIsPaymentMethodOpen,
    setIsQuoteBreakdownOpen, setIsQuoteOpen, setIsOrderDetailsOpen, setCurrentQuote,
    setActiveCompanySection, setIsManageOptionsOpen, setIsManageScreenOpen,
    setSelectedDocumentForView, setIsRegistrationProgressOpen, setIsRegistrationTrackingOpen,
    setIsSupportOpen, setSupportFromRegistrationTracking,
    closeServicesScreen, openSubscriptionScreen, openExploreServicesScreen,
    openServicesHistoryScreen, closeExploreServicesScreen, closeServicesHistoryScreen,
    closeSubscriptionScreen, closeRegistrationTrackingScreen, handleResumePaymentPress,
    refreshCompanies,
}) {
    const navigation = useNavigation();
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
    return null;
}
