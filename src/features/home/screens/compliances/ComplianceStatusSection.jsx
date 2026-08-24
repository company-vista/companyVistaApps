import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useThemeColors } from '../../../../theme/colors';
import { useResponsive } from '../../../../hooks/useResponsive';
import { complianceItems, normalizeText } from '../../hooks/useCompanyCompliance';
import { font } from '../../../../theme/typography';
function getToneStyles(tone, colors) {
    const isDark = colors.mode === 'dark';
    const toneStyles = {
        amber: {
            icon: {
                backgroundColor: isDark ? '#2F2411' : '#FEF3C7',
            },
            iconText: {
                color: isDark ? '#F9C56A' : '#B45309',
            },
            tag: {
                backgroundColor: isDark ? '#3A2A15' : '#FEF3C7',
            },
            tagText: {
                color: isDark ? '#F7DCA7' : '#B45309',
            },
        },
        green: {
            icon: {
                backgroundColor: isDark ? '#15352A' : '#D1FAE5',
            },
            iconText: {
                color: isDark ? '#7DD3A8' : '#047857',
            },
            tag: {
                backgroundColor: isDark ? '#1C4334' : '#D1FAE5',
            },
            tagText: {
                color: isDark ? '#A7F3D0' : '#047857',
            },
        },
        red: {
            icon: {
                backgroundColor: isDark ? '#3D1717' : '#FEE2E2',
            },
            iconText: {
                color: isDark ? '#F8A5A5' : '#DC2626',
            },
            tag: {
                backgroundColor: isDark ? '#4C1D1D' : '#FEE2E2',
            },
            tagText: {
                color: isDark ? '#F6C1C1' : '#DC2626',
            },
        },
    };
    return toneStyles[tone];
}
function formatStatus(value) {
    const status = normalizeText(value);
    if (!status) {
        return 'Not available';
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
function ComplianceStatusSection({ companyId, dueDatesByTitle = {}, rawDueDatesByTitle = {}, statusesByTitle = {}, isLoadingDueDates = false, onOpenComplianceHistory }) {
    const colors = useThemeColors();
    const isLight = colors.mode === 'light';
    const { rs } = useResponsive();
    const complianceCards = useMemo(() => complianceItems.map(item => {
        const days = getDaysRemaining(rawDueDatesByTitle[item.title]);
        return {
            ...item,
            dueDate: dueDatesByTitle[item.title] ?? (isLoadingDueDates ? 'Loading...' : 'Not available'),
            tag: isLoadingDueDates
                ? 'Loading...'
                : formatStatus(statusesByTitle[item.title]),
            tone: getStatusTone(statusesByTitle[item.title]),
            daysBadge: isLoadingDueDates
                ? 'Loading...'
                : days === null
                    ? 'N/A'
                    : days < 0
                        ? 'Overdue'
                        : `${days} days`,
            daysTone: days !== null && days > 30 ? 'ok' : 'soon',
        };
    }), [dueDatesByTitle, rawDueDatesByTitle, isLoadingDueDates, statusesByTitle]);
    const tileWidth = useMemo(() => {
        const GAP = rs(8);
        const PADDING = rs(40);
        return Math.floor((rs(375) - PADDING - GAP) / 2);
    }, [rs]);
    return (<View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Compliance Status
        </Text>
      </View>
      <View style={styles.complianceGrid}>
        {complianceCards.map(item => {
            const tone = getToneStyles(item.tone, colors);
            return (<Pressable key={item.title} onPress={() => onOpenComplianceHistory?.({
                id: item.id,
                title: item.title,
                subtitle: item.subtitle,
                status: item.tag,
                date: item.dueDate,
                details: item.details ?? [],
                companyId,
                price: item.price,
                years: item.years,
            })} style={[styles.tileWrapper, { width: tileWidth }]}>
              <View style={[styles.complianceTile, { backgroundColor: isLight ? colors.cardHighlight : '#0D1B2A', borderWidth: isLight ? 0 : 1, borderColor: 'rgba(255,255,255,0.08)' }]}>
                <View style={styles.complianceTileHeader}>
                  <View style={[styles.statusIcon, tone.icon]}>
                    <FontAwesome name={item.icon} size={18} style={tone.iconText}/>
                  </View>
                  <View style={styles.headerBadges}>
                    <View style={styles.tag}>
                      <Text style={[
                      styles.tagText,
                      item.daysTone === 'ok' ? styles.daysBadgeOkText : styles.daysBadgeSoonText,
                  ]}>
                        {item.daysBadge}
                      </Text>
                    </View>
                    <View style={styles.statusPill}>
                      <Text style={[styles.statusPillText, tone.tagText]}>{item.tag}</Text>
                    </View>
                  </View>
                </View>
                <Text style={[styles.tileName, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.tileDueDateText, { color: colors.muted }]}>
                  {item.title === 'Agent & Address' ? 'Renew Date' : 'Due Date'}: <Text style={[styles.tileDueDateValue, { color: colors.muted }]}>{item.dueDate}</Text>
                </Text>
              </View>
            </Pressable>);
        })}
      </View>
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
    complianceGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tileWrapper: {
        position: 'relative',
    },
    complianceTile: {
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 11,
    },
    complianceTileDark: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    complianceTileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    statusIcon: {
        width: 42,
        height: 42,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
    },
    iconAmber: {
        backgroundColor: '#FEF3C7',
    },
    iconGreen: {
        backgroundColor: '#D1FAE5',
    },
    iconRed: {
        backgroundColor: '#FEE2E2',
    },
    iconTextAmber: {
        color: '#B45309',
    },
    iconTextGreen: {
        color: '#047857',
    },
    iconTextRed: {
        color: '#DC2626',
    },
    tag: {
        borderRadius: 20,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    tagText: {
        fontSize: 11,
        fontWeight: '600',
    },
    daysBadgeOk: {
        backgroundColor: '#D1FAE5',
    },
    daysBadgeOkText: {
        color: '#047857',
    },
    daysBadgeSoon: {
        backgroundColor: '#FEF3C7',
    },
    daysBadgeSoonText: {
        color: '#B45309',
    },
    headerBadges: {
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 5,
    },
    statusPill: {
        borderRadius: 20,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    statusPillText: {
        fontSize: 11,
        fontWeight: '600',
    },
    tagAmber: {
        backgroundColor: '#FEF3C7',
    },
    tagGreen: {
        backgroundColor: '#D1FAE5',
    },
    tagRed: {
        backgroundColor: '#FEE2E2',
    },
    tagTextAmber: {
        color: '#B45309',
    },
    tagTextGreen: {
        color: '#047857',
    },
    tagTextRed: {
        color: '#DC2626',
    },
    tileName: {
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 16,
    },
    tileDueDateText: {
        fontSize: 12,
        marginTop: 5,
    },
    tileDueDateValue: {
        fontSize: 12,
        fontWeight: '600',
    },
});
export default ComplianceStatusSection;
