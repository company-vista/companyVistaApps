import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '../../../../theme/colors';
import { font } from '../../../../theme/typography';
import { complianceItems } from '../../hooks/useCompanyCompliance';
function getDueDateParts(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return null;
    }
    return {
        day: date.toLocaleDateString('en-IN', { day: '2-digit' }),
        month: date.toLocaleDateString('en-IN', { month: 'short' }),
    };
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
function UpcomingDeadlinesSection({ rawDueDatesByTitle, isLoading = false, }) {
    const colors = useThemeColors();
    const isLight = colors.mode === 'light';
    const deadlineItems = useMemo(() => complianceItems.map(item => {
        const dueDate = rawDueDatesByTitle[item.title];
        const parts = getDueDateParts(dueDate);
        const days = getDaysRemaining(dueDate);
        const badge = isLoading
            ? 'Loading...'
            : days === null
                ? 'Not available'
                : days < 0
                    ? 'Overdue'
                    : `${days} days`;
        return {
            title: item.title,
            day: parts?.day ?? '--',
            month: parts?.month ?? '--',
            badge,
            tone: days !== null && days > 30 ? 'ok' : 'soon',
        };
    }), [rawDueDatesByTitle, isLoading]);
    return (<View style={[styles.section, styles.deadlineSection]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Upcoming Deadlines
        </Text>
      </View>
      <View style={styles.deadlineList}>
        {deadlineItems.map((item, index) => (<View key={item.title} style={[styles.deadlineRow, { backgroundColor: isLight ? '#ffffff' : 'rgba(255,255,255,0.07)', borderColor: index === 0 ? 'rgba(59, 130, 246, 0.5)' : index === 1 ? 'rgba(139, 92, 246, 0.5)' : 'rgba(245, 158, 11, 0.5)' }]}>
            <View style={styles.deadlineDate}>
              <Text style={[styles.deadlineDueLabel, { color: colors.muted }]}>Due</Text>
              <Text style={[styles.deadlineDay, { color: colors.danger }]}>{item.day}</Text>
              <Text style={[styles.deadlineMonth, { color: colors.muted }]}>{item.month}</Text>
            </View>
            <View style={[styles.deadlineDivider, { backgroundColor: colors.border }]}/>
            <View style={styles.deadlineCopy}>
              <Text style={[styles.deadlineTitle, { color: colors.text }]}>{item.title}</Text>
              {/* <Text style={[styles.deadlineSubtitle, { color: colors.muted }]}>{item.subtitle}</Text> */}
            </View>
            <View style={[
                styles.deadlineBadge,
                item.tone === 'soon' ? styles.badgeSoon : styles.badgeOk,
            ]}>
              <Text style={[
                styles.deadlineBadgeText,
                item.tone === 'soon'
                    ? styles.badgeSoonText
                    : styles.badgeOkText,
            ]}>
                {item.badge}
              </Text>
            </View>
          </View>))}
      </View>
    </View>);
}
const styles = StyleSheet.create({
    section: {
        marginTop: 14,
    },
    deadlineSection: {
        paddingBottom: 16,
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
    deadlineList: {
        gap: 7,
    },
    deadlineRow: {
        minHeight: 58,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 13,
        paddingVertical: 10,
    },
    deadlineDate: {
        width: 36,
        alignItems: 'center',
    },
    deadlineDueLabel: {
        fontSize: font.xs,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    deadlineDay: {
        fontSize: font.xxl,
        fontWeight: '500',
        lineHeight: 18,
    },
    deadlineMonth: {
        fontSize: font.sm,
    },
    deadlineDivider: {
        width: 1,
        height: 32,
    },
    deadlineCopy: {
        flex: 1,
    },
    deadlineTitle: {
        fontSize: font.lg,
        fontWeight: '400',
    },
    deadlineSubtitle: {
        fontSize: font.sm,
        marginTop: 1,
    },
    deadlineBadge: {
        borderRadius: 20,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    deadlineBadgeText: {
        fontSize: font.sm,
        fontWeight: '600',
    },
    badgeSoon: {
        backgroundColor: '#FEF3C7',
    },
    badgeSoonText: {
        color: '#B45309',
    },
    badgeOk: {
        backgroundColor: '#D1FAE5',
    },
    badgeOkText: {
        color: '#047857',
    },
});
export default UpcomingDeadlinesSection;
