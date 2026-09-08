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
  Check,
  Clock,
  FileText,
  FileCheck,
} from 'lucide-react-native';
import BackButton from '../../../components/buttons/BackButton';
import logoR from '../../../assets/images/logoR.png';
import { useAppSelector } from '../../../store/hooks';

const RegistrationProgressScreen = ({ navigation, route }) => {
  const pendingOrder = useAppSelector(s => s.auth.pendingOrderData);
  const params = { ...pendingOrder, ...route?.params } || {};
  // review & confirm wala new client data ko priority
  const companyName = params.companyName || 'Meridian Global Ventures LLC';
  const companyState = params.selectedState || params.country || params.selectedCountry || 'Delaware';
  const structure = params.selectedStructure || params.structure || 'LLC';
  const shareCapital = params.shareCapital || '€25,000';
  const shareholdersCount = params.shareholdersCount || (params.shareholders ? `${params.shareholders} people` : '3 people');
  const orderRef = params.orderId || params.invoiceId || params.referenceId || '#CV-2026-04821';
  const amount = params.amountPaid || (params.amount ? `$${params.amount}` : params.runningTotal ? `$${params.runningTotal}` : '$459');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#070C15" />

      {/* CompanyNaming jaisa Back + Logo */}
      <View style={styles.headerRow}>
        <BackButton onPress={() => navigation?.goBack?.()} />
        <Image source={logoR} style={styles.topLogo} />
      </View>

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
                <Check color="#10B981" size={16} />
              </View>
              <View style={[styles.timelineLine, styles.activeLine]} />
            </View>
            <View style={styles.timelineRightContent}>
              <Text style={styles.stepTitle}>Order placed & paid</Text>
              <Text style={styles.stepDesc}>
                Payment of {amount} confirmed. Order {orderRef} created.
              </Text>
              <View style={styles.timeStampRow}>
                <Clock color="#64748B" size={12} />
                <Text style={styles.timeStampText}>6 Jun, 5:42 PM</Text>
              </View>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={styles.timelineLeftColumn}>
              <View style={[styles.iconCircle, styles.completedCircle]}>
                <Check color="#10B981" size={16} />
              </View>
              <View style={[styles.timelineLine, styles.activeLine]} />
            </View>
            <View style={styles.timelineRightContent}>
              <Text style={styles.stepTitle}>Documents verified</Text>
              <Text style={styles.stepDesc}>
                All 3 shareholders passed KYC. Passports and address proofs approved.
              </Text>
              <View style={styles.timeStampRow}>
                <Clock color="#64748B" size={12} />
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
            <FileText color="#64748B" size={20} />
          </View>
          <View style={styles.docInfo}>
            <Text style={styles.docCardTitle}>Certificate of Formation</Text>
            <Text style={styles.docCardSub}>Available once state approves</Text>
          </View>
          <Text style={styles.pendingBadgeText}>Pending</Text>
        </View>

        <View style={styles.docCard}>
          <View style={styles.docIconBox}>
            <FileCheck color="#64748B" size={20} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070C15',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8, marginTop: 34 },
  topLogo: { width: 150, height: 38, resizeMode: 'contain', marginTop: 10 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  titleSection: {
    marginBottom: 16,
  },
  mainTitle: {
    fontSize: 26,
    color: '#FFFFFF',
    fontWeight: '400',
  },
  italicTitle: {
    fontStyle: 'italic',
    color: '#EAB308',
    fontFamily: 'serif',
  },
  subTitle: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 6,
  },
  progressCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
    marginBottom: 24,
  },
  progressCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  progressCardLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  progressCardValue: {
    color: '#EAB308',
    fontSize: 22,
    fontWeight: '500',
    marginTop: 4,
  },
  progressCardEstLabel: {
    color: '#64748B',
    fontSize: 11,
  },
  progressCardEstDate: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#1E293B',
    borderRadius: 2,
    marginVertical: 14,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#EAB308',
  },
  progressCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepCountText: {
    color: '#64748B',
    fontSize: 12,
  },
  onScheduleText: {
    color: '#10B981',
    fontSize: 12,
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
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  inProgressCircle: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    borderWidth: 1.5,
    borderColor: '#EAB308',
  },
  pendingCircle: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  innerDotGold: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EAB308',
  },
  innerDotGrey: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#64748B',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 6,
  },
  activeLine: {
    backgroundColor: '#10B981',
  },
  inactiveLine: {
    backgroundColor: '#1E293B',
  },
  timelineRightContent: {
    flex: 1,
    paddingTop: 2,
  },
  stepTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  stepTitleActive: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  stepTitlePending: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: '600',
  },
  stepDesc: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },
  stepDescPending: {
    color: '#475569',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },
  timeStampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  timeStampText: {
    color: '#64748B',
    fontSize: 11,
    marginLeft: 6,
  },
  inProgressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    borderColor: 'rgba(234, 179, 8, 0.3)',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 8,
  },
  goldDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EAB308',
    marginRight: 6,
  },
  inProgressBadgeText: {
    color: '#EAB308',
    fontSize: 11,
    fontWeight: '600',
  },
  subNotePending: {
    color: '#475569',
    fontSize: 11,
    marginTop: 6,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionHeader: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginRight: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#1E293B',
  },
  submissionCard: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 20,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  rowLabel: {
    color: '#64748B',
    fontSize: 13,
  },
  rowValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  goldText: {
    color: '#EAB308',
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  docIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  docInfo: {
    flex: 1,
  },
  docCardTitle: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  docCardSub: {
    color: '#475569',
    fontSize: 11,
    marginTop: 2,
  },
  pendingBadgeText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
});
