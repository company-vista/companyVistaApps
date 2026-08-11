import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import { BackButton } from '../../../../components/buttons';
import { useThemeColors } from '../../../../theme/colors';
import { API_BASE_URL } from '../../../../config/api';
import { useAppSelector } from '../../../../store/hooks';
import { font } from '../../../../theme/typography';
function StatBox({ icon, label, value, sub, colors }) {
    return (<View style={[cStatBox, { backgroundColor: colors.surfaceAlt }]}>
      <View style={cStatHeader}>
        <FontAwesome name={icon} size={13} color={colors.muted} style={cStatIcon}/>
        <Text style={[cStatLabel, { color: colors.muted }]}>{label}</Text>
      </View>
      <Text style={[cStatValue, { color: colors.text }]}>{value}</Text>
      {sub ? <Text style={[cStatSub, { color: colors.muted }]}>{sub}</Text> : null}
    </View>);
}
const timelineIcons = {
    'Federal filing': 'file-text-o',
    'Annual filing': 'calendar',
    'Agent renewal': 'refresh',
    'Address renewal': 'home',
};
function TimelineRow({ item, colors }) {
    const overdue = item.status === 'overdue';
    const icon = timelineIcons[item.label] || 'clock-o';
    return (<View style={[cTimelineItem, { backgroundColor: colors.surfaceAlt, borderColor: overdue ? '#e25c6b' : colors.border }]}>
      <View style={[cTimelineIconBox, { backgroundColor: overdue ? 'rgba(226,92,107,0.12)' : 'rgba(230,168,42,0.12)' }]}>
        <FontAwesome name={icon} size={18} color={overdue ? '#e25c6b' : '#e6a82a'}/>
      </View>
      <View style={cTimelineContent}>
        <Text style={[cTimelineLabel, { color: colors.text }]} numberOfLines={1}>{item.label}</Text>
        <Text style={overdue ? [cTimelineDueOverdue, { color: '#e25c6b' }] : [cTimelineDue, { color: colors.muted }]}>
          {item.due}
        </Text>
      </View>
    </View>);
}
function CompanyCard({ company, colors }) {
    return (<View style={[cCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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
        <StatBox icon="files-o" label="DOCS LEFT" value={String(company.docsLeft)} sub={`Used`} colors={colors}/>
        <StatBox icon="clock-o" label="DAYS LEFT" value={String(company.daysLeft)} sub={company.expiryLabel} colors={colors}/>
        <StatBox icon="credit-card" label="PLAN" value={company.plan} colors={colors}/>
      </View>

      <View style={cUsageRow}>
        <Text style={[cUsageLabel, { color: colors.muted }]}>Document usage</Text>
        <Text style={[cUsageValue, { color: colors.muted }]}>{company.usagePercent}%</Text>
      </View>

      <View style={[cTimelineBlock, { backgroundColor: colors.surfaceAlt }]}>
        <Text style={[cTimelineTitle, { color: colors.text }]}>Compliance timeline</Text>
        <View style={cTimelineGrid}>
          {company.timeline.map((item, idx) => (<TimelineRow item={item} key={idx} colors={colors}/>))}
        </View>
      </View>

    </View>);
}
function formatDateSafe(d) {
    if (!d)
        return 'Not set';
    try {
        return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
    catch {
        return d;
    }
}
function toStatus(s) {
    if (!s)
        return null;
    const lower = s.toLowerCase().trim();
    if (lower === 'expired' || lower === 'overdue')
        return 'overdue';
    return null;
}
function buildCompanyData(selected, apiData) {
    if (!selected) {
        return [];
    }
    const data = apiData?.data || {};
    const fed = data.federalTaxFiling || {};
    const annual = data.annualFiling || {};
    const resident = data.resident || {};
    const address = data.Address || {};
    return [
        {
            name: selected.name,
            plan: 'No Plan',
            docsLeft: 0,
            docsUsedOf: 0,
            daysLeft: 0,
            expiryLabel: 'No Active Plan',
            usagePercent: 0,
            timeline: [
                { label: 'Federal filing', due: formatDateSafe(fed.dueDate), status: toStatus(fed.status) },
                { label: 'Annual filing', due: formatDateSafe(annual.dueDate), status: toStatus(annual.status) },
                { label: 'Agent renewal', due: formatDateSafe(resident.dueDate), status: toStatus(resident.status) },
                { label: 'Address renewal', due: formatDateSafe(address.dueDate), status: toStatus(address.status) },
            ],
        },
    ];
}
export default function SubscriptionOverview({ onBackPress, selectedCompany }) {
    const colors = useThemeColors();
    const safeAreaInsets = useSafeAreaInsets();
    const isLight = colors.mode === 'light';
    const token = useAppSelector(state => state.auth.token);
    const userName = useAppSelector(state => state.auth.user?.name || '');
    const [complianceData, setComplianceData] = useState(null);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const fetchCompliance = async () => {
            const companyId = selectedCompany?.id;
            if (!token || !companyId) {
                setComplianceData(null);
                return;
            }
            setLoading(true);
            try {
                const res = await axios.get(`${API_BASE_URL}/api/company-compliance/${companyId}`, {
                    headers: { Authorization: `Bearer ${token}`, 'x-auth-token': token },
                });
                setComplianceData(res?.data);
            }
            catch (err) {
                console.error('Error fetching compliance:', err);
                setComplianceData(null);
            }
            finally {
                setLoading(false);
            }
        };
        fetchCompliance();
    }, [selectedCompany?.id, token]);
    const companies = buildCompanyData(selectedCompany, complianceData);
    // console.log(companies);
    const summary = {
        activeCompanies: companies.length,
        documentsLeft: 0,
        expiredPlans: 0,
    };
    return (<View style={{ flex: 1 }}>
      <View style={[styles.headerArea, { backgroundColor: isLight ? '#ffffff' : undefined, paddingTop: safeAreaInsets.top + 12 }]}>
        <View style={styles.header}>
          <BackButton onPress={onBackPress}/>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Subscription</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[cEyebrow, { backgroundColor: 'rgba(230,168,42,0.12)', borderColor: '#6b5320' }]}>
          <Text style={cEyebrowText}>MY SUBSCRIPTIONS</Text>
        </View>

      <Text style={[cTitle, { color: colors.text }]}>
        Subscription Overview for{' '}
        <Text style={cTitleAccent}>{userName || 'username not provide'}</Text>
      </Text>

      <Text style={[cSubtitle, { color: colors.muted }]}>
        Manage Plans, Balances & Renewals
      </Text>

      <View style={cSummaryRow}>
        <View style={[cSummaryBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[cSummaryLabel, { color: colors.text }]}>ACTIVE COMPANIES</Text>
          <Text style={[cSummaryValue, { color: '#3fbf7f' }]}>
            {summary.activeCompanies}
          </Text>
        </View>
        <View style={[cSummaryBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[cSummaryLabel, { color: colors.text }]}>REMAINING DOCUMENTS</Text>
          <Text style={[cSummaryValue, { color: '#e6a82a' }]}>
            {summary.documentsLeft}
          </Text>
        </View>
        <View style={[cSummaryBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[cSummaryLabel, { color: colors.text }]}>EXPIRED SUBSCRIPTIONS</Text>
          <Text style={[cSummaryValue, { color: '#e25c6b' }]}>
            {summary.expiredPlans}
          </Text>
        </View>
      </View>

      {loading ? (<ActivityIndicator size="large" color={colors.muted} style={{ marginTop: 40 }}/>) : (<View style={cCardsList}>
          {companies.map((company) => (<CompanyCard company={company} key={company.name} colors={colors}/>))}
        </View>)}
    </ScrollView>
    </View>);
}
const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        gap: 12,
    },
    headerArea: {
        paddingBottom: 12,
        marginBottom: 0,
    },
    headerTitle: {
        fontSize: font.title,
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
    marginTop: 8,
    marginLeft: 6
};
const cEyebrowText = {
    color: '#e6a82a',
    fontSize: font.sm,
    fontWeight: '500',
    letterSpacing: 0.5,
};
const cTitle = {
    fontSize: font.title,
    fontWeight: '500',
    lineHeight: 22,
    marginBottom: 6,
    marginLeft: 6
};
const cTitleAccent = {
    color: '#e6a82a',
    fontStyle: 'italic',
};
const cSubtitle = {
    fontSize: font.base,
    lineHeight: 18,
    marginBottom: 24,
    marginLeft: 6
};
const cSummaryRow = {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
};
const cSummaryBox = {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    // alignItems: 'center',
};
const cSummaryLabel = {
    fontSize: font.xs,
    letterSpacing: 0.3,
    marginBottom: 4,
    // textAlign: 'center',
};
const cSummaryValue = {
    fontSize: font.hero,
    fontWeight: '500',
    // textAlign: 'center',
};
const cCardsList = {
    gap: 14,
};
const cCard = {
    borderWidth: 0.5,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
};
const cCardHeader = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
};
const cCardHeaderLeft = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
};
const cIconBox = {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
};
const cIconGlyph = {
    fontSize: font.xl,
};
const cCompanyName = {
    fontSize: font.xxl,
    fontWeight: '500',
};
const cCompanyPlan = {
    fontSize: font.md,
};
const cExpiredBadge = {
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 3,
};
const cExpiredBadgeText = {
    color: '#e25c6b',
    fontSize: font.base,
    fontWeight: '500',
};
const cStatsRow = {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
};
const cStatBox = {
    flex: 1,
    borderRadius: 8,
    padding: 8,
};
const cStatHeader = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
};
const cStatIcon = {
};
const cStatLabel = {
    fontSize: font.base,
    letterSpacing: 0.2,
};
const cStatValue = {
    fontSize: font.title,
    fontWeight: '500',
};
const cStatSub = {
    fontSize: font.base,
    marginTop: 2,
};
const cUsageRow = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
};
const cUsageLabel = {
    fontSize: font.base,
};
const cUsageValue = {
    fontSize: font.base,
};
const cTimelineBlock = {
    borderRadius: 12,
    padding: 14,
};
const cTimelineTitle = {
    fontSize: font.lg,
    fontWeight: '600',
    marginBottom: 10,
};
const cTimelineGrid = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
};
const cTimelineItem = {
    width: '48%',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
};
const cTimelineIconBox = {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
};
const cTimelineContent = {
    flex: 1,
    alignItems: 'flex-start',
};
const cTimelineLabel = {
    fontSize: font.md,
    fontWeight: '500',
    marginBottom: 2,
    textAlign: 'left',
};
const cTimelineDue = {
    fontSize: font.sm,
    textAlign: 'left',
};
const cTimelineDueOverdue = {
    fontSize: font.sm,
    textAlign: 'left',
    fontWeight: '600',
};
