import { useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useThemeColors } from '../../../../theme/colors';
import { complianceItems, normalizeText } from '../../hooks/useCompanyCompliance';
import { font } from '../../../../theme/typography';
import ComplianceCard from './ComplianceCard';
function formatStatus(value) {
    const status = normalizeText(value);
    if (!status) {
        return 'N/A';
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
}
function getStatusTone(value) {
    const status = normalizeText(value);
    if (status === 'active' || status === 'completed') {
        return 'green';
    }
    if (status.includes('overdue') || status === 'expired') {
        return 'red';
    }
    return 'amber';
}
function getDaysRemaining(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return null;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((date.getTime() - today.getTime()) / 86400000);
}
function ComplianceStatusSection({ companyId, dueDatesByTitle = {}, rawDueDatesByTitle = {}, statusesByTitle = {}, isLoadingDueDates = false, onOpenComplianceHistory, isPaymentLocked = false, onLockedPress }) {
    const colors = useThemeColors();
    const isLight = colors.mode === 'light';
    const complianceCards = useMemo(() => complianceItems.map(item => {
        const days = getDaysRemaining(rawDueDatesByTitle[item.title]);
        const status = normalizeText(statusesByTitle[item.title]);
        const isCompleted = status === 'completed';
        return {
            ...item,
            dueDate: dueDatesByTitle[item.title] ?? (isLoadingDueDates ? 'Loading...' : 'N/A'),
            tag: isLoadingDueDates
                ? 'Loading...'
                : formatStatus(statusesByTitle[item.title]),
            tone: getStatusTone(statusesByTitle[item.title]),
            daysBadge: isLoadingDueDates
                ? 'Loading...'
                : isCompleted
                    ? 'Completed'
                    : days === null
                        ? 'N/A'
                        : days < 0
                            ? 'Overdue'
                            : `${days} days`,
            daysTone: isCompleted || (days !== null && days > 30) ? 'ok' : 'soon',
        };
    }), [dueDatesByTitle, rawDueDatesByTitle, isLoadingDueDates, statusesByTitle]);
    return (<View style={styles.section}>
        <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Compliance Status
            </Text>
        </View>
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.complianceRow}
        >
            {complianceCards.map(item => (
                <ComplianceCard
                    key={item.title}
                    item={item}
                    companyId={companyId}
                    colors={colors}
                    isLight={isLight}
                    isPaymentLocked={isPaymentLocked}
                    onLockedPress={onLockedPress}
                    onOpenComplianceHistory={onOpenComplianceHistory}
                />
            ))}
        </ScrollView>
    </View>);
}
const styles = StyleSheet.create({
    section: {
        marginTop: 14,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 9,
    },
    sectionTitle: {
        color: '#2C2C2A',
        fontSize: font.xl,
        fontWeight: '500',
    },
    sectionLink: {
        color: '#D85A30',
        fontSize: font.sm,
        fontWeight: '500',
    },
    complianceRow: {
        flexDirection: 'row',
        gap: 8,
        paddingRight: 16,
    },
});
export default ComplianceStatusSection;
