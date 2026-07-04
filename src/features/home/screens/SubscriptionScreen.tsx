import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import { BackButton } from '../../../components/buttons';
import { useThemeColors } from '../../../theme/colors';
import type { CompanyCardItem } from './quickAccess/CompanyCard';

type TimelineStatus = 'overdue' | null;

interface TimelineItem {
  label: string;
  due: string;
  status: TimelineStatus;
}

interface Company {
  name: string;
  plan: string;
  docsLeft: number;
  docsUsedOf: number;
  daysLeft: number;
  expiryLabel: string;
  usagePercent: number;
  timeline: TimelineItem[];
}

function StatBox({ icon, label, value, sub, colors }: { icon: string; label: string; value: string; sub?: string; colors: ReturnType<typeof useThemeColors> }) {
  return (
    <View style={[cStatBox, { backgroundColor: colors.surfaceAlt }]}>
      <FontAwesome name={icon} size={16} color={colors.muted} style={cStatIcon} />
      <Text style={[cStatLabel, { color: colors.muted }]}>{label}</Text>
      <Text style={[cStatValue, { color: colors.text }]}>{value}</Text>
      {sub ? <Text style={[cStatSub, { color: colors.muted }]}>{sub}</Text> : null}
    </View>
  );
}

const timelineIcons: Record<string, string> = {
  'Federal filing': 'file-text-o',
  'Annual filing': 'calendar',
  'Agent renewal': 'refresh',
  'Address renewal': 'home',
};

function TimelineRow({ item, colors }: { item: TimelineItem; colors: ReturnType<typeof useThemeColors> }) {
  const overdue = item.status === 'overdue';
  const icon = timelineIcons[item.label] || 'clock-o';
  return (
    <View style={[cTimelineItem, { backgroundColor: colors.surfaceAlt, borderColor: overdue ? '#e25c6b' : colors.border }]}>
      <View style={[cTimelineIconBox, { backgroundColor: overdue ? 'rgba(226,92,107,0.12)' : 'rgba(230,168,42,0.12)' }]}>
        <FontAwesome name={icon} size={14} color={overdue ? '#e25c6b' : '#e6a82a'} />
      </View>
      <View style={cTimelineContent}>
        <Text style={[cTimelineLabel, { color: colors.text }]} numberOfLines={1}>{item.label}</Text>
        <Text style={overdue ? [cTimelineDueOverdue, { color: '#e25c6b' }] : [cTimelineDue, { color: colors.muted }]}>
          {item.due}
        </Text>
      </View>
    </View>
  );
}

function CompanyCard({ company, colors }: { company: Company; colors: ReturnType<typeof useThemeColors> }) {
  return (
    <View style={[cCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={cCardHeader}>
        <View style={cCardHeaderLeft}>
          <View style={[cIconBox, { backgroundColor: colors.surfaceAlt }]}>
            <Text style={cIconGlyph}>{'\u{1F3E2}'}</Text>
          </View>
          <View>
            <Text style={[cCompanyName, { color: colors.text }]}>{company.name}</Text>
            <Text style={[cCompanyPlan, { color: colors.muted }]}>{company.plan}</Text>
          </View>
        </View>
        <View style={[cExpiredBadge, { backgroundColor: 'rgba(226,92,107,0.12)' }]}>
          <Text style={cExpiredBadgeText}>Expired</Text>
        </View>
      </View>

      <View style={cStatsRow}>
        <StatBox
          icon="files-o"
          label="DOCS LEFT"
          value={String(company.docsLeft)}
          sub={`Used ${company.docsUsedOf} of ${company.docsUsedOf}`}
          colors={colors}
        />
        <StatBox
          icon="clock-o"
          label="DAYS LEFT"
          value={String(company.daysLeft)}
          sub={company.expiryLabel}
          colors={colors}
        />
        <StatBox icon="credit-card" label="PLAN" value={company.plan} sub="Renew to continue" colors={colors} />
      </View>

      <View style={cUsageRow}>
        <Text style={[cUsageLabel, { color: colors.muted }]}>Document usage</Text>
        <Text style={[cUsageValue, { color: colors.muted }]}>{company.usagePercent}%</Text>
      </View>

      <View style={[cTimelineBlock, { backgroundColor: colors.surfaceAlt }]}>
        <Text style={[cTimelineTitle, { color: colors.text }]}>Compliance timeline</Text>
        <View style={cTimelineGrid}>
          {company.timeline.map((item, idx) => (
            <TimelineRow item={item} key={idx} colors={colors} />
          ))}
        </View>
      </View>

    </View>
  );
}

type SubscriptionOverviewProps = {
  onBackPress?: () => void;
  selectedCompany?: CompanyCardItem | null;
};

function buildCompanyData(selected?: CompanyCardItem | null): Company[] {
  if (!selected) {
    return [];
  }
  return [
    {
      name: selected.name,
      plan: 'No Plan',
      docsLeft: 0,
      docsUsedOf: 0,
      daysLeft: 0,
      expiryLabel: 'No expiry date',
      usagePercent: 0,
      timeline: [
        { label: 'Federal filing', due: 'Not set', status: null },
        { label: 'Annual filing', due: 'Not set', status: null },
        { label: 'Agent renewal', due: 'Not set', status: null },
        { label: 'Address renewal', due: 'Not set', status: null },
      ],
    },
  ];
}

export default function SubscriptionOverview({ onBackPress, selectedCompany }: SubscriptionOverviewProps) {
  const colors = useThemeColors();
  const companies = buildCompanyData(selectedCompany);

  const summary = {
    activeCompanies: companies.length,
    documentsLeft: 0,
    expiredPlans: 0,
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.header}>
        <BackButton onPress={onBackPress} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>Subscription</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[cEyebrow, { backgroundColor: 'rgba(230,168,42,0.12)', borderColor: '#6b5320' }]}>
          <Text style={cEyebrowText}>ACTIVE SERVICES</Text>
        </View>

      <Text style={[cTitle, { color: colors.text }]}>
        Subscription overview for{' '}
        <Text style={cTitleAccent}>{selectedCompany?.name || 'subham kumarjha'}</Text>
      </Text>

      <Text style={[cSubtitle, { color: colors.muted }]}>
        See each company's active plan, remaining document balance, and
        renewal status in one place.
      </Text>

      <View style={cSummaryRow}>
        <View style={[cSummaryBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[cSummaryLabel, { color: colors.text }]}>ACTIVE COMPANIES</Text>
          <Text style={[cSummaryValue, { color: '#3fbf7f' }]}>
            {summary.activeCompanies}
          </Text>
        </View>
        <View style={[cSummaryBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[cSummaryLabel, { color: colors.text }]}>DOCUMENTS LEFT</Text>
          <Text style={[cSummaryValue, { color: '#e6a82a' }]}>
            {summary.documentsLeft}
          </Text>
        </View>
        <View style={[cSummaryBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[cSummaryLabel, { color: colors.text }]}>EXPIRED PLANS</Text>
          <Text style={[cSummaryValue, { color: '#e25c6b' }]}>
            {summary.expiredPlans}
          </Text>
        </View>
      </View>

      <View style={cCardsList}>
        {companies.map((company) => (
          <CompanyCard company={company} key={company.name} colors={colors} />
        ))}
      </View>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 40,
    gap: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '500',
  },
  content: {
    padding: 16,
  },
});

const cEyebrow = {
  alignSelf: 'flex-start',
  borderWidth: 0.5,
  borderRadius: 6,
  paddingHorizontal: 8,
  paddingVertical: 3,
  marginBottom: 10,
} as const;

const cEyebrowText = {
  color: '#e6a82a',
  fontSize: 10,
  fontWeight: '500',
  letterSpacing: 0.5,
} as const;

const cTitle = {
  fontSize: 17,
  fontWeight: '500',
  lineHeight: 22,
  marginBottom: 6,
} as const;

const cTitleAccent = {
  color: '#e6a82a',
  fontStyle: 'italic',
} as const;

const cSubtitle = {
  fontSize: 12,
  lineHeight: 18,
  marginBottom: 24,
} as const;

const cSummaryRow = {
  flexDirection: 'row',
  gap: 8,
  marginBottom: 16,
} as const;

const cSummaryBox = {
  flex: 1,
  borderRadius: 10,
  borderWidth: 1,
  padding: 10,
} as const;

const cSummaryLabel = {
  fontSize: 9,
  letterSpacing: 0.3,
  marginBottom: 4,
} as const;

const cSummaryValue = {
  fontSize: 20,
  fontWeight: '500',
} as const;

const cCardsList = {
  gap: 14,
} as const;

const cCard = {
  borderWidth: 0.5,
  borderRadius: 14,
  padding: 14,
  marginBottom: 14,
} as const;

const cCardHeader = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: 12,
} as const;

const cCardHeaderLeft = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
} as const;

const cIconBox = {
  width: 32,
  height: 32,
  borderRadius: 8,
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 8,
} as const;

const cIconGlyph = {
  fontSize: 15,
} as const;

const cCompanyName = {
  fontSize: 16,
  fontWeight: '500',
} as const;

const cCompanyPlan = {
  fontSize: 13,
} as const;

const cExpiredBadge = {
  borderRadius: 12,
  paddingHorizontal: 9,
  paddingVertical: 3,
} as const;

const cExpiredBadgeText = {
  color: '#e25c6b',
  fontSize: 12,
  fontWeight: '500',
} as const;

const cStatsRow = {
  flexDirection: 'row',
  gap: 6,
  marginBottom: 6,
} as const;

const cStatBox = {
  flex: 1,
  borderRadius: 8,
  padding: 8,
} as const;

const cStatIcon = {
  marginBottom: 6,
} as const;

const cStatLabel = {
  fontSize: 12,
  marginBottom: 3,
  letterSpacing: 0.2,
} as const;

const cStatValue = {
  fontSize: 17,
  fontWeight: '500',
} as const;

const cStatSub = {
  fontSize: 12,
  marginTop: 2,
} as const;

const cUsageRow = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 12,
} as const;

const cUsageLabel = {
  fontSize: 12,
} as const;

const cUsageValue = {
  fontSize: 12,
} as const;

const cTimelineBlock = {
  borderRadius: 12,
  padding: 14,
} as const;

const cTimelineTitle = {
  fontSize: 14,
  fontWeight: '600',
  marginBottom: 10,
} as const;

const cTimelineGrid = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 8,
} as const;

const cTimelineItem = {
  width: '48%',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
  borderRadius: 10,
  paddingVertical: 10,
  paddingHorizontal: 10,
  borderWidth: 1,
} as const;

const cTimelineIconBox = {
  width: 32,
  height: 32,
  borderRadius: 8,
  alignItems: 'center',
  justifyContent: 'center',
} as const;

const cTimelineContent = {
  flex: 1,
} as const;

const cTimelineLabel = {
  fontSize: 12,
  fontWeight: '500',
  marginBottom: 2,
} as const;

const cTimelineDue = {
  fontSize: 11,
} as const;

const cTimelineDueOverdue = {
  fontSize: 11,
  fontWeight: '600',
} as const;


