import React, { use } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Clock, Check } from 'lucide-react-native';
import BackButton from '../../../../../components/buttons/BackButton';
import logoR from '../../../../../assets/images/logoR.png';
import { font } from '../../../../../theme/typography';
import { useThemeColors } from '../../../../../theme/colors';
import { s } from '../../../../../theme/responsive';

const OrderDetailsScreen = ({
  onBackPress,
  onMessagePress,
  onNextPress,
  submission = {},
  progress = 0,
}) => {
  const colors = useThemeColors();
  const isLight = colors.mode === 'light';
  const insets = useSafeAreaInsets();
  // progress: 0 = empty, 1 = details submitted, 2 = quote in progress, 3 = review, 4 = filing
  // Auto-derive from submission if progress not provided
  const derivedProgress = (() => {
    if (progress) return progress;
    const hasCompany = !!submission.company && submission.company !== '—';
    const hasJurisdiction = !!submission.jurisdiction && submission.jurisdiction !== '—';
    const hasStructure = !!submission.structure && submission.structure !== '—';
    if (hasCompany || hasJurisdiction || hasStructure) return 1;
    return 0;
  })();
  const isStep1Done = derivedProgress >= 1;
  const isStep2Active = derivedProgress === 1;
  const isStep2Done = derivedProgress >= 2;
  const isStep3Active = derivedProgress === 2;
  const isStep3Done = derivedProgress >= 3;
  const isStep4Active = derivedProgress === 3;
  const isStep4Done = derivedProgress >= 4;
  const hasSubmission = derivedProgress >= 1;

  const companyVal = submission.company ?? '—';
  const jurisdictionVal = submission.jurisdiction ?? '—';
  const structureVal = submission.structure ?? '—';
  const shareCapitalVal = submission.shareCapital ?? '—';
  const shareholdersVal = submission.shareholders ?? '—';
  const orderRefVal = submission.orderRef ?? '—';
  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: colors.background }]}>
      <StatusBar barStyle={isLight ? 'dark-content' : 'light-content'} backgroundColor={colors.background} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={[styles.header, { marginTop: s(8) }]}>
          <BackButton onPress={onBackPress} />
          <Image source={logoR} style={styles.logoImage} resizeMode="contain" />
          <TouchableOpacity style={[styles.iconButton, { backgroundColor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)', borderColor: colors.border }]}>
            <Clock color={colors.text} size={20} />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={[styles.mainTitle, { color: colors.text }]}>
            Your <Text style={styles.italicTitle}>order</Text>
          </Text>
          <Text style={[styles.subTitle, { color: colors.muted }]}>Track your company registration — status updates appear here.</Text>
        </View>

        {/* Preparing Quote Banner */}
        <View style={[styles.statusBanner, { backgroundColor: isLight ? '#FFFFFF' : '#0F1A30', borderColor: colors.border }]}>
          <View style={styles.bannerIconContainer}>
            <Clock color="#3B82F6" size={22} />
          </View>
          <View style={styles.bannerTextContainer}>
            <Text style={[styles.bannerTitle, { color: colors.text }]}>Preparing your quote</Text>
            <Text style={[styles.bannerDescription, { color: colors.muted }]}>
              Our German desk is confirming notary and register fees for your structure.
            </Text>
          </View>
        </View>

        {/* Status Time Info */}
        <View style={styles.timeInfoContainer}>
          <View style={styles.blueDot} />
          <Text style={[styles.timeInfoText, { color: colors.muted }]}>
            Typically ready within <Text style={styles.boldTimeText}>2 hours</Text> · submitted 47 min ago
          </Text>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeaderContainer}>
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>YOUR SUBMISSION</Text>
          <View style={[styles.sectionHeaderLine, { backgroundColor: colors.border }]} />
        </View>

        {/* Submission Details Card */}
        <View style={[styles.card, { backgroundColor: isLight ? '#FFFFFF' : '#0F1A30', borderColor: colors.border }]}>
          <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.muted }]}>Company</Text>
            <Text style={[styles.value, { color: colors.text }, companyVal === '—' ? styles.emptyValue : styles.goldText]}>{companyVal}</Text>
          </View>
          <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.muted }]}>Jurisdiction</Text>
            <Text style={[styles.value, { color: colors.text }, jurisdictionVal === '—' ? styles.emptyValue : null]}>{jurisdictionVal}</Text>
          </View>
          <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.muted }]}>Structure</Text>
            <Text style={[styles.value, { color: colors.text }, structureVal === '—' ? styles.emptyValue : null]}>{structureVal}</Text>
          </View>
          <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.muted }]}>Share capital</Text>
            <Text style={[styles.value, { color: colors.text }, shareCapitalVal === '—' ? styles.emptyValue : null]}>{shareCapitalVal}</Text>
          </View>
          <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.muted }]}>Shareholders</Text>
            <Text style={[styles.value, { color: colors.text }, shareholdersVal === '—' ? styles.emptyValue : null]}>{shareholdersVal}</Text>
          </View>
          <View style={[styles.row, { borderBottomWidth: 0 }]}>
            <Text style={[styles.label, { color: colors.muted }]}>Order ref</Text>
            <Text style={[styles.value, { color: colors.text }, orderRefVal === '—' ? styles.emptyValue : null]}>{orderRefVal}</Text>
          </View>
        </View>

        {/* Timeline - progressive */}
        <View style={styles.timelineContainer}>
          {/* Step 1: Details submitted */}
          <View style={styles.timelineItem}>
            <View style={styles.timelineLeftColumn}>
              <View style={[styles.stepCircle, isStep1Done ? styles.stepCircleCompleted : styles.stepCirclePending, !isStep1Done ? { borderColor: colors.border } : null]}>
                <Check color={isStep1Done ? '#10B981' : isLight ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.25)'} size={isStep1Done ? 14 : 12} />
              </View>
              <View style={[styles.timelineLine, isStep1Done ? styles.timelineLineCompleted : styles.timelineLinePending, !isStep1Done ? { backgroundColor: colors.border } : null]} />
            </View>
            <View style={styles.timelineContent}>
              <Text style={[styles.stepTitle, { color: colors.text }, !isStep1Done && styles.stepTitlePending, !isStep1Done && { color: colors.muted }]}>Details submitted</Text>
              <Text style={[styles.stepDescription, { color: colors.muted }]}>{isStep1Done ? 'Company and founder information received.' : 'Company and founder information will appear here once submitted.'}</Text>
              {isStep1Done && hasSubmission ? <Text style={[styles.stepDate, { color: colors.muted }]}>Just now</Text> : null}
            </View>
          </View>

          {/* Step 2: Quote being prepared */}
          <View style={styles.timelineItem}>
            <View style={styles.timelineLeftColumn}>
              <View style={[styles.stepCircle, isStep2Active ? styles.stepCircleActive : isStep2Done ? styles.stepCircleCompleted : styles.stepCirclePending, !isStep2Active && !isStep2Done ? { borderColor: colors.border } : null]}>
                {isStep2Active ? <View style={styles.activeDot} /> : isStep2Done ? <Check color="#10B981" size={14} /> : null}
              </View>
              <View style={[styles.timelineLine, isStep2Done ? styles.timelineLineCompleted : styles.timelineLinePending, !isStep2Done ? { backgroundColor: colors.border } : null]} />
            </View>
            <View style={styles.timelineContent}>
              <Text style={[styles.stepTitle, { color: colors.text }, !isStep2Active && !isStep2Done && styles.stepTitlePending, !isStep2Active && !isStep2Done && { color: colors.muted }]}>Quote being prepared</Text>
              <Text style={[styles.stepDescription, { color: colors.muted }]}>Confirming notary, register and translation costs specific to your case.</Text>
              {isStep2Active ? <View style={styles.inProgressBadge}><Text style={styles.inProgressText}>In progress</Text></View> : null}
            </View>
          </View>

          {/* Step 3: Review & approve */}
          <View style={styles.timelineItem}>
            <View style={styles.timelineLeftColumn}>
              <View style={[styles.stepCircle, isStep3Active ? styles.stepCircleActive : isStep3Done ? styles.stepCircleCompleted : styles.stepCirclePending, !isStep3Active && !isStep3Done ? { borderColor: colors.border } : null]}>
                {isStep3Active ? <View style={styles.activeDot} /> : isStep3Done ? <Check color="#10B981" size={14} /> : <Check color={isLight ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.35)'} size={12} />}
              </View>
              <View style={[styles.timelineLine, isStep3Done ? styles.timelineLineCompleted : styles.timelineLinePending, !isStep3Done ? { backgroundColor: colors.border } : null]} />
            </View>
            <View style={styles.timelineContent}>
              <Text style={[styles.stepTitle, { color: colors.text }, !isStep3Active && !isStep3Done && styles.stepTitlePending, !isStep3Active && !isStep3Done && { color: colors.muted }]}>Review & approve</Text>
              <Text style={[styles.stepDescription, { color: colors.muted }]}>You approve the quote before anything is charged.</Text>
              {isStep3Active ? <View style={styles.inProgressBadge}><Text style={styles.inProgressText}>In progress</Text></View> : null}
            </View>
          </View>

          {/* Step 4: Filing begins */}
          <View style={styles.timelineItem}>
            <View style={styles.timelineLeftColumn}>
              <View style={[styles.stepCircle, isStep4Active ? styles.stepCircleActive : isStep4Done ? styles.stepCircleCompleted : styles.stepCirclePending, !isStep4Active && !isStep4Done ? { borderColor: colors.border } : null]}>
                {isStep4Active ? <View style={styles.activeDot} /> : isStep4Done ? <Check color="#10B981" size={14} /> : null}
              </View>
            </View>
            <View style={styles.timelineContent}>
              <Text style={[styles.stepTitle, { color: colors.text }, !isStep4Active && !isStep4Done && styles.stepTitlePending, !isStep4Active && !isStep4Done && { color: colors.muted }]}>Filing begins</Text>
              <Text style={[styles.stepDescription, { color: colors.muted }]}>Shareholder details, KYC, then submission.</Text>
              {isStep4Active ? <View style={styles.inProgressBadge}><Text style={styles.inProgressText}>In progress</Text></View> : null}
            </View>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity style={[styles.nextButton, { backgroundColor: colors.buttonBackground }]} activeOpacity={0.85} onPress={onNextPress ?? onMessagePress}>
          <Text style={styles.nextButtonText}>Next</Text>
          <Text style={styles.nextArrow}>→</Text>
        </TouchableOpacity>

        {/* Footer Text */}
        <Text style={[styles.footerText, { color: colors.muted }]}>We'll notify you by email and push</Text>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070D1E',
  },
  scrollContent: {
    paddingHorizontal: s(20),
    paddingBottom: s(30),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: s(20),
    paddingHorizontal: s(0),
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 130,
    height: 32,
  },
  titleContainer: {
    marginBottom: s(20),
  },
  mainTitle: {
    color: '#FFFFFF',
    fontSize: font.display,
    fontWeight: '600',
  },
  italicTitle: {
    fontStyle: 'italic',
    fontWeight: '300',
  },
  subTitle: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: s(6),
  },
  statusBanner: {
    flexDirection: 'row',
    backgroundColor: '#0F1A30',
    borderRadius: 14,
    padding: s(16),
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    marginBottom: s(16),
  },
  bannerIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: s(14),
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: s(4),
  },
  bannerDescription: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 18,
  },
  timeInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: s(25),
  },
  blueDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3B82F6',
    marginRight: s(10),
  },
  timeInfoText: {
    color: '#94A3B8',
    fontSize: 13,
  },
  boldTimeText: {
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: s(15),
  },
  sectionTitle: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginRight: s(10),
  },
  sectionHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  card: {
    backgroundColor: '#0F1A30',
    borderRadius: 16,
    paddingHorizontal: s(18),
    paddingVertical: s(8),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: s(25),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: s(12),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  label: {
    color: '#64748B',
    fontSize: 14,
  },
  value: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  goldText: {
    color: '#EAB308',
  },
  emptyValue: {
    color: '#475569',
    fontStyle: 'italic',
  },
  timelineContainer: {
    marginBottom: s(25),
    paddingLeft: s(4),
  },
  timelineItem: {
    flexDirection: 'row',
  },
  timelineLeftColumn: {
    alignItems: 'center',
    marginRight: s(15),
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  stepCircleActive: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    borderWidth: 1,
    borderColor: '#EAB308',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  inProgressBadge: {
    alignSelf: 'flex-start',
    marginTop: s(8),
    paddingHorizontal: s(10),
    paddingVertical: s(4),
    borderRadius: 20,
    backgroundColor: 'rgba(59,130,246,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.3)',
  },
  inProgressText: {
    color: '#3B82F6',
    fontSize: 11,
    fontWeight: '600',
  },
  timelineLine: {
    width: 2,
    height: 45,
  },
  timelineLineCompleted: {
    backgroundColor: '#10B981',
  },
  timelineLinePending: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  stepCirclePending: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  stepTitlePending: {
    color: '#64748B',
  },
  timelineContent: {
    flex: 1,
    paddingBottom: s(20),
  },
  stepTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: s(4),
  },
  stepDescription: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: s(4),
  },
  stepDate: {
    color: '#64748B',
    fontSize: 12,
  },
  nextButton: {
    flexDirection: 'row',
    backgroundColor: '#EAB308',
    borderRadius: 24,
    paddingVertical: s(14),
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: s(15),
  },
  nextButtonText: {
    color: '#0A0A0A',
    fontSize: 15,
    fontWeight: '700',
  },
  nextArrow: {
    color: '#0A0A0A',
    fontSize: 18,
    fontWeight: '700',
    marginTop: -2,
  },
  footerText: {
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
  },
});

export default OrderDetailsScreen;
