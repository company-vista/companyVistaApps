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
import { CheckCircle, ChevronRight, ArrowRight, Check } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import BackButton from '../../../components/buttons/BackButton';
import logoR from '../../../assets/images/logoR.png';
import { s } from '../../../theme/responsive';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { setAuthSession, setPendingOpenRegistrationProgress, setPendingCloseAddCompany } from '../../../store/slices/authSlice';
import { useThemeColors, themePalette } from '../../../theme/colors';
import { font } from '../../../theme/typography';

const StatusScreen = ({ navigation, route }) => {
  const params = route?.params || {};
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
  const colors = useThemeColors();
  const isDark = colors.mode === 'dark';

  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const authToken = useAppSelector((s) => s.auth.token);
  const pendingOrder = useAppSelector((s) => s.auth.pendingOrderData);

  const downstreamToken = params.signupToken || params.token || pendingOrder?.token || authToken || '';
  const downstreamClientId = params.clientId || params.signupClientId || pendingOrder?.clientId || pendingOrder?.orderId || '';
  const downstreamCompanyId = params.companyId || pendingOrder?.companyId || '';
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
    if (isAddCompanyFlow) {
      dispatch(setPendingCloseAddCompany(true));
      return;
    }
    dispatch(setPendingOpenRegistrationProgress(true));
  };

  const handleSpeakToTeam = () => {
    navigation?.navigate?.('Support');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <BackButton onPress={() => navigation?.goBack?.()} />
          <Image source={logoR} style={styles.topLogo} />
        </View>

        <View style={styles.iconWrapper}>
          <View style={[styles.outerCircle, { borderColor: isDark ? themePalette.rgba_34_197_94_0_2 : themePalette.rgba_16_185_129_0_25, backgroundColor: isDark ? themePalette.rgba_15_23_42_0_5 : themePalette.rgba_16_185_129_0_08 }]}>
            <View style={[styles.innerSquare, { borderColor: isDark ? themePalette.hex_16a34a : colors.success, backgroundColor: isDark ? themePalette.hex_071f15 : themePalette.rgba_16_185_129_0_12 }]}>
              <CheckCircle color={colors.success} size={36} />
            </View>
          </View>
        </View>

        <View style={styles.titleSection}>
          <Text style={[styles.mainTitle, { color: colors.text }]}>
            Payment <Text style={[styles.italicGreen, { color: colors.success }]}>confirmed</Text>
          </Text>
          <Text style={[styles.subTitle, { color: colors.muted }]}>{amountPaid} paid - Receipt sent to your email</Text>
          <View style={[styles.orderBadge, { backgroundColor: isDark ? themePalette.rgba_255_255_255_0_05 : colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.orderBadgeText, { color: colors.muted }]}>
              Order <Text style={{ color: isDark ? themePalette.hex_eab308 : colors.primary }}>{orderId}</Text>
            </Text>
          </View>
        </View>

        <View style={styles.cardsContainer}>
          <Text style={[styles.sectionHeader, { color: colors.subtle }]}>NEXT: 2 QUICK STEPS</Text>
          <TouchableOpacity style={[styles.cardAction, { backgroundColor: isDark ? themePalette.hex_0f172a : colors.surface, borderColor: colors.border }]} activeOpacity={0.8} onPress={() => navigation?.navigate?.('Shareholders', { ...downstreamParams, companyName, country, userEmail, orderId, amountPaid, fullName: params.fullName || params.email?.split('@')[0] || '', email: params.email || userEmail, countryOfResidence: params.countryOfResidence, shareholderCompleted: isShareholderDone, kycCompleted: isKycDone })}>
            {isShareholderDone ? (
              <View style={[styles.stepNumberBox, { backgroundColor: colors.success, borderColor: colors.success }]}>
                <Check color={themePalette.hex_ffffff} size={16} strokeWidth={3} />
              </View>
            ) : (
              <View style={[styles.stepNumberBox, { backgroundColor: isDark ? themePalette.hex_1e293b : colors.inputBackground, borderColor: colors.border }]}>
                <Text style={[styles.stepNumberText, { color: colors.text }]}>1</Text>
              </View>
            )}
            <View style={styles.cardTextContainer}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Shareholders & ownership</Text>
              <Text style={[styles.cardDesc, { color: colors.subtle }]}>Who owns what — about 2 minutes</Text>
            </View>
            {isShareholderDone ? <Check color={colors.success} size={18} /> : <ChevronRight color={colors.subtle} size={20} />}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.cardAction, { backgroundColor: isDark ? themePalette.hex_0f172a : colors.surface, borderColor: colors.border }]} activeOpacity={0.8} onPress={() => navigation?.navigate?.('VerifyIdentity', { ...downstreamParams, companyName, country, userEmail, orderId, amountPaid, fullName: params.fullName || params.email?.split('@')[0] || '', email: params.email || userEmail, countryOfResidence: params.countryOfResidence, shareholderCompleted: isShareholderDone, kycCompleted: isKycDone })}>
            {isKycDone ? (
              <View style={[styles.stepNumberBox, { backgroundColor: colors.success, borderColor: colors.success }]}>
                <Check color={themePalette.hex_ffffff} size={16} strokeWidth={3} />
              </View>
            ) : (
              <View style={[styles.stepNumberBox, { backgroundColor: isDark ? themePalette.hex_1e293b : colors.inputBackground, borderColor: colors.border }]}>
                <Text style={[styles.stepNumberText, { color: colors.text }]}>2</Text>
              </View>
            )}
            <View style={styles.cardTextContainer}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>KYC documents</Text>
              <Text style={[styles.cardDesc, { color: colors.subtle }]}>Passport & address proof per shareholder</Text>
            </View>
            {isKycDone ? <Check color={colors.success} size={18} /> : <ChevronRight color={colors.subtle} size={20} />}
          </TouchableOpacity>
        </View>

        {!isContinueEnabled && (
          <View style={{ backgroundColor: isDark ? themePalette.rgba_234_179_8_0_08 : themePalette.rgba_217_119_6_0_1, borderWidth: 1, borderColor: isDark ? themePalette.rgba_234_179_8_0_2 : themePalette.rgba_217_119_6_0_25, borderRadius: 10, padding: 10, flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 10 }}>
            <CheckCircle size={16} color={colors.warning} style={{ marginRight: 8 }} />
            <Text style={{ color: colors.warning, fontSize: font.small, flex: 1 }}>
              {!isShareholderDone ? 'Complete shareholders & ownership first' : 'Complete KYC documents first'} — then Continue will be enabled
            </Text>
          </View>
        )}

        <View style={styles.bottomSection}>
          <TouchableOpacity style={[styles.primaryButton, !isDark && { backgroundColor: themePalette.hex_2563eb }, !isContinueEnabled && { opacity: 0.5 }]} activeOpacity={0.85} onPress={handlePrimaryPress} disabled={!isContinueEnabled}>
            <Text style={[styles.primaryButtonText, !isDark && { color: themePalette.hex_ffffff }]}>{isContinueEnabled ? 'Continue' : 'Complete steps to continue'}</Text>
            <ArrowRight color={isDark ? themePalette.hex_070c15 : themePalette.hex_ffffff} size={18} />
          </TouchableOpacity>
          <Text style={[styles.footerNote, { color: colors.subtle }]}>{isContinueEnabled ? 'Filing begins — redirecting to progress' : 'Filing begins once both steps are complete'}</Text>
          {!isContinueEnabled && (
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 10 }}>
              {!isShareholderDone && <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.warning }} /><Text style={{ color: colors.subtle, fontSize: font.xs }}>Shareholders pending</Text></View>}
              {!isKycDone && <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.warning }} /><Text style={{ color: colors.subtle, fontSize: font.xs }}>KYC pending</Text></View>}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default StatusScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: s(20), paddingBottom: 24, alignItems: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16, marginTop: 34, alignSelf: 'stretch' },
  topLogo: { width: 150, height: 38, resizeMode: 'contain', marginTop: 10 },
  iconWrapper: { marginVertical: 10, alignItems: 'center', justifyContent: 'center' },
  outerCircle: { width: 160, height: 160, borderRadius: 80, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  innerSquare: { width: 100, height: 100, borderRadius: 28, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  titleSection: { alignItems: 'center', marginVertical: 16 },
  mainTitle: { fontSize: font.displayXL, fontWeight: '400' },
  italicGreen: { fontStyle: 'italic', fontFamily: 'serif' },
  subTitle: { fontSize: font.base, textAlign: 'center', marginTop: 8, paddingHorizontal: s(20), lineHeight: 22 },
  orderBadge: { paddingHorizontal: s(14), paddingVertical: 6, borderRadius: 16, marginTop: 12, borderWidth: 1 },
  orderBadgeText: { fontSize: font.sm, fontWeight: '500' },
  cardsContainer: { width: '100%', marginVertical: 16 },
  sectionHeader: { fontSize: font.small, fontWeight: '700', letterSpacing: 1, marginBottom: 10 },
  cardAction: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 10 },
  stepNumberBox: { width: 32, height: 32, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  stepNumberText: { fontWeight: 'bold', fontSize: font.base },
  cardTextContainer: { flex: 1 },
  cardTitle: { fontSize: font.base, fontWeight: '600' },
  cardDesc: { fontSize: font.sm, marginTop: 2 },
  bottomSection: { width: '100%', alignItems: 'center', marginTop: 10 },
  primaryButton: { width: '100%', backgroundColor: themePalette.hex_eab308, paddingVertical: 16, borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  primaryButtonText: { color: themePalette.hex_070c15, fontSize: font.lg, fontWeight: '700' },
  footerNote: { fontSize: font.sm, marginTop: 12 },
});
