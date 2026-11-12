import { Pressable, StyleSheet, Text, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useThemeColors, themePalette, makeThemeStyles } from '../../../../theme/colors';
import { font } from '../../../../theme/typography';
import { s } from '../../../../theme/responsive';
import { computeBillingTotals, filterInvoicesForCompany, formatCurrency, getStringValue, } from '../../utils/dashboardInvoices';

const COMPLIANCE_ITEMS = [
    { key: 'Agent & Address', label: 'Agent & Address' },
    { key: 'State Filing', label: 'State Filing' },
    { key: 'Federal Filing', label: 'Federal Filing' },
];

function formatCompanyDate(value) {
    if (!value) {
        return 'N/A';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return 'N/A';
    }
    return date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

function getComplianceStatusMeta(value) {
    const status = getStringValue(value).toLowerCase();
    if (!status) {
        return { label: 'N/A', tone: 'neutral' };
    }
    if (status.includes('expired') || status.includes('overdue') || status.includes('missing') || status.includes('not filed')) {
        return { label: status.includes('not filed') ? 'Not Filed' : 'Expired', tone: 'red' };
    }
    if (status.includes('expiring') || status.includes('pending') || status.includes('due soon') || status.includes('processing') || status.includes('in progress')) {
        return { label: status.includes('expiring') ? 'Expiring' : 'Pending', tone: 'amber' };
    }
    if (status.includes('active')) {
        return { label: 'Active', tone: 'green' };
    }
    if (status.includes('complete') || status.includes('filed') || status.includes('verified')) {
        return { label: 'Completed', tone: 'green' };
    }
    if (status.includes('managed') || status.includes('client')) {
        return { label: 'Managed', tone: 'green' };
    }
    return { label: getStringValue(value), tone: 'neutral' };
}

function getCompanyStatusMeta(company) {
    const rawStatus = getStringValue(company?.registrationStatus, company?.raw?.registrationStatus).toLowerCase();
    if (rawStatus === 'active' || rawStatus === 'delivered' || rawStatus === 'completed') {
        return { label: 'Active', tone: 'green' };
    }
    if (rawStatus === 'inactive' || rawStatus === 'rejected') {
        return { label: rawStatus === 'rejected' ? 'Rejected' : 'Inactive', tone: 'red' };
    }
    if (rawStatus) {
        return { label: 'In Progress', tone: 'amber' };
    }
    if (getStringValue(company?.status).toLowerCase() === 'active') {
        return { label: 'Active', tone: 'green' };
    }
    return { label: 'In Progress', tone: 'amber' };
}

function DetailRow({ label, value, valueColor, colors }) {
    return (<View style={styles.detailRow}>
        <Text style={[styles.detailLabel, { color: colors.muted }]} numberOfLines={1}>{label}</Text>
        <Text style={[styles.detailValue, { color: valueColor ?? colors.text }]} numberOfLines={1}>{value}</Text>
    </View>);
}

function StatusPill({ label, tone, colors, isLight }) {
    const toneStyles = {
        green: {
            backgroundColor: isLight ? themePalette.hex_ecfdf5 : themePalette.rgba_52_211_153_0_18,
            color: isLight ? themePalette.hex_16a34a : themePalette.hex_34d399,
        },
        amber: {
            backgroundColor: isLight ? themePalette.hex_fef3c7 : themePalette.rgba_245_158_11_0_12,
            color: isLight ? themePalette.hex_b45309 : themePalette.hex_fbbf24,
        },
        red: {
            backgroundColor: isLight ? themePalette.hex_fee2e2 : themePalette.rgba_239_68_68_0_15,
            color: isLight ? themePalette.hex_dc2626 : themePalette.hex_fca5a5,
        },
        neutral: {
            backgroundColor: isLight ? themePalette.hex_f1f5f9 : themePalette.rgba_255_255_255_0_08,
            color: colors.muted,
        },
    };
    const toneStyle = toneStyles[tone] ?? toneStyles.neutral;
    return (<View style={[styles.pill, { backgroundColor: toneStyle.backgroundColor }]}>
        <Text style={[styles.pillText, { color: toneStyle.color }]}>{label}</Text>
    </View>);
}

function OverviewCard({ title, icon, accent, onPress, colors, children }) {
    return (<Pressable onPress={onPress} style={[styles.card, { backgroundColor: colors.cardHighlight ?? colors.surface, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.muted }]}>{title}</Text>
            <View style={[styles.iconWrap, { backgroundColor: accent.background }]}>
                <FontAwesome name={icon} size={s(13)} color={accent.color} />
            </View>
        </View>
        {children}
        <View style={styles.cardLinkRow}>
            <Text style={[styles.cardLink, { color: accent.color }]}>View details</Text>
            <FontAwesome name="chevron-right" size={s(9)} color={accent.color} />
        </View>
    </Pressable>);
}

function DashboardOverviewCards({ selectedCompany, compliance, invoices, onCompanyPress, onCompliancePress, onDocumentsPress, onBillingPress }) {
    const colors = useThemeColors();
    const isLight = colors.mode === 'light';

    const accents = {
        blue: {
            color: isLight ? themePalette.hex_2563eb : themePalette.hex_93c5fd,
            background: isLight ? themePalette.hex_dbeafe : themePalette.rgba_59_130_246_0_15,
        },
        cyan: {
            color: isLight ? themePalette.hex_0891b2 : themePalette.hex_60a5fa,
            background: isLight ? themePalette.hex_e0f2fe : themePalette.rgba_8_145_178_0_1,
        },
        violet: {
            color: isLight ? themePalette.hex_8b5cf6 : themePalette.hex_a78bfa,
            background: isLight ? themePalette.hex_ede9fe : themePalette.rgba_139_92_246_0_15,
        },
        amber: {
            color: isLight ? themePalette.hex_b45309 : themePalette.hex_fbbf24,
            background: isLight ? themePalette.hex_fef3c7 : themePalette.rgba_245_158_11_0_12,
        },
    };

    const companyStatus = getCompanyStatusMeta(selectedCompany);
    const ein = selectedCompany?.ein && selectedCompany.ein !== 'XX-XXXXXXX' ? selectedCompany.ein : 'N/A';
    const registrationNumber = selectedCompany?.registrationNumber || 'N/A';
    const registrationDate = selectedCompany?.registrationDate || selectedCompany?.formationDate || 'N/A';
    const jurisdiction = [selectedCompany?.state, selectedCompany?.countryOfIncorporation]
        .filter(value => value && value !== 'N/A')
        .join(', ') || 'N/A';

    const complianceRows = COMPLIANCE_ITEMS.map(item => ({
        ...item,
        meta: getComplianceStatusMeta(compliance?.statusesByTitle?.[item.key]),
    }));
    const availableComplianceRows = complianceRows.filter(row => row.meta.tone !== 'neutral');
    const allComplianceClear = availableComplianceRows.length === COMPLIANCE_ITEMS.length &&
        availableComplianceRows.every(row => row.meta.tone === 'green');
    const complianceSummary = compliance?.isLoading
        ? { label: 'Loading', tone: 'neutral' }
        : availableComplianceRows.length === 0
            ? { label: 'No Data', tone: 'neutral' }
            : allComplianceClear
                ? { label: 'All Clear', tone: 'green' }
                : { label: 'Attention', tone: 'amber' };

    const subscription = selectedCompany?.subscription ?? selectedCompany?.raw?.subscription ?? {};
    const freeUsed = Number(subscription.freeUsed) || 0;
    const documentsUsed = Number(subscription.documentsUsed) || 0;
    const planQuota = subscription.plan === 'unlimited' ? 'Unlimited' : Number(subscription.plan) || 0;
    const paidRemaining = planQuota === 'Unlimited' ? 'Unlimited' : Math.max(planQuota - documentsUsed, 0);
    const paidUsagePercent = planQuota === 'Unlimited' || !planQuota
        ? 0
        : Math.min(100, Math.round((documentsUsed / planQuota) * 100));

    const companyInvoices = filterInvoicesForCompany(invoices, selectedCompany?.id);
    const billingTotals = computeBillingTotals(companyInvoices);

    return (<View style={styles.grid}>
        <OverviewCard title="Company" icon="building-o" accent={accents.blue} onPress={onCompanyPress} colors={colors}>
            <Text style={[styles.cardValue, { color: colors.text }]} numberOfLines={2}>{selectedCompany?.name ?? 'No company'}</Text>
            <View style={styles.summaryRow}>
                <StatusPill label={companyStatus.label} tone={companyStatus.tone} colors={colors} isLight={isLight} />
                <Text style={[styles.jurisdiction, { color: colors.muted }]} numberOfLines={1}>{jurisdiction}</Text>
            </View>
            <View style={styles.detailList}>
                <DetailRow label="Reg. Date" value={formatCompanyDate(registrationDate)} colors={colors} />
                <DetailRow label="Company ID" value={registrationNumber} colors={colors} />
                <DetailRow label="EIN / Tax ID" value={ein} colors={colors} />
            </View>
        </OverviewCard>

        <OverviewCard title="Compliance" icon="shield" accent={accents.cyan} onPress={onCompliancePress} colors={colors}>
            <Text style={[styles.cardValue, { color: colors.text }]}>{complianceSummary.label}</Text>
            <View style={styles.detailList}>
                {complianceRows.map(row => (<View key={row.key} style={styles.complianceRow}>
                    <Text style={[styles.detailLabel, { color: colors.muted }]} numberOfLines={1}>{row.label}</Text>
                    <StatusPill label={row.meta.label} tone={row.meta.tone} colors={colors} isLight={isLight} />
                </View>))}
            </View>
        </OverviewCard>

        <OverviewCard title="Documents" icon="file-text-o" accent={accents.violet} onPress={onDocumentsPress} colors={colors}>
            <Text style={[styles.cardValue, { color: colors.text }]}>{documentsUsed} docs used</Text>
            <View style={styles.detailList}>
                <DetailRow label="Govt & Free" value={`${freeUsed} used / Unlimited`} colors={colors} />
                <DetailRow label="Paid plan" value={`${documentsUsed} / ${planQuota}`} colors={colors} />
                <DetailRow label="Remaining" value={`${paidRemaining}`} colors={colors} />
            </View>
            <View style={[styles.progressTrack, { backgroundColor: isLight ? themePalette.hex_e2e8f0 : themePalette.rgba_255_255_255_0_08 }]}>
                <View style={[styles.progressFill, { width: `${paidUsagePercent}%`, backgroundColor: accents.violet.color }]} />
            </View>
        </OverviewCard>

        <OverviewCard title="Billing" icon="credit-card" accent={accents.amber} onPress={onBillingPress} colors={colors}>
            <Text style={[styles.cardValue, { color: colors.text }]}>{formatCurrency(billingTotals.totalUSD, 'USD')}</Text>
            <View style={styles.detailList}>
                <DetailRow label="USD paid" value={formatCurrency(billingTotals.paidUSD, 'USD')} colors={colors} />
                <DetailRow label="USD unpaid" value={formatCurrency(billingTotals.unpaidUSD, 'USD')} valueColor={billingTotals.unpaidUSD > 0 ? themePalette.hex_dc2626 : colors.text} colors={colors} />
                <DetailRow label="INR paid" value={formatCurrency(billingTotals.paidINR, 'INR')} colors={colors} />
                <DetailRow label="INR unpaid" value={formatCurrency(billingTotals.unpaidINR, 'INR')} valueColor={billingTotals.unpaidINR > 0 ? themePalette.hex_dc2626 : colors.text} colors={colors} />
            </View>
        </OverviewCard>
    </View>);
}

const styles = makeThemeStyles(() => StyleSheet.create({
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: s(14),
    },
    card: {
        width: '48.5%',
        minHeight: s(188),
        borderRadius: s(16),
        borderWidth: 1,
        paddingHorizontal: s(11),
        paddingTop: s(11),
        paddingBottom: s(10),
        marginBottom: s(10),
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: s(8),
    },
    cardTitle: {
        fontSize: font.xs,
        fontWeight: '700',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    iconWrap: {
        width: s(26),
        height: s(26),
        borderRadius: s(8),
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardValue: {
        fontSize: s(15),
        fontWeight: '700',
        lineHeight: s(19),
        marginBottom: s(5),
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: s(5),
        marginBottom: s(4),
    },
    jurisdiction: {
        flexShrink: 1,
        fontSize: font.xs,
        fontWeight: '500',
    },
    detailList: {
        marginTop: s(4),
        gap: s(4),
        flex: 1,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: s(5),
    },
    detailLabel: {
        flexShrink: 1,
        fontSize: font.xs,
        fontWeight: '500',
    },
    detailValue: {
        flexShrink: 1,
        fontSize: font.xs,
        fontWeight: '700',
        textAlign: 'right',
    },
    complianceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: s(4),
    },
    pill: {
        alignSelf: 'flex-start',
        borderRadius: s(20),
        paddingHorizontal: s(6),
        paddingVertical: s(2),
    },
    pillText: {
        fontSize: s(9),
        fontWeight: '700',
    },
    progressTrack: {
        height: s(4),
        borderRadius: s(4),
        overflow: 'hidden',
        marginTop: s(5),
    },
    progressFill: {
        height: '100%',
        borderRadius: s(4),
    },
    cardLinkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: s(3),
        marginTop: s(7),
    },
    cardLink: {
        fontSize: s(9),
        fontWeight: '700',
    },
}));

export default DashboardOverviewCards;
