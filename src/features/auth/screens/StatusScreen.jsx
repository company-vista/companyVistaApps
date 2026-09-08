import React, { useState, useEffect, useRef } from 'react';
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
import {
  Mail,
  CheckCircle,
  Clock,
  FileText,
  ChevronRight,
  Headphones,
  ArrowRight,
} from 'lucide-react-native';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { API_BASE_URL } from '../../../config/api';
import { useAppSelector } from '../../../store/hooks';
import BackButton from '../../../components/buttons/BackButton';
import logoR from '../../../assets/images/logoR.png';

const StatusScreen = ({ navigation, route }) => {
  const params = route?.params || {};
  // dynamic via route.params, fallback to defaults
  const [isPaid, setIsPaid] = useState(params.isPaid ?? false);
  const token = useAppSelector(s => s.auth.token);
  const pollingRef = useRef(null);

  const companyName = params.companyName || 'Meridian Global Ventures GmbH';
  const country = params.country || params.selectedState || 'Germany';
  const userEmail = params.userEmail || params.email || 'rajesh@meridianglobal.com';
  const orderId = params.orderId || params.invoiceId || '#CV-2026-04821';
  const amountPaid = params.amountPaid || (params.runningTotal ? `$${params.runningTotal}` : params.amount ? `$${params.amount}` : '$459');
  const referenceId = params.referenceId || params.invoiceId || params.orderId || orderId;

  // Auto-toggle to Payment Confirmed jab client payment kare (polling)
  useEffect(() => {
    if (isPaid) return; // already confirmed -> no polling
    if (!referenceId || referenceId === '#CV-2026-04821') return;
    let attempts = 0;
    const MAX_ATTEMPTS = 24; // 24 * 5s = 2 min
    const getHeaders = () => (token ? { Authorization: `Bearer ${token}`, 'x-auth-token': token } : {});
    pollingRef.current = setInterval(async () => {
      attempts++;
      if (attempts > MAX_ATTEMPTS) {
        clearInterval(pollingRef.current);
        return;
      }
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/payment/details/${referenceId}`, {
          withCredentials: true,
          timeout: 10000,
          params: { _t: Date.now() },
          headers: { ...getHeaders(), 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
        });
        const stripeStatus = data?.stripeDetails?.status || '';
        const invoiceStatus = data?.invoice?.paymentStatus || data?.invoice?.status || data?.paymentStatus || '';
        const paid = stripeStatus === 'active' || stripeStatus === 'paid' || invoiceStatus === 'paid' || invoiceStatus === 'completed' || data?.paid === true;
        if (paid) {
          clearInterval(pollingRef.current);
          setIsPaid(true);
          Toast.show({ type: 'success', text1: 'Payment confirmed!', text2: `${amountPaid} received` });
        }
      } catch {}
    }, 5000);
    return () => clearInterval(pollingRef.current);
  }, [referenceId, token, isPaid]);

  const handlePrimaryPress = () => {
    if (isPaid) {
      // Payment confirmed -> VerifyIdentityScreen open with dynamic fill
      navigation?.navigate?.('VerifyIdentity', { companyName, country, selectedState: params.selectedState, selectedCountry: params.selectedCountry, selectedStructure: params.selectedStructure, shareCapital: params.shareCapital, shareholdersCount: params.shareholdersCount, userEmail, orderId, amountPaid, amount: params.amount, fullName: params.fullName, email: params.email, countryOfResidence: params.countryOfResidence });
    } else {
      if (navigation?.reset) {
        navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
      } else {
        navigation?.navigate?.('Home');
      }
    }
  };

  const handleSpeakToTeam = () => {
    // placeholder - maybe navigate to Support
    navigation?.navigate?.('Support');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#070C15" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* CompanyNaming jaisa Back + Logo header - top se bahar nahi jayega */}
        <View style={styles.headerRow}>
          <BackButton onPress={() => navigation?.goBack?.()} />
          <Image source={logoR} style={styles.topLogo} />
        </View>

        {/* Demo Toggle Button (Testing Purpose Only) - dynamic toggle */}
        <TouchableOpacity
          style={styles.toggleBtn}
          onPress={() => setIsPaid(!isPaid)}>
          <Text style={styles.toggleText}>
            Switch View (Currently: {isPaid ? 'Payment Confirmed' : 'Details Received'})
          </Text>
        </TouchableOpacity>

        {/* Main Status Icon Circle */}
        <View style={styles.iconWrapper}>
          <View
            style={[
              styles.outerCircle,
              isPaid && { borderColor: 'rgba(34, 197, 94, 0.2)' },
            ]}>
            <View
              style={[
                styles.innerSquare,
                isPaid ? styles.greenSquare : styles.blueSquare,
              ]}>
              {isPaid ? (
                <CheckCircle color="#22c55e" size={36} />
              ) : (
                <Mail color="#3b82f6" size={36} />
              )}
            </View>
          </View>
        </View>

        {/* Title & Description */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>
            {isPaid ? 'Payment ' : 'Details '}
            <Text style={isPaid ? styles.italicGreen : styles.italicBlue}>
              {isPaid ? 'confirmed' : 'received'}
            </Text>
          </Text>

          {isPaid ? (
            <Text style={styles.subTitle}>
              {amountPaid} paid · Receipt sent to your email
            </Text>
          ) : (
            <Text style={styles.subTitle}>
              Our team is preparing your exact quote for{' '}
              <Text style={styles.boldText}>{companyName}</Text> in {country}.
            </Text>
          )}

          {isPaid && (
            <View style={styles.orderBadge}>
              <Text style={styles.orderBadgeText}>
                Order <Text style={{ color: '#eab308' }}>{orderId}</Text>
              </Text>
            </View>
          )}
        </View>

        {/* Card List / Steps */}
        {!isPaid ? (
          /* DETAILS RECEIVED STEPS */
          <View style={styles.cardsContainer}>
            <View style={styles.card}>
              <View style={[styles.cardIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                <Clock color="#3b82f6" size={20} />
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>Quote within 2 hours</Text>
                <Text style={styles.cardDesc}>Emailed to {userEmail}</Text>
              </View>
            </View>

            <View style={styles.card}>
              <View style={[styles.cardIconBox, { backgroundColor: 'rgba(234, 179, 8, 0.15)' }]}>
                <FileText color="#eab308" size={20} />
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>Draft saved</Text>
                <Text style={styles.cardDesc}>Resume any time from your dashboard</Text>
              </View>
            </View>

            <View style={styles.card}>
              <View style={[styles.cardIconBox, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
                <CheckCircle color="#22c55e" size={20} />
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>Nothing to pay yet</Text>
                <Text style={styles.cardDesc}>Pay only once you approve the quote</Text>
              </View>
            </View>
          </View>
        ) : (
          /* PAYMENT CONFIRMED STEPS */
          <View style={styles.cardsContainer}>
            <Text style={styles.sectionHeader}>NEXT: 2 QUICK STEPS</Text>

            <TouchableOpacity style={styles.cardAction} activeOpacity={0.8} onPress={() => navigation?.navigate?.('Shareholders', { companyName, country, userEmail, orderId, amountPaid, fullName: params.fullName || params.email?.split('@')[0] || '', email: params.email || userEmail, countryOfResidence: params.countryOfResidence })}>
              <View style={styles.stepNumberBox}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>Shareholders & ownership</Text>
                <Text style={styles.cardDesc}>Who owns what — about 2 minutes</Text>
              </View>
              <ChevronRight color="#64748b" size={20} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.cardAction} activeOpacity={0.8} onPress={() => navigation?.navigate?.('Home')}>
              <View style={styles.stepNumberBox}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>KYC documents</Text>
                <Text style={styles.cardDesc}>Passport & address proof per shareholder</Text>
              </View>
              <ChevronRight color="#64748b" size={20} />
            </TouchableOpacity>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.bottomSection}>
          <TouchableOpacity style={styles.primaryButton} activeOpacity={0.85} onPress={handlePrimaryPress}>
            <Text style={styles.primaryButtonText}>
              {isPaid ? 'Continue Setup' : 'Go to Dashboard'}
            </Text>
            <ArrowRight color="#070C15" size={18} />
          </TouchableOpacity>

          {!isPaid ? (
            <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.8} onPress={handleSpeakToTeam}>
              <Headphones color="#3b82f6" size={18} />
              <Text style={styles.secondaryButtonText}>Speak to our team</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.footerNote}>
              Filing begins once both steps are complete
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default StatusScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070C15',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    alignItems: 'center',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16, marginTop: 34, alignSelf: 'stretch' },
  topLogo: { width: 150, height: 38, resizeMode: 'contain', marginTop: 10 },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  brandTitle: {
    color: '#D1D5DB',
    fontSize: 18,
    letterSpacing: 1,
  },
  brandSub: {
    color: '#6B7280',
    fontSize: 8,
    letterSpacing: 1.5,
    marginTop: 2,
  },
  toggleBtn: {
    backgroundColor: '#1E293B',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 20,
  },
  toggleText: {
    color: '#94A3B8',
    fontSize: 11,
  },
  iconWrapper: {
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  innerSquare: {
    width: 100,
    height: 100,
    borderRadius: 28,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blueSquare: {
    borderColor: '#2563EB',
    backgroundColor: '#0B1528',
  },
  greenSquare: {
    borderColor: '#16A34A',
    backgroundColor: '#071F15',
  },
  titleSection: {
    alignItems: 'center',
    marginVertical: 16,
  },
  mainTitle: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '400',
  },
  italicBlue: {
    fontStyle: 'italic',
    color: '#60A5FA',
    fontFamily: 'serif',
  },
  italicGreen: {
    fontStyle: 'italic',
    color: '#4ADE80',
    fontFamily: 'serif',
  },
  subTitle: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  boldText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  orderBadge: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  orderBadgeText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
  },
  cardsContainer: {
    width: '100%',
    marginVertical: 16,
  },
  sectionHeader: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  cardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  cardIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#E2E8F0',
    fontWeight: 'bold',
    fontSize: 14,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  cardDesc: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#EAB308',
    paddingVertical: 16,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#070C15',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: '#0F172A',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  secondaryButtonText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  footerNote: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 12,
  },
});
