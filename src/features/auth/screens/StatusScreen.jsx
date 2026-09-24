import React from 'react';
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
  CheckCircle,
  ChevronRight,
  ArrowRight,
  Check,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import BackButton from '../../../components/buttons/BackButton';
import logoR from '../../../assets/images/logoR.png';
import { s } from '../../../theme/responsive';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { setAuthSession, setPendingOpenOrderDetails, setPendingOpenRegistrationProgress } from '../../../store/slices/authSlice';

const StatusScreen = ({ navigation, route }) => {
  const params = route?.params || {};
  React.useEffect(() => {
    console.log('=== PAYMENT CONFIRM SCREEN DATA (Status) ===', JSON.stringify(route?.params, null, 2));
  }, []);
  const isPaid = true;
  const companyName = params.companyName || 'Meridian Global Ventures GmbH';
  const country = params.country || params.selectedState || 'Germany';
  const userEmail = params.userEmail || params.email || 'rajesh@meridianglobal.com';
  const orderId = params.orderId || params.invoiceId || '#CV-2026-04821';
  const amountPaid = params.amountPaid || (params.runningTotal ? `$${params.runningTotal}` : params.amount ? `$${params.amount}` : '$459');
  const isShareholderDone = params.shareholderCompleted === true;
  const isKycDone = params.kycCompleted === true;

  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const authToken = useAppSelector((s) => s.auth.token);
  const pendingOrder = useAppSelector((s) => s.auth.pendingOrderData);

  // price define nahi hai toh StatusScreen skip -> direct Your Order (OrderDetailsScreen)
  const hasPrice = Number(params.selectedCountryPrice || 0) > 0 || Number(params.selectedStatePrice || 0) > 0 || Number(params.bestStatePrice || 0) > 0 || Number(params.amount || 0) > 0 || Number(params.runningTotal || 0) > 0;
  React.useEffect(() => {
    if (!hasPrice) {
      const token = params.signupToken || params.token || pendingOrder?.token || authToken || '';
      const clientId = params.clientId || params.signupClientId || pendingOrder?.clientId || pendingOrder?.orderId || '';
      const emailForSession = params.email || params.userEmail || userEmail || pendingOrder?.email || '';
      const fullName = params.fullName || pendingOrder?.fullName || '';
      if (!isAuthenticated) {
        if (token) {
          dispatch(setAuthSession({ user: { _id: clientId || undefined, id: clientId || undefined, email: emailForSession, name: fullName || emailForSession || 'User', firstName: fullName.split(' ')[0] || '', lastName: fullName.split(' ').slice(1).join(' ') || '', isEmailVerified: true, hasCompletedOnboarding: true }, token }));
        } else {
          dispatch(setAuthSession({ user: { _id: clientId || 'demo-id', id: clientId || 'demo-id', email: emailForSession || 'user@demo.com', name: fullName || 'User', firstName: fullName.split(' ')[0] || 'User', lastName: fullName.split(' ').slice(1).join(' ') || '', isEmailVerified: true, hasCompletedOnboarding: true }, token: 'demo-token-' + Date.now() }));
        }
      }
      dispatch(setPendingOpenOrderDetails(true));
    }
  }, [hasPrice]);

  const isContinueEnabled = isShareholderDone && isKycDone;
  const handlePrimaryPress = () => {
    if (!isContinueEnabled) {
      if (!isShareholderDone) Toast.show({ type: 'error', text1: 'Complete shareholders & ownership first' });
      else if (!isKycDone) Toast.show({ type: 'error', text1: 'Complete KYC documents first' });
      return;
    }
    const token = params.signupToken || params.token || pendingOrder?.token || authToken || '';
    const clientId = params.clientId || params.signupClientId || pendingOrder?.clientId || pendingOrder?.orderId || '';
    const emailForSession = params.email || params.userEmail || userEmail || pendingOrder?.email || '';
    const fullName = params.fullName || pendingOrder?.fullName || '';
    if (!isAuthenticated) {
      if (token) {
        dispatch(setAuthSession({ user: { _id: clientId || undefined, id: clientId || undefined, email: emailForSession, name: fullName || emailForSession || 'User', firstName: fullName.split(' ')[0] || '', lastName: fullName.split(' ').slice(1).join(' ') || '', isEmailVerified: true, hasCompletedOnboarding: true }, token }));
      } else {
        dispatch(setAuthSession({ user: { _id: clientId || 'demo-id', id: clientId || 'demo-id', email: emailForSession || 'user@demo.com', name: fullName || 'User', firstName: fullName.split(' ')[0] || 'User', lastName: fullName.split(' ').slice(1).join(' ') || '', isEmailVerified: true, hasCompletedOnboarding: true }, token: 'demo-token-' + Date.now() }));
      }
    }
    // Auth ke baad RootStack Main pe switch hoga, isliye flag set karo jisse HomeScreen RegistrationProgress auto-open kare
    dispatch(setPendingOpenRegistrationProgress(true));
  };

  const handleSpeakToTeam = () => {
    // placeholder - maybe navigate to Support
    navigation?.navigate?.('Support');
  };

  // price nahi hai toh Status UI skip - direct Your Order
  if (!hasPrice) return null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#070C15" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* CompanyNaming jaisa Back + Logo header - top se bahar nahi jayega */}
        <View style={styles.headerRow}>
          <BackButton onPress={() => navigation?.goBack?.()} />
          <Image source={logoR} style={styles.topLogo} />
        </View>

        {/* Main Status Icon Circle */}
        <View style={styles.iconWrapper}>
          <View style={[styles.outerCircle, { borderColor: 'rgba(34, 197, 94, 0.2)' }]}>
            <View style={[styles.innerSquare, styles.greenSquare]}>
              <CheckCircle color="#22c55e" size={36} />
            </View>
          </View>
        </View>

        {/* Title & Description */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>
            Payment <Text style={styles.italicGreen}>confirmed</Text>
          </Text>
          <Text style={styles.subTitle}>{amountPaid} paid · Receipt sent to your email</Text>
          <View style={styles.orderBadge}>
            <Text style={styles.orderBadgeText}>
              Order <Text style={{ color: '#eab308' }}>{orderId}</Text>
            </Text>
          </View>
        </View>

        {/* Card List / Steps */}
        <View style={styles.cardsContainer}>
          <Text style={styles.sectionHeader}>NEXT: 2 QUICK STEPS</Text>
          <TouchableOpacity style={styles.cardAction} activeOpacity={0.8} onPress={() => navigation?.navigate?.('Shareholders', { companyName, country, userEmail, orderId, amountPaid, fullName: params.fullName || params.email?.split('@')[0] || '', email: params.email || userEmail, countryOfResidence: params.countryOfResidence, shareholderCompleted: isShareholderDone, kycCompleted: isKycDone })}>
            {isShareholderDone ? (
              <View style={[styles.stepNumberBox, styles.stepCompletedBox]}>
                <Check color="#fff" size={16} strokeWidth={3} />
              </View>
            ) : (
              <View style={styles.stepNumberBox}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
            )}
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Shareholders & ownership</Text>
              <Text style={styles.cardDesc}>Who owns what — about 2 minutes</Text>
            </View>
            {isShareholderDone ? <Check color="#10B981" size={18} /> : <ChevronRight color="#64748b" size={20} />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.cardAction} activeOpacity={0.8} onPress={() => navigation?.navigate?.('VerifyIdentity', { companyName, country, userEmail, orderId, amountPaid, fullName: params.fullName || params.email?.split('@')[0] || '', email: params.email || userEmail, countryOfResidence: params.countryOfResidence, shareholderCompleted: isShareholderDone, kycCompleted: isKycDone })}>
            {isKycDone ? (
              <View style={[styles.stepNumberBox, styles.stepCompletedBox]}>
                <Check color="#fff" size={16} strokeWidth={3} />
              </View>
            ) : (
              <View style={styles.stepNumberBox}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
            )}
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>KYC documents</Text>
              <Text style={styles.cardDesc}>Passport & address proof per shareholder</Text>
            </View>
            {isKycDone ? <Check color="#10B981" size={18} /> : <ChevronRight color="#64748b" size={20} />}
          </TouchableOpacity>
        </View>

        {!isContinueEnabled && (
          <View style={{ backgroundColor: 'rgba(234,179,8,0.08)', borderWidth: 1, borderColor: 'rgba(234,179,8,0.2)', borderRadius: 10, padding: 10, flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 10 }}>
            <CheckCircle size={16} color="#EAB308" style={{ marginRight: 8 }} />
            <Text style={{ color: '#EAB308', fontSize: 11, flex: 1 }}>
              {!isShareholderDone ? 'Complete shareholders & ownership first' : 'Complete KYC documents first'} — then Continue will be enabled
            </Text>
          </View>
        )}
        {/* Action Buttons */}
        <View style={styles.bottomSection}>
          <TouchableOpacity style={[styles.primaryButton, !isContinueEnabled && { opacity: 0.5 }]} activeOpacity={0.85} onPress={handlePrimaryPress} disabled={!isContinueEnabled}>
            <Text style={styles.primaryButtonText}>{isContinueEnabled ? 'Continue' : 'Complete steps to continue'}</Text>
            <ArrowRight color="#070C15" size={18} />
          </TouchableOpacity>
          <Text style={styles.footerNote}>{isContinueEnabled ? 'Filing begins — redirecting to progress' : 'Filing begins once both steps are complete'}</Text>
          {!isContinueEnabled && (
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 10 }}>
              {!isShareholderDone && <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#EAB308' }} /><Text style={{ color: '#64748B', fontSize: 10 }}>Shareholders pending</Text></View>}
              {!isKycDone && <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#EAB308' }} /><Text style={{ color: '#64748B', fontSize: 10 }}>KYC pending</Text></View>}
            </View>
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
    paddingHorizontal: s(20),
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
    paddingHorizontal: s(12),
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
    paddingHorizontal: s(20),
    lineHeight: 20,
  },
  boldText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  orderBadge: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: s(14),
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
  stepCompletedBox: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
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
    borderRadius: 24,
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
    borderRadius: 24,
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
