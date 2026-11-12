import { font } from '../../../../theme/typography';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { s } from '../../../../theme/responsive';
import { themePalette, makeThemeStyles } from '../../../../theme/colors';

function getToneStyles(tone, colors) {
    const isDark = colors.mode === 'dark';
    const toneStyles = {
        amber: {
            icon: {
                backgroundColor: isDark ? themePalette.hex_2f2411 : themePalette.hex_fef3c7,
            },
            iconText: {
                color: isDark ? themePalette.hex_f9c56a : themePalette.hex_b45309,
            },
            tag: {
                backgroundColor: isDark ? themePalette.hex_3a2a15 : themePalette.hex_fef3c7,
            },
            tagText: {
                color: isDark ? themePalette.hex_f7dca7 : themePalette.hex_b45309,
            },
        },
        green: {
            icon: {
                backgroundColor: isDark ? themePalette.hex_15352a : themePalette.hex_d1fae5,
            },
            iconText: {
                color: isDark ? themePalette.hex_7dd3a8 : themePalette.hex_047857,
            },
            tag: {
                backgroundColor: isDark ? themePalette.hex_1c4334 : themePalette.hex_d1fae5,
            },
            tagText: {
                color: isDark ? themePalette.hex_a7f3d0 : themePalette.hex_047857,
            },
        },
        red: {
            icon: {
                backgroundColor: isDark ? themePalette.hex_3d1717 : themePalette.hex_fee2e2,
            },
            iconText: {
                color: isDark ? themePalette.hex_f8a5a5 : themePalette.hex_dc2626,
            },
            tag: {
                backgroundColor: isDark ? themePalette.hex_4c1d1d : themePalette.hex_fee2e2,
            },
            tagText: {
                color: isDark ? themePalette.hex_f6c1c1 : themePalette.hex_dc2626,
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
                        <FontAwesome name={item.icon} size={20} style={tone.iconText} />
                    </View>
                    <View style={styles.headerBadges}>
                        {isPaymentLocked ? (
                            <View style={[styles.lockBadge, { backgroundColor: isLight ? themePalette.rgba_6_8_14_0_08 : themePalette.rgba_255_255_255_0_12 }]}>
                                <FontAwesome name="lock" size={13} color={colors.text} />
                            </View>
                        ) : null}
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
                <View style={styles.complianceCopy}>
                    <Text style={[styles.tileNameTop, { color: colors.text }]} numberOfLines={2}>{item.title}</Text>
                    <Text style={[styles.tileSubtitle, { color: colors.muted }]} numberOfLines={1}>{item.subtitle}</Text>
                </View>
                <View style={styles.statusPill}>
                    <Text style={[styles.statusPillText, tone.tagText]}>{item.tag}</Text>
                </View>
                <View>
                    <Text style={[styles.tileDueDateLabel, { color: colors.muted }]}>
                        {item.title === 'Agent & Address' ? 'Renewal date' : 'Due date'}
                    </Text>
                    <Text style={[styles.tileDueDateValue, { color: colors.text }]} numberOfLines={1}>{item.dueDate}</Text>
                </View>
            </View>
        </Pressable>
    );
}

const styles = makeThemeStyles(() => StyleSheet.create({
    tileWrapper: {
        position: 'relative',
        width: '48%',
        marginBottom: s(8),
    },
    lockBadge: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        paddingHorizontal: s(5),
        paddingVertical: 3,
    },
    complianceTile: {
        height: s(165),
        borderRadius: 12,
        paddingHorizontal: s(14),
        paddingVertical: s(12),
        justifyContent: 'space-between',
    },
    complianceTileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    statusIcon: {
        width: s(34),
        height: s(34),
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
        fontSize: font.small,
        fontWeight: '600',
    },
    daysBadgeOkText: {
        color: themePalette.hex_047857,
    },
    daysBadgeSoonText: {
        color: themePalette.hex_b45309,
    },
    headerBadges: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: s(6),
    },
    complianceCopy: {
        gap: s(2),
    },
    tileNameTop: {
        fontSize: font.base,
        fontWeight: '600',
    },
    tileSubtitle: {
        fontSize: font.small,
        lineHeight: s(15),
    },
    statusPill: {
        borderRadius: 20,
        paddingHorizontal: s(8),
        paddingVertical: 3,
        alignSelf: 'flex-start',
    },
    statusPillText: {
        fontSize: font.small,
        fontWeight: '600',
    },
    tileDueDateLabel: {
        fontSize: font.small,
    },
    tileDueDateValue: {
        fontSize: font.base,
        fontWeight: '600',
    },
}));

export default ComplianceCard;
