import { Pressable, StyleSheet, Text, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { s } from '../../../../theme/responsive';

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

function ComplianceCard({ item, companyId, colors, isLight, isPaymentLocked = false, onLockedPress, onOpenComplianceHistory }) {
    const tone = getToneStyles(item.tone, colors);

    const handlePress = () => {
        // Payment pending ho to cards locked - tap par "Pay now" toast.
        if (isPaymentLocked) {
            onLockedPress?.();
            return;
        }
        onOpenComplianceHistory?.({
            id: item.id,
            title: item.title,
            subtitle: item.subtitle,
            status: item.tag,
            date: item.dueDate,
            details: item.details ?? [],
            companyId,
            price: item.price,
            years: item.years,
        });
    };

    return (
        <Pressable onPress={handlePress} style={styles.tileWrapper}>
            <View style={[styles.complianceTile, { backgroundColor: isLight ? colors.cardHighlight : colors.cardElevated, borderWidth: 1, borderColor: colors.border }]}>
                <View style={styles.complianceTileHeader}>
                    <View style={[styles.statusIcon, tone.icon]}>
                        <FontAwesome name={item.icon} size={18} style={tone.iconText} />
                    </View>
                    <View style={styles.headerBadges}>
                        {isPaymentLocked ? (
                            <View style={[styles.lockBadge, { backgroundColor: isLight ? 'rgba(6,8,14,0.08)' : 'rgba(255,255,255,0.12)' }]}>
                                <FontAwesome name="lock" size={13} color={colors.text} />
                            </View>
                        ) : null}
                        <Text style={[styles.tileNameTop, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                        <View style={styles.tag}>
                            <Text style={[
                                styles.tagText,
                                item.daysTone === 'ok' ? styles.daysBadgeOkText : styles.daysBadgeSoonText,
                            ]}>
                                {item.daysBadge}
                            </Text>
                        </View>
                    </View>
                </View>
                <View style={styles.statusPill}>
                    <Text style={[styles.statusPillText, tone.tagText]}>{item.tag}</Text>
                </View>
                <Text style={[styles.tileDueDateText, { color: colors.muted }]}>
                    {item.title === 'Agent & Address' ? 'Renew Date' : 'Due Date'}: <Text style={[styles.tileDueDateValue, { color: colors.muted }]}>{item.dueDate}</Text>
                </Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    tileWrapper: {
        position: 'relative',
        flexBasis: '48%',
        flexGrow: 1,
        maxWidth: '48%',
        minWidth: '48%',
    },
    lockBadge: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        paddingHorizontal: s(5),
        paddingVertical: 3,
    },
    complianceTile: {
        borderRadius: 12,
        paddingHorizontal: s(10),
        paddingVertical: 11,
    },
    complianceTileHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    statusIcon: {
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
    },
    tag: {
        borderRadius: 20,
        paddingHorizontal: s(8),
        paddingVertical: 3,
    },
    tagText: {
        fontSize: 11,
        fontWeight: '600',
    },
    daysBadgeOkText: {
        color: '#047857',
    },
    daysBadgeSoonText: {
        color: '#B45309',
    },
    headerBadges: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 5,
        marginLeft: s(8),
    },
    tileNameTop: {
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'right',
    },
    statusPill: {
        borderRadius: 20,
        paddingHorizontal: s(8),
        paddingVertical: 3,
        alignSelf: 'flex-start',
    },
    statusPillText: {
        fontSize: 11,
        fontWeight: '600',
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

export default ComplianceCard;
