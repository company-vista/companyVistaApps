import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import { BackButton } from '../../../../components/buttons';
import { useThemeColors } from '../../../../theme/colors';

const TimelineStep: React.FC<{
  title: string;
  description: string;
  timeframe: string;
  status: 'completed' | 'current' | 'pending';
}> = ({ title, description, timeframe, status }) => {
  const colors = useThemeColors();
  const isCurrent = status === 'current';
  return (
    <View style={styles.stepContainer}>
      <View style={styles.timelineLeft}>
        <View style={[
          styles.timelineDot,
          {
            backgroundColor: isCurrent ? `${colors.primary}30` : colors.surface,
            borderColor: isCurrent ? colors.primary : colors.border,
          },
        ]}>
          {isCurrent && <View style={[styles.dotInner, { backgroundColor: colors.primary }]} />}
        </View>
        <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
      </View>
      <View style={styles.stepContent}>
        <View style={styles.stepHeader}>
          <Text style={[styles.stepTitle, { color: isCurrent ? colors.primary : colors.subtle }]}>{title}</Text>
          <Text style={[styles.stepTime, { color: colors.muted }]}>{timeframe}</Text>
        </View>
        <Text style={[styles.stepDescription, { color: colors.muted }]}>{description}</Text>
      </View>
    </View>
  );
};

type RegistrationTrackingScreenProps = {
  onBackPress: () => void;
};

export default function RegistrationTrackingScreen({ onBackPress }: RegistrationTrackingScreenProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const colors = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: safeAreaInsets.top }]}>
        <BackButton onPress={onBackPress} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>Registration Tracking</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.headerRow}>
            <View style={[styles.iconContainer, { backgroundColor: colors.surfaceAlt }]}>
              <FontAwesome name="file-text-o" color={colors.primary} size={24} />
            </View>
            <View style={styles.headerTextContainer}>
              <View style={styles.badgeRow}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Application Submitted</Text>
                <View style={[styles.badge, { backgroundColor: `${colors.primary}20`, borderColor: colors.primary }]}>
                  <Text style={[styles.badgeText, { color: colors.primary }]}>10%</Text>
                </View>
              </View>
              <Text style={[styles.cardSubtitle, { color: colors.muted }]}>Your application is in queue for review.</Text>
            </View>
          </View>

          <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
            <View style={[styles.progressBarFill, { backgroundColor: colors.primary, width: '10%' }]} />
          </View>
          <Text style={[styles.progressText, { color: colors.subtle }]}>Overall Progress: 10%</Text>

          <Text style={[styles.nextStepText, { color: colors.text }]}>
            <Text style={{ fontWeight: '600', color: colors.muted }}>Next: </Text>
            Under Review (1-2 days)
          </Text>

          <TouchableOpacity style={[styles.editButton, { backgroundColor: colors.surfaceAlt }]}>
            <Text style={[styles.editButtonText, { color: colors.text }]}>Edit Registration Details</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.metaContainer}>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, flex: 1, marginBottom: 12 }]}>
            <Text style={[styles.sectionLabel, { color: colors.subtle }]}>Selected Package</Text>
            <View style={styles.packageHeader}>
              <Text style={[styles.packageMainText, { color: colors.text }]}>Standard</Text>
              <View style={[styles.timeBadge, { backgroundColor: colors.surfaceAlt }]}>
                <Text style={[styles.timeBadgeText, { color: colors.subtle }]}>45-80 Days</Text>
              </View>
            </View>
            <Text style={[styles.metaDetailText, { color: colors.muted }]}>• Normal Filing (1-3 days)</Text>
            <Text style={[styles.metaDetailText, { color: colors.muted }]}>• Standard EIN (45-80 days)</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.subtle }]}>Company Details</Text>

            <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.detailLabel, { color: colors.subtle }]}>COMPANY NAME</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>company Inc.</Text>
            </View>
            <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.detailLabel, { color: colors.subtle }]}>TYPE</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>Sociedad Anónima (S.A.)</Text>
            </View>
            <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.detailLabel, { color: colors.subtle }]}>JURISDICTION</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>Costa Rica</Text>
            </View>
            <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.detailLabel, { color: colors.subtle }]}>SUBMITTED ON</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>Jul 8, 2026</Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.packageHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Registration Process</Text>
            <View style={[styles.timeBadge, { backgroundColor: colors.surfaceAlt }]}>
              <Text style={[styles.timeBadgeText, { color: colors.subtle }]}>Standard - 45-80 Days</Text>
            </View>
          </View>
          <Text style={[styles.cardSubtitle, { color: colors.muted, marginBottom: 20 }]}>
            Standard filing with regular processing times.
          </Text>

          <TimelineStep
            title="Application Submitted"
            description="Your application is in queue for review."
            timeframe="0-1 day"
            status="current"
          />
          <TimelineStep
            title="Under Review"
            description="Our team is carefully reviewing your application."
            timeframe="1-2 days"
            status="pending"
          />
          <TimelineStep
            title="Action Required"
            description="We need additional information from you to proceed."
            timeframe="Varies"
            status="pending"
          />
          <TimelineStep
            title="EIN In Progress"
            description="We are obtaining your EIN. Regular processing takes 45-80 days."
            timeframe="45-80 days"
            status="pending"
          />
        </View>

        <View style={[styles.helpCard, { backgroundColor: colors.primary }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <FontAwesome name="question-circle" color={colors.primaryText} size={20} style={{ marginRight: 8 }} />
            <Text style={[styles.helpTitle, { color: colors.primaryText }]}>Need Help?</Text>
          </View>
          <Text style={[styles.helpSubtitle, { color: colors.primaryText }]}>Have questions? Our support team is ready.</Text>
          <TouchableOpacity style={[styles.helpButton, { backgroundColor: colors.primaryText }]}>
            <Text style={[styles.helpButtonText, { color: colors.primary }]}>Contact Support</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingBottom: 12,
    gap: 8,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    padding: 10,
    borderRadius: 12,
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    marginVertical: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    textAlign: 'right',
    marginBottom: 8,
  },
  nextStepText: {
    fontSize: 13,
    marginBottom: 16,
  },
  editButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  metaContainer: {
    marginBottom: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  packageMainText: {
    fontSize: 18,
    fontWeight: '700',
  },
  timeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  timeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  metaDetailText: {
    fontSize: 13,
    marginVertical: 2,
  },
  detailRow: {
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  stepContainer: {
    flexDirection: 'row',
    minHeight: 70,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 12,
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  dotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    marginVertical: 4,
  },
  stepContent: {
    flex: 1,
    paddingBottom: 16,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  stepTime: {
    fontSize: 12,
  },
  stepDescription: {
    fontSize: 12,
    marginTop: 4,
  },
  helpCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  helpSubtitle: {
    fontSize: 13,
    marginBottom: 16,
  },
  helpButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  helpButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
