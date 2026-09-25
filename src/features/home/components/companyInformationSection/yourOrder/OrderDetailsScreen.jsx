import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Clock, Check, RefreshCw } from 'lucide-react-native';
import BackButton from '../../../../../components/buttons/BackButton';
import logoR from '../../../../../assets/images/logoR.png';
import { font } from '../../../../../theme/typography';
import { useThemeColors } from '../../../../../theme/colors';
import { s } from '../../../../../theme/responsive';
import { useAppSelector } from '../../../../../store/hooks';
import { fetchQuote, isQuoteReady, formatCurrency } from './api/quoteApi';
import { fetchReviewApi } from '../../../../../features/auth/api/orderApi';

const OrderDetailsScreen = ({
  onBackPress,
  onMessagePress,
  onNextPress,
  submission = {},
  progress = 0,
  selectedCompany = null,
}) => {
  const colors = useThemeColors();
  const isLight = colors.mode === 'light';
  const insets = useSafeAreaInsets();
  const registration = useAppSelector((state) => state.companyRegistration);
  const fallbackCompany = useAppSelector((state) => state.auth.user?.companies?.[0]);
  const pendingOrder = useAppSelector((state) => state.auth.pendingOrderData);
  // Build display values: priority -> submission prop -> pendingOrder (ReviewAndConfirm data) -> selectedCompany -> registration
  // dedup LLC: "Acme LLC LLC" / "Acme L.L.C." + LLC -> single suffix
  const buildPendingCompanyName = () => {
    if (!pendingOrder?.companyName) return null;
    const base = String(pendingOrder.companyName).trim();
    const suffix = String(pendingOrder.selectedEnding || pendingOrder.selectedStructure || '').trim();
    if (!suffix) return base;
    const normalize = (s) => s.toLowerCase().replace(/[\.\s-]/g, '');
    const normSuffix = normalize(suffix);
    // repeatedly strip trailing word that equals suffix (handles duplicate "LLC LLC" and L.L.C. vs LLC alias)
    let cleaned = base;
    let parts = cleaned.split(/\s+/);
    while (parts.length > 0 && normalize(parts[parts.length - 1]) === normSuffix) {
      parts.pop();
      cleaned = parts.join(' ');
    }
    return `${cleaned} ${suffix}`.trim();
  };
  const pendingCompanyName = buildPendingCompanyName();
  const pendingJurisdiction = pendingOrder?.selectedState ? `US ${pendingOrder.selectedState}, USA` : pendingOrder?.selectedJurisdiction ? String(pendingOrder.selectedJurisdiction) : null;
  const companyVal =
    submission.company ??
    pendingCompanyName ??
    selectedCompany?.name ??
    registration.companyName ??
    fallbackCompany?.companyName ??
    '—';
  const jurisdictionVal =
    submission.jurisdiction ??
    pendingJurisdiction ??
    selectedCompany?.state ??
    selectedCompany?.countryOfIncorporation ??
    registration.stateOfIncorporation ??
    registration.jurisdictionName ??
    '—';
  const structureVal =
    submission.structure ??
    pendingOrder?.selectedStructure ??
    selectedCompany?.companyType ??
    registration.entityType ??
    '—';
  const shareholdersVal =
    submission.shareholders ??
    pendingOrder?.shareholdersCount ??
    (Array.isArray(registration.directors) && registration.directors.length > 0
      ? `${registration.directors.length} Shareholder(s)`
      : selectedCompany?.name
        ? '1 Shareholder'
        : '—');
  const orderRefVal =
    submission.orderRef ??
    pendingOrder?.orderId ??
    (selectedCompany?.id ? `#${String(selectedCompany.id).slice(-8).toUpperCase()}` : fallbackCompany?._id ? `#${String(fallbackCompany._id).slice(-8).toUpperCase()}` : '—');

  const token = useAppSelector((state) => state.auth.token);
  const [quote, setQuote] = useState(null);
  const [review, setReview] = useState(null);
  const [loadingQuote, setLoadingQuote] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const refreshQuote = async () => {
    const cid = selectedCompany?.id || selectedCompany?._id || pendingOrder?.companyId;
    setRefreshing(true);
    setLoadingQuote(true);
    try {
      const res = await fetchQuote({ companyId: cid, token, invoiceId: pendingOrder?.orderId });
      setQuote(res.quote);
      // also refresh review pricing via GET /review/:companyId
      const r = await fetchReviewApi({ companyId: cid, token });
      if (r.isSuccess) setReview(r.data);
    } finally {
      setRefreshing(false);
      setLoadingQuote(false);
    }
  };
  useEffect(() => {
    let mounted = true;
    const cid = selectedCompany?.id || selectedCompany?._id || pendingOrder?.companyId;
    fetchQuote({ companyId: cid, token, invoiceId: pendingOrder?.orderId })
      .then(res => { if (mounted) setQuote(res.quote); })
      .finally(() => { if (mounted) setLoadingQuote(false); });
    // fetch review pricing — company & review page ke liye naya API
    fetchReviewApi({ companyId: cid, token }).then(r => { if (mounted && r.isSuccess) setReview(r.data); });
    return () => { mounted = false; };
  }, [selectedCompany?.id, selectedCompany?._id, pendingOrder?.companyId, pendingOrder?.orderId, token]);

  const effectiveQuote = quote;
  // review pricing via GET /review/:companyId — company.totalAmount || computeOrderTotal(data) yahi se aata hai
  const reviewAmount = review?.pricing?.totalAmount ?? review?.company?.totalAmount ?? 0;
  const reviewPricingType = review?.pricingType;
  // Xyz LLC: admin ne totalAmount bheja ho to wo bhi pick karo, 0 ko skip karke first positive amount lo — review amount ko priority do
  const rawAmount = [
    reviewAmount,
    submission.amount, submission.adminAmount, submission.totalAmount,
    pendingOrder?.amount, pendingOrder?.runningTotal, pendingOrder?.totalAmount,
    selectedCompany?.quoteAmount, selectedCompany?.adminAmount, selectedCompany?.totalAmount,
    effectiveQuote?.total, effectiveQuote?.totalAmount, effectiveQuote?.raw?.total, effectiveQuote?.raw?.totalAmount,
  ].find(v => Number(v) > 0) ?? reviewAmount ?? 0;
  const numericAmount = Number(rawAmount) || 0;
  const hasAmount = !loadingQuote && isQuoteReady(effectiveQuote) && numericAmount > 0;
  // progress: 1 = only Details submitted, 2 = Quote being prepared done -> Review & approve active
  const derivedProgress = (() => {
    if (progress) return progress;
    if (hasAmount) return 2; // quote fill hone par Quote being prepared -> done, Review & approve -> active
    return 1; // quote pending -> Quote being prepared active (not done)
  })();
  const isStep1Done = true;
  const isStep2Active = derivedProgress === 1;
  const isStep2Done = derivedProgress >= 2;
  const isStep3Active = derivedProgress === 2;
  const isStep3Done = derivedProgress >= 3;
  const isStep4Active = derivedProgress === 3;
  const isStep4Done = derivedProgress >= 4;
  const hasSubmission = true;
  const isNextEnabled = hasAmount && !loadingQuote;
  // price define nahi hai toh back band - quote + payment pura karke hi homepage
  const isNoPriceOrder = Number(pendingOrder?.selectedCountryPrice ?? 0) === 0 && Number(pendingOrder?.selectedStatePrice ?? 0) === 0 && Number(pendingOrder?.bestStatePrice ?? 0) === 0 && pendingOrder?.orderId;
  const handleBack = onBackPress;
  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: colors.background }]}>
      <StatusBar barStyle={isLight ? 'dark-content' : 'light-content'} backgroundColor={colors.background} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={[styles.header, { marginTop: s(8) }]}>
          <BackButton onPress={handleBack} />
          <Image source={logoR} style={styles.logoImage} resizeMode="contain" />
          <View style={{ width: 40 }} />
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={[styles.mainTitle, { color: colors.text }]}>
            Your <Text style={styles.italicTitle}>order</Text>
          </Text>
          <Text style={[styles.subTitle, { color: colors.muted }]}>Track your company registration — status updates appear here.</Text>
        </View>

        {/* Preparing Quote Banner - changes when admin quote ready */}
        <View style={[styles.statusBanner, { backgroundColor: isLight ? '#FFFFFF' : '#0F1A30', borderColor: hasAmount ? 'rgba(16,185,129,0.3)' : colors.border }]}>
          <View style={[styles.bannerIconContainer, hasAmount && { backgroundColor: 'rgba(16,185,129,0.15)' }]}>
            {hasAmount ? <Check color="#10B981" size={22} /> : loadingQuote ? <ActivityIndicator size="small" color="#3B82F6" /> : <Clock color="#3B82F6" size={22} />}
          </View>
          <View style={styles.bannerTextContainer}>
            <Text style={[styles.bannerTitle, { color: colors.text }]}>{hasAmount ? 'Quote ready!' : 'Preparing your quote'}</Text>
            <Text style={[styles.bannerDescription, { color: colors.muted }]}>
              {hasAmount ? `Admin has prepared your quote — ${formatCurrency(numericAmount, effectiveQuote?.currency)} ready for review.` : 'Our German desk is confirming notary and register fees for your structure.'}
            </Text>
          </View>
        </View>

        {/* Status Time Info */}
        <View style={styles.timeInfoContainer}>
          <View style={[styles.blueDot, hasAmount && { backgroundColor: '#10B981' }]} />
          <Text style={[styles.timeInfoText, { color: colors.muted }]}>
            {hasAmount ? <><Text style={[styles.boldTimeText, { color: '#10B981' }]}>Ready to review</Text> · tap View Quote below</> : <>Typically ready within <Text style={styles.boldTimeText}>2 hours</Text> · submitted 47 min ago</>}
          </Text>
        </View>

        {/* Section Header with small refresh for quote API */}
        <View style={styles.sectionHeaderContainer}>
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>YOUR SUBMISSION</Text>
          <View style={[styles.sectionHeaderLine, { backgroundColor: colors.border }]} />
          <TouchableOpacity
            onPress={refreshQuote}
            disabled={refreshing || loadingQuote}
            style={[styles.smallRefreshBtn, { borderColor: colors.border, backgroundColor: isLight ? '#FFFFFF' : '#1E293B', opacity: refreshing || loadingQuote ? 0.6 : 1 }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {refreshing ? <ActivityIndicator size="small" color="#EAB308" /> : <RefreshCw size={16} color="#EAB308" />}
          </TouchableOpacity>
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

        {/* Action Button - enable only when admin quote amount filled */}
        <TouchableOpacity
          disabled={!isNextEnabled}
          style={[styles.nextButton, { backgroundColor: isNextEnabled ? colors.buttonBackground : colors.border, opacity: isNextEnabled ? 1 : 0.6 }]}
          activeOpacity={0.85}
          onPress={isNextEnabled ? () => (onNextPress ? onNextPress(effectiveQuote) : onMessagePress?.(effectiveQuote)) : undefined}
        >
          {loadingQuote ? <ActivityIndicator size="small" color={colors.muted} style={{ marginRight: 8 }} /> : null}
          <Text style={[styles.nextButtonText, !isNextEnabled && { color: colors.muted }]}>{loadingQuote ? 'Loading quote...' : isNextEnabled ? 'View Quote' : 'Awaiting Quote'}</Text>
          {!loadingQuote && <Text style={[styles.nextArrow, !isNextEnabled && { color: colors.muted }]}>→</Text>}
        </TouchableOpacity>
        {!isNextEnabled && !loadingQuote && (
          <Text style={[styles.footerText, { color: colors.muted, marginTop: 8 }]}>
            Admin will add quote amount soon
          </Text>
        )}


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
  smallRefreshBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: s(8),
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
