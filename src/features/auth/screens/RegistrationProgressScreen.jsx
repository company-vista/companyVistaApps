import { font } from '../../../theme/typography';
import React, { useEffect, useRef, useState } from 'react';
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
  Check,
  Clock,
  FileText,
  FileCheck,
} from 'lucide-react-native';
import BackButton from '../../../components/buttons/BackButton';
import logoR from '../../../assets/images/logoR.png';
import { useAppSelector } from '../../../store/hooks';
import { s } from '../../../theme/responsive';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { BackHandler } from 'react-native';
import { API_BASE_URL } from '../../../config/api';
import { themePalette, makeThemeStyles } from '../../../theme/colors';

const RegistrationProgressScreen = ({ navigation, route, onActive }) => {
  const pendingOrder = useAppSelector(s => s.auth.pendingOrderData);
  const token = useAppSelector(s => s.auth.token);
  const user = useAppSelector(s => s.auth.user);
  const params = { ...pendingOrder, ...route?.params } || {};
  // review & confirm wala new client data ko priority
  const companyName = params.companyName || 'Meridian Global Ventures LLC';
  const companyState = params.selectedState || params.country || params.selectedCountry || 'Delaware';
  const structure = params.selectedStructure || params.structure || 'LLC';
  const shareCapital = params.shareCapital || '€25,000';
  const shareholdersCount = params.shareholdersCount || (params.shareholders ? `${params.shareholders} people` : '3 people');
  const orderRef = params.orderId || params.invoiceId || params.referenceId || '#CV-2026-04821';
  const amount = params.amountPaid || (params.amount ? `$${params.amount}` : params.runningTotal ? `$${params.runningTotal}` : '$459');
  const companyId = params.companyId || pendingOrder?.companyId || user?.companies?.[0]?._id || user?.companies?.[0]?.id || null;
  const [backendStatus, setBackendStatus] = useState(null);
  const isLockedPending = !backendStatus || String(backendStatus).toLowerCase() === 'pending';

  // Hardware back bhi pending me block
  useEffect(() => {
    if (!isLockedPending) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      Toast.show({ type: 'info', text1: 'Registration pending', text2: 'Please wait until active' });
      return true;
    });
    return () => sub.remove();
  }, [isLockedPending]);

  // Poll backend registrationStatus until active
  const pollRef = useRef(null);
  useEffect(() => {
    if (!companyId || !token) return;
    let mounted = true;
    const fetchStatus = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/companies/${companyId}`, {
          headers: { Authorization: `Bearer ${token}`, 'x-auth-token': token },
          timeout: 8000,
        });
        const company = res.data?.data || res.data;
        const status = company?.registrationStatus || company?.status || 'pending';
        if (!mounted) return;
        setBackendStatus(status);
        const normalized = String(status).toLowerCase();
        if (['active', 'completed', 'delivered'].includes(normalized)) {
          if (pollRef.current) clearInterval(pollRef.current);
          Toast.show({ type: 'success', text1: 'Registration active!', text2: `Status: ${status}` });
          if (onActive) onActive();
          else {
            // Auto-close after 1.5s so user sees success
            setTimeout(() => {
              if (navigation?.goBack) navigation.goBack();
            }, 1500);
          }
        }
      } catch (e) {
        // keep pending on error
      }
    };
    fetchStatus();
    pollRef.current = setInterval(fetchStatus, 5000);
    return () => {
      mounted = false;
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [companyId, token]);

  const handleBack = () => {
    if (isLockedPending) {
      Toast.show({ type: 'info', text1: 'Registration pending', text2: 'Please wait until status becomes active' });
      return;
    }
    if (navigation?.goBack) navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={themePalette.hex_070c15} />

      {/* CompanyNaming jaisa Back + Logo - pending me lock */}
      <View style={styles.headerRow}>
        <View style={{ opacity: isLockedPending ? 0.4 : 1 }}>
          <BackButton onPress={handleBack} disabled={false} />
        </View>
        <Image source={logoR} style={styles.topLogo} />
        <View style={{ width: 38, alignItems: 'center' }}>
          {isLockedPending ? <Clock size={14} color={themePalette.hex_eab308} /> : null}
        </View>
      </View>
      {isLockedPending ? <Text style={{ color: themePalette.hex_eab308, fontSize: font.small, textAlign: 'center', marginBottom: 8 }}>Status: pending — waiting for active</Text> : null}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>
            Registration <Text style={styles.italicTitle}>progress</Text>
          </Text>
          <Text style={styles.subTitle}>
            {companyName} · {companyState}
          </Text>
        </View>

        {/* Overall Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressCardHeader}>
            <View>
              <Text style={styles.progressCardLabel}>OVERALL</Text>
              <Text style={styles.progressCardValue}>60% complete</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.progressCardEstLabel}>Est. completion</Text>
              <Text style={styles.progressCardEstDate}>14 Jun 2026</Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: '60%' }]} />
          </View>

          <View style={styles.progressCardFooter}>
            <Text style={styles.stepCountText}>Step 3 of 5</Text>
            <Text style={styles.onScheduleText}>On schedule</Text>
          </View>
        </View>

        {/* YOUR SUBMISSION - dynamic fill */}
        <View style={styles.dividerRow}>
          <Text style={styles.sectionHeader}>YOUR SUBMISSION</Text>
          <View style={styles.dividerLine} />
        </View>
        <View style={styles.submissionCard}>
          <View style={styles.cardRow}>
            <Text style={styles.rowLabel}>Company</Text>
            <Text style={[styles.rowValue, styles.goldText]} numberOfLines={1}>{companyName}</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.rowLabel}>Jurisdiction</Text>
            <Text style={styles.rowValue}>{companyState}</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.rowLabel}>Structure</Text>
            <Text style={styles.rowValue}>{structure}</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.rowLabel}>Share capital</Text>
            <Text style={styles.rowValue}>{shareCapital}</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.rowLabel}>Shareholders</Text>
            <Text style={styles.rowValue}>{shareholdersCount}</Text>
          </View>
          <View style={[styles.cardRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.rowLabel}>Order ref</Text>
            <Text style={styles.rowValue}>{orderRef}</Text>
          </View>
        </View>

        {/* Vertical Timeline Steps */}
        <View style={styles.timelineContainer}>
          <View style={styles.timelineItem}>
            <View style={styles.timelineLeftColumn}>
              <View style={[styles.iconCircle, styles.completedCircle]}>
                <Check color={themePalette.hex_10b981} size={16} />
              </View>
              <View style={[styles.timelineLine, styles.activeLine]} />
            </View>
            <View style={styles.timelineRightContent}>
              <Text style={styles.stepTitle}>Order placed & paid</Text>
              <Text style={styles.stepDesc}>
                Payment of {amount} confirmed. Order {orderRef} created.
              </Text>
              <View style={styles.timeStampRow}>
                <Clock color={themePalette.hex_64748b} size={12} />
                <Text style={styles.timeStampText}>6 Jun, 5:42 PM</Text>
              </View>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={styles.timelineLeftColumn}>
              <View style={[styles.iconCircle, styles.completedCircle]}>
                <Check color={themePalette.hex_10b981} size={16} />
              </View>
              <View style={[styles.timelineLine, styles.activeLine]} />
            </View>
            <View style={styles.timelineRightContent}>
              <Text style={styles.stepTitle}>Documents verified</Text>
              <Text style={styles.stepDesc}>
                All 3 shareholders passed KYC. Passports and address proofs approved.
              </Text>
              <View style={styles.timeStampRow}>
                <Clock color={themePalette.hex_64748b} size={12} />
                <Text style={styles.timeStampText}>7 Jun, 11:20 AM</Text>
              </View>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={styles.timelineLeftColumn}>
              <View style={[styles.iconCircle, styles.inProgressCircle]}>
                <View style={styles.innerDotGold} />
              </View>
              <View style={[styles.timelineLine, styles.inactiveLine]} />
            </View>
            <View style={styles.timelineRightContent}>
              <Text style={styles.stepTitleActive}>Filing with Delaware</Text>
              <Text style={styles.stepDesc}>
                Certificate of Formation submitted to the Delaware Division of Corporations. Awaiting state approval.
              </Text>
              <View style={styles.inProgressBadge}>
                <View style={styles.goldDot} />
                <Text style={styles.inProgressBadgeText}>In progress · 2–4 days</Text>
              </View>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={styles.timelineLeftColumn}>
              <View style={[styles.iconCircle, styles.pendingCircle]}>
                <View style={styles.innerDotGrey} />
              </View>
              <View style={[styles.timelineLine, styles.inactiveLine]} />
            </View>
            <View style={styles.timelineRightContent}>
              <Text style={styles.stepTitlePending}>EIN application</Text>
              <Text style={styles.stepDescPending}>
                Federal Tax ID requested from the IRS once formation is approved.
              </Text>
              <Text style={styles.subNotePending}>Typically 1–2 days after formation</Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={styles.timelineLeftColumn}>
              <View style={[styles.iconCircle, styles.pendingCircle]}>
                <View style={styles.innerDotGrey} />
              </View>
            </View>
            <View style={styles.timelineRightContent}>
              <Text style={styles.stepTitlePending}>Documents delivered</Text>
              <Text style={styles.stepDescPending}>
                Formation certificate, EIN letter, operating agreement and banking pack issued to your dashboard.
              </Text>
              <Text style={styles.subNotePending}>Final step</Text>
            </View>
          </View>
        </View>

        <View style={styles.dividerRow}>
          <Text style={styles.sectionHeader}>YOUR DOCUMENTS</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.docCard}>
          <View style={styles.docIconBox}>
            <FileText color={themePalette.hex_64748b} size={20} />
          </View>
          <View style={styles.docInfo}>
            <Text style={styles.docCardTitle}>Certificate of Formation</Text>
            <Text style={styles.docCardSub}>Available once state approves</Text>
          </View>
          <Text style={styles.pendingBadgeText}>Pending</Text>
        </View>

        <View style={styles.docCard}>
          <View style={styles.docIconBox}>
            <FileCheck color={themePalette.hex_64748b} size={20} />
          </View>
          <View style={styles.docInfo}>
            <Text style={styles.docCardTitle}>EIN confirmation letter</Text>
            <Text style={styles.docCardSub}>Available after IRS approval</Text>
          </View>
          <Text style={styles.pendingBadgeText}>Pending</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RegistrationProgressScreen;

const styles = makeThemeStyles(() => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themePalette.hex_070c15,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8, marginTop: 34 },
  topLogo: { width: 150, height: 38, resizeMode: 'contain', marginTop: 10 },
  scrollContent: {
    paddingHorizontal: s(16),
    paddingVertical: 16,
  },
  titleSection: {
    marginBottom: 16,
  },
  mainTitle: {
    fontSize: font.displayLarge,
    color: themePalette.hex_ffffff,
    fontWeight: '400',
  },
  italicTitle: {
    fontStyle: 'italic',
    color: themePalette.hex_eab308,
    fontFamily: 'serif',
  },
  subTitle: {
    color: themePalette.hex_94a3b8,
    fontSize: font.bodySmall,
    marginTop: 6,
  },
  progressCard: {
    backgroundColor: themePalette.hex_0f172a,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: themePalette.rgba_255_255_255_0_08,
    padding: 16,
    marginBottom: 24,
  },
  progressCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  progressCardLabel: {
    color: themePalette.hex_64748b,
    fontSize: font.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  progressCardValue: {
    color: themePalette.hex_eab308,
    fontSize: font.display,
    fontWeight: '500',
    marginTop: 4,
  },
  progressCardEstLabel: {
    color: themePalette.hex_64748b,
    fontSize: font.small,
  },
  progressCardEstDate: {
    color: themePalette.hex_ffffff,
    fontSize: font.base,
    fontWeight: '700',
    marginTop: 4,
  },
  progressTrack: {
    height: 4,
    backgroundColor: themePalette.hex_1e293b,
    borderRadius: 2,
    marginVertical: 14,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: themePalette.hex_eab308,
  },
  progressCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepCountText: {
    color: themePalette.hex_64748b,
    fontSize: font.sm,
  },
  onScheduleText: {
    color: themePalette.hex_10b981,
    fontSize: font.sm,
    fontWeight: '600',
  },
  timelineContainer: {
    marginBottom: 20,
    paddingLeft: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineLeftColumn: {
    alignItems: 'center',
    marginRight: 14,
    width: 24,
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedCircle: {
    backgroundColor: themePalette.rgba_16_185_129_0_15,
    borderWidth: 1,
    borderColor: themePalette.hex_10b981,
  },
  inProgressCircle: {
    backgroundColor: themePalette.rgba_234_179_8_0_15,
    borderWidth: 1.5,
    borderColor: themePalette.hex_eab308,
  },
  pendingCircle: {
    backgroundColor: themePalette.hex_1e293b,
    borderWidth: 1,
    borderColor: themePalette.hex_334155,
  },
  innerDotGold: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: themePalette.hex_eab308,
  },
  innerDotGrey: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: themePalette.hex_64748b,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 6,
  },
  activeLine: {
    backgroundColor: themePalette.hex_10b981,
  },
  inactiveLine: {
    backgroundColor: themePalette.hex_1e293b,
  },
  timelineRightContent: {
    flex: 1,
    paddingTop: 2,
  },
  stepTitle: {
    color: themePalette.hex_ffffff,
    fontSize: font.md,
    fontWeight: '700',
  },
  stepTitleActive: {
    color: themePalette.hex_ffffff,
    fontSize: font.md,
    fontWeight: '700',
  },
  stepTitlePending: {
    color: themePalette.hex_64748b,
    fontSize: font.md,
    fontWeight: '600',
  },
  stepDesc: {
    color: themePalette.hex_94a3b8,
    fontSize: font.sm,
    marginTop: 4,
    lineHeight: 18,
  },
  stepDescPending: {
    color: themePalette.hex_475569,
    fontSize: font.sm,
    marginTop: 4,
    lineHeight: 18,
  },
  timeStampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  timeStampText: {
    color: themePalette.hex_64748b,
    fontSize: font.small,
    marginLeft: 6,
  },
  inProgressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: themePalette.rgba_234_179_8_0_1,
    borderColor: themePalette.rgba_234_179_8_0_3,
    borderWidth: 1,
    paddingHorizontal: s(10),
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 8,
  },
  goldDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: themePalette.hex_eab308,
    marginRight: 6,
  },
  inProgressBadgeText: {
    color: themePalette.hex_eab308,
    fontSize: font.small,
    fontWeight: '600',
  },
  subNotePending: {
    color: themePalette.hex_475569,
    fontSize: font.small,
    marginTop: 6,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionHeader: {
    color: themePalette.hex_475569,
    fontSize: font.small,
    fontWeight: '700',
    letterSpacing: 1,
    marginRight: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: themePalette.hex_1e293b,
  },
  submissionCard: {
    backgroundColor: themePalette.hex_0f172a,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: themePalette.rgba_255_255_255_0_08,
    paddingHorizontal: s(14),
    paddingVertical: 4,
    marginBottom: 20,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: themePalette.hex_1e293b,
  },
  rowLabel: {
    color: themePalette.hex_64748b,
    fontSize: font.bodySmall,
  },
  rowValue: {
    color: themePalette.hex_ffffff,
    fontSize: font.bodySmall,
    fontWeight: '600',
  },
  goldText: {
    color: themePalette.hex_eab308,
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themePalette.hex_0f172a,
    borderColor: themePalette.rgba_255_255_255_0_08,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  docIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: themePalette.hex_1e293b,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  docInfo: {
    flex: 1,
  },
  docCardTitle: {
    color: themePalette.hex_94a3b8,
    fontSize: font.base,
    fontWeight: '600',
  },
  docCardSub: {
    color: themePalette.hex_475569,
    fontSize: font.small,
    marginTop: 2,
  },
  pendingBadgeText: {
    color: themePalette.hex_64748b,
    fontSize: font.sm,
    fontWeight: '600',
  },
}));
