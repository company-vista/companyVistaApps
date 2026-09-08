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
  Clock,
  Check,
  Headphones,
} from 'lucide-react-native';
import BackButton from '../../../components/buttons/BackButton';
import logoR from '../../../assets/images/logoR.png';
import { useAppSelector } from '../../../store/hooks';

const YourOrderScreen = ({ navigation, route }) => {
  const pendingOrder = useAppSelector(s => s.auth.pendingOrderData);
  // review & confirm page wala new client data ko priority do, selected company nahi
  const src = { ...pendingOrder, ...route?.params };
  const companyName = src?.companyName || 'Meridian Global Ventures GmbH';
  const country = src?.country || src?.selectedState || src?.selectedCountry || 'Germany';
  const structure = src?.selectedStructure || src?.structure || 'GmbH';
  const shareCapital = src?.shareCapital || '€25,000';
  const shareholdersCount = src?.shareholdersCount || (src?.shareholders ? `${src.shareholders} people` : '3 people');
  const orderRef = src?.orderId || src?.invoiceId || src?.referenceId || '#CV-2026-04906';

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
            Your <Text style={styles.italicTitle}>order</Text>
          </Text>
          <Text style={styles.subTitle}>
            {companyName} · {country}
          </Text>
        </View>

        {/* Preparing Your Quote Banner Card */}
        <View style={styles.quoteBanner}>
          <View style={styles.quoteIconBox}>
            <Clock color="#38BDF8" size={20} />
          </View>
          <View style={styles.quoteTextContainer}>
            <Text style={styles.quoteTitle}>Preparing your quote</Text>
            <Text style={styles.quoteDesc}>
              Our German desk is confirming notary and register fees for your structure.
            </Text>
          </View>
        </View>

        {/* Status Subtitle */}
        <View style={styles.timeInfoRow}>
          <View style={styles.blueDot} />
          <Text style={styles.timeInfoText}>
            Typically ready within <Text style={styles.boldBlue}>2 hours</Text> · submitted 47 min ago
          </Text>
        </View>

        {/* Section Header: Your Submission */}
        <View style={styles.dividerRow}>
          <Text style={styles.sectionHeader}>YOUR SUBMISSION</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Details Card */}
        <View style={styles.submissionCard}>
          <View style={styles.cardRow}>
            <Text style={styles.rowLabel}>Company</Text>
            <Text style={[styles.rowValue, styles.goldText]}>
              {companyName}
            </Text>
          </View>

          <View style={styles.cardRow}>
            <Text style={styles.rowLabel}>Jurisdiction</Text>
            <Text style={styles.rowValue}>DE {country}</Text>
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

        {/* Timeline Section */}
        <View style={styles.timelineContainer}>
          <View style={styles.timelineItem}>
            <View style={styles.timelineLeftColumn}>
              <View style={[styles.iconCircle, styles.completedCircle]}>
                <Check color="#10B981" size={14} />
              </View>
              <View style={[styles.timelineLine, styles.activeLine]} />
            </View>
            <View style={styles.timelineRightContent}>
              <Text style={styles.stepTitle}>Details submitted</Text>
              <Text style={styles.stepDesc}>
                Company and founder information received.
              </Text>
              <Text style={styles.timeStampText}>6 Jun, 5:42 PM</Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={styles.timelineLeftColumn}>
              <View style={[styles.iconCircle, styles.inProgressCircle]}>
                <View style={styles.innerDotGold} />
              </View>
            </View>
            <View style={styles.timelineRightContent}>
              <Text style={styles.stepTitle}>Quote being prepared</Text>
              <Text style={styles.stepDesc}>
                Confirming notary, register and translation costs specific to your case.
              </Text>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.messageButton} activeOpacity={0.8} onPress={() => navigation?.navigate?.('Support')}>
          <Headphones color="#38BDF8" size={18} style={{ marginRight: 8 }} />
          <Text style={styles.messageButtonText}>Message our team</Text>
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          We'll notify you by email and push
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default YourOrderScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070C15',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16, marginTop: 34, paddingHorizontal: 16 },
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
  quoteBanner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderColor: '#1E293B',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: 'flex-start',
  },
  quoteIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  quoteTextContainer: {
    flex: 1,
  },
  quoteTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  quoteDesc: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 17,
  },
  timeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  blueDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#38BDF8',
    marginRight: 8,
  },
  timeInfoText: {
    color: '#64748B',
    fontSize: 12,
  },
  boldBlue: {
    color: '#38BDF8',
    fontWeight: '600',
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
  timelineContainer: {
    marginBottom: 20,
    paddingLeft: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineLeftColumn: {
    alignItems: 'center',
    marginRight: 14,
    width: 22,
  },
  iconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
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
  innerDotGold: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EAB308',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
    backgroundColor: '#10B981',
  },
  timelineRightContent: {
    flex: 1,
  },
  stepTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  stepDesc: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  timeStampText: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 4,
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 10,
  },
  messageButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  footerNote: {
    color: '#475569',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
});
