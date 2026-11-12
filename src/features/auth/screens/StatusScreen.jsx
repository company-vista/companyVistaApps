import { font } from '../../../theme/typography';
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  SafeAreaView,
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
import { setAuthSession, setPendingOpenRegistrationProgress, setPendingCloseAddCompany } from '../../../store/slices/authSlice';
import { themePalette, makeThemeStyles } from '../../../theme/colors';

const StatusScreen = ({ navigation, route }) => {
  const params = route?.params || {};
  // Add Company flow (RegistrationStack modal) — signup wale AuthStack flow
  // se alag, kyunki wahan user pehle se authenticated hota hai.
  const isAddCompanyFlow = params.isAddCompanyFlow === true;
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

  // hasPrice check sirf display ke liye — Home auto-open nahi karna, Home sirf Continue press pe khulega
  const hasPrice = Number(params.selectedCountryPrice || 0) > 0 || Number(params.selectedStatePrice || 0) > 0 || Number(params.bestStatePrice || 0) > 0 || Number(params.amount || 0) > 0 || Number(params.runningTotal || 0) > 0 || Number(params.totalAmount || 0) > 0;
  // Shareholders/VerifyIdentity ke backend save (shareholders/:companyId) ke liye
  // companyId/token bhi aage bhejo — bina inke edit/add par "Company ID missing" aata hai.
  // CompletePayment/ResumePayment params me companyId dete hain; token pendingOrder/auth me hota hai.
  const downstreamToken = params.signupToken || params.token || pendingOrder?.token || authToken || '';
  const downstreamClientId = params.clientId || params.signupClientId || pendingOrder?.clientId || pendingOrder?.orderId || '';
  const downstreamCompanyId = params.companyId || pendingOrder?.companyId || '';
  // isAddCompanyFlow bhi aage bhejna zaroori hai — Shareholders/VerifyIdentity
  // isi flag se decide karte hain ki Home se modal band karna hai (flag true)
  // ya apne stack me popToTop() karna (flag false). Iske bina VerifyIdentity
  // par RegistrationLanding par pop ho jata tha (RegistrationStack ka
  // initialRouteName), user ko Home tak back jaana padta tha.
  const downstreamParams = { companyId: downstreamCompanyId, clientId: downstreamClientId, token: downstreamToken, isAddCompanyFlow };

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
    // Add Company flow: user pehle se login hai aur ye screen modal ke andar
    // hai. Signup wale flow me flag set karna kaafi tha (RootStack Main pe
    // switch hota tha), lekin yahan RootStack already Main par hai — flag set
    // karne se kuch nahi hota aur modal band nahi hota, to user Status screen
    // pe hi atak jata. Modal band karwao, Home refresh kar lega.
    if (isAddCompanyFlow) {
      dispatch(setPendingCloseAddCompany(true));
      return;
    }
    // Auth ke baad RootStack Main pe switch hoga, isliye flag set karo jisse HomeScreen RegistrationProgress auto-open kare
    dispatch(setPendingOpenRegistrationProgress(true));
  };

  const handleSpeakToTeam = () => {
    // placeholder - maybe navigate to Support
    navigation?.navigate?.('Support');
  };

  // quoted price pe bhi Status dikhana hai — skip nahi karna

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={themePalette.hex_070c15} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* CompanyNaming jaisa Back + Logo header - top se bahar nahi jayega */}
        <View style={styles.headerRow}>
          <BackButton onPress={() => navigation?.goBack?.()} />
          <Image source={logoR} style={styles.topLogo} />
        </View>

        {/* Main Status Icon Circle */}
        <View style={styles.iconWrapper}>
          <View style={[styles.outerCircle, { borderColor: themePalette.rgba_34_197_94_0_2 }]}>
            <View style={[styles.innerSquare, styles.greenSquare]}>
              <CheckCircle color={themePalette.hex_22c55e} size={36} />
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
              Order <Text style={{ color: themePalette.hex_eab308 }}>{orderId}</Text>
            </Text>
          </View>
        </View>

        {/* Card List / Steps */}
        <View style={styles.cardsContainer}>
          <Text style={styles.sectionHeader}>NEXT: 2 QUICK STEPS</Text>
          <TouchableOpacity style={styles.cardAction} activeOpacity={0.8} onPress={() => navigation?.navigate?.('Shareholders', { ...downstreamParams, companyName, country, userEmail, orderId, amountPaid, fullName: params.fullName || params.email?.split('@')[0] || '', email: params.email || userEmail, countryOfResidence: params.countryOfResidence, shareholderCompleted: isShareholderDone, kycCompleted: isKycDone })}>
            {isShareholderDone ? (
              <View style={[styles.stepNumberBox, styles.stepCompletedBox]}>
                <Check color={themePalette.hex_fff} size={16} strokeWidth={3} />
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
            {isShareholderDone ? <Check color={themePalette.hex_10b981} size={18} /> : <ChevronRight color={themePalette.hex_64748b} size={20} />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.cardAction} activeOpacity={0.8} onPress={() => navigation?.navigate?.('VerifyIdentity', { ...downstreamParams, companyName, country, userEmail, orderId, amountPaid, fullName: params.fullName || params.email?.split('@')[0] || '', email: params.email || userEmail, countryOfResidence: params.countryOfResidence, shareholderCompleted: isShareholderDone, kycCompleted: isKycDone })}>
            {isKycDone ? (
              <View style={[styles.stepNumberBox, styles.stepCompletedBox]}>
                <Check color={themePalette.hex_fff} size={16} strokeWidth={3} />
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
            {isKycDone ? <Check color={themePalette.hex_10b981} size={18} /> : <ChevronRight color={themePalette.hex_64748b} size={20} />}
          </TouchableOpacity>
        </View>

        {!isContinueEnabled && (
          <View style={{ backgroundColor: themePalette.rgba_234_179_8_0_08, borderWidth: 1, borderColor: themePalette.rgba_234_179_8_0_2, borderRadius: 10, padding: 10, flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 10 }}>
            <CheckCircle size={16} color={themePalette.hex_eab308} style={{ marginRight: 8 }} />
            <Text style={{ color: themePalette.hex_eab308, fontSize: font.small, flex: 1 }}>
              {!isShareholderDone ? 'Complete shareholders & ownership first' : 'Complete KYC documents first'} — then Continue will be enabled
            </Text>
          </View>
        )}
        {/* Action Buttons */}
        <View style={styles.bottomSection}>
          <TouchableOpacity style={[styles.primaryButton, !isContinueEnabled && { opacity: 0.5 }]} activeOpacity={0.85} onPress={handlePrimaryPress} disabled={!isContinueEnabled}>
            <Text style={styles.primaryButtonText}>{isContinueEnabled ? 'Continue' : 'Complete steps to continue'}</Text>
            <ArrowRight color={themePalette.hex_070c15} size={18} />
          </TouchableOpacity>
          <Text style={styles.footerNote}>{isContinueEnabled ? 'Filing begins — redirecting to progress' : 'Filing begins once both steps are complete'}</Text>
          {!isContinueEnabled && (
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 10 }}>
              {!isShareholderDone && <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: themePalette.hex_eab308 }} /><Text style={{ color: themePalette.hex_64748b, fontSize: font.xs }}>Shareholders pending</Text></View>}
              {!isKycDone && <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: themePalette.hex_eab308 }} /><Text style={{ color: themePalette.hex_64748b, fontSize: font.xs }}>KYC pending</Text></View>}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default StatusScreen;

const styles = makeThemeStyles(() => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themePalette.hex_070c15,
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
    color: themePalette.hex_d1d5db,
    fontSize: font.xxl,
    letterSpacing: 1,
  },
  brandSub: {
    color: themePalette.hex_6b7280,
    fontSize: font.tiny,
    letterSpacing: 1.5,
    marginTop: 2,
  },
  toggleBtn: {
    backgroundColor: themePalette.hex_1e293b,
    paddingVertical: 6,
    paddingHorizontal: s(12),
    borderRadius: 20,
    marginBottom: 20,
  },
  toggleText: {
    color: themePalette.hex_94a3b8,
    fontSize: font.small,
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
    borderColor: themePalette.rgba_59_130_246_0_2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: themePalette.rgba_15_23_42_0_5,
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
    borderColor: themePalette.hex_2563eb,
    backgroundColor: themePalette.hex_0b1528,
  },
  greenSquare: {
    borderColor: themePalette.hex_16a34a,
    backgroundColor: themePalette.hex_071f15,
  },
  titleSection: {
    alignItems: 'center',
    marginVertical: 16,
  },
  mainTitle: {
    fontSize: font.displayXL,
    color: themePalette.hex_ffffff,
    fontWeight: '400',
  },
  italicBlue: {
    fontStyle: 'italic',
    color: themePalette.hex_60a5fa,
    fontFamily: 'serif',
  },
  italicGreen: {
    fontStyle: 'italic',
    color: themePalette.hex_4ade80,
    fontFamily: 'serif',
  },
  subTitle: {
    color: themePalette.hex_94a3b8,
    fontSize: font.base,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: s(20),
    lineHeight: 20,
  },
  boldText: {
    color: themePalette.hex_ffffff,
    fontWeight: '600',
  },
  orderBadge: {
    backgroundColor: themePalette.rgba_255_255_255_0_05,
    paddingHorizontal: s(14),
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: themePalette.rgba_255_255_255_0_1,
  },
  orderBadgeText: {
    color: themePalette.hex_94a3b8,
    fontSize: font.sm,
    fontWeight: '500',
  },
  cardsContainer: {
    width: '100%',
    marginVertical: 16,
  },
  sectionHeader: {
    color: themePalette.hex_64748b,
    fontSize: font.small,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themePalette.hex_0f172a,
    borderColor: themePalette.rgba_255_255_255_0_08,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  cardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themePalette.hex_0f172a,
    borderColor: themePalette.rgba_255_255_255_0_08,
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
    backgroundColor: themePalette.hex_1e293b,
    borderWidth: 1,
    borderColor: themePalette.hex_334155,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: themePalette.hex_e2e8f0,
    fontWeight: 'bold',
    fontSize: font.base,
  },
  stepCompletedBox: {
    backgroundColor: themePalette.hex_10b981,
    borderColor: themePalette.hex_10b981,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    color: themePalette.hex_ffffff,
    fontSize: font.base,
    fontWeight: '600',
  },
  cardDesc: {
    color: themePalette.hex_64748b,
    fontSize: font.sm,
    marginTop: 2,
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: themePalette.hex_eab308,
    paddingVertical: 16,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: themePalette.hex_eab308,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButtonText: {
    color: themePalette.hex_070c15,
    fontSize: font.lg,
    fontWeight: '700',
    marginRight: 8,
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: themePalette.hex_0f172a,
    borderColor: themePalette.rgba_255_255_255_0_1,
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  secondaryButtonText: {
    color: themePalette.hex_94a3b8,
    fontSize: font.base,
    fontWeight: '600',
    marginLeft: 8,
  },
  footerNote: {
    color: themePalette.hex_64748b,
    fontSize: font.sm,
    marginTop: 12,
  },
}));
