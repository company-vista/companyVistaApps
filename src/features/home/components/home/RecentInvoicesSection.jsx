import { Pressable, StyleSheet, Text, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useThemeColors, themePalette, makeThemeStyles } from '../../../../theme/colors';
import { font } from '../../../../theme/typography';
import { s } from '../../../../theme/responsive';
import { filterInvoicesForCompany, formatCurrency, mapRecentInvoice, sortInvoicesForDashboard, } from '../../utils/dashboardInvoices';

function formatInvoiceDate(value) {
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

function getStatusStyle(status, colors, isLight) {
    if (status === 'paid') {
        return {
            backgroundColor: isLight ? themePalette.hex_ecfdf5 : themePalette.rgba_52_211_153_0_18,
            color: isLight ? themePalette.hex_16a34a : themePalette.hex_34d399,
        };
    }
    if (status === 'overdue') {
        return {
            backgroundColor: isLight ? themePalette.hex_fee2e2 : themePalette.rgba_239_68_68_0_15,
            color: isLight ? themePalette.hex_dc2626 : themePalette.hex_fca5a5,
        };
    }
    if (status === 'partial' || status === 'pending') {
        return {
            backgroundColor: isLight ? themePalette.hex_fef3c7 : themePalette.rgba_245_158_11_0_12,
            color: isLight ? themePalette.hex_b45309 : themePalette.hex_fbbf24,
        };
    }
    return {
        backgroundColor: isLight ? themePalette.hex_f1f5f9 : themePalette.rgba_255_255_255_0_08,
        color: colors.muted,
    };
}

function RecentInvoicesSection({ selectedCompany, invoices, onViewAllPress, onInvoicePress }) {
    const colors = useThemeColors();
    const isLight = colors.mode === 'light';
    const companyInvoices = sortInvoicesForDashboard(filterInvoicesForCompany(invoices, selectedCompany?.id));
    const recentInvoices = companyInvoices.slice(0, 3).map(mapRecentInvoice);

    return (<View style={styles.container}>
        <View style={styles.header}>
            <View>
                <Text style={[styles.title, { color: colors.text }]}>Recent Invoices</Text>
                <Text style={[styles.subtitle, { color: colors.muted }]}>Latest billing activity</Text>
            </View>
            <Pressable onPress={onViewAllPress} style={styles.viewAllButton} hitSlop={8}>
                <Text style={[styles.viewAllText, { color: colors.accent }]}>View all</Text>
                <FontAwesome name="chevron-right" size={s(9)} color={colors.accent} />
            </Pressable>
        </View>

        {recentInvoices.length === 0 ? (<View style={[styles.emptyState, { backgroundColor: colors.cardHighlight ?? colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.emptyText, { color: colors.muted }]}>No invoices yet</Text>
        </View>) : (<View style={styles.list}>
            {recentInvoices.map(invoice => {
                const statusStyle = getStatusStyle(invoice.status, colors, isLight);
                const isOverdue = invoice.status === 'overdue';
                const hasBalance = invoice.outstanding > 0;
                return (<Pressable key={invoice.id || invoice.invoiceNumber} onPress={() => onInvoicePress?.(invoice.raw)} style={[styles.invoiceCard, { backgroundColor: colors.cardHighlight ?? colors.surface, borderColor: isOverdue ? themePalette.hex_dc2626 : colors.border }]}>
                    <View style={styles.invoiceTop}>
                        <View style={styles.invoiceIdentity}>
                            <View style={[styles.invoiceIcon, { backgroundColor: isLight ? themePalette.hex_dbeafe : themePalette.rgba_59_130_246_0_15 }]}>
                                <FontAwesome name="file-text-o" size={s(12)} color={isLight ? themePalette.hex_2563eb : themePalette.hex_93c5fd} />
                            </View>
                            <View style={styles.invoiceTextBlock}>
                                <Text style={[styles.invoiceNumber, { color: colors.text }]} numberOfLines={1}>{invoice.invoiceNumber}</Text>
                                <Text style={[styles.invoiceService, { color: colors.muted }]} numberOfLines={1}>{invoice.service}</Text>
                            </View>
                        </View>
                        <View style={styles.invoiceAmountBlock}>
                            <Text style={[styles.amount, { color: colors.text }]}>{formatCurrency(invoice.amount, invoice.currency)}</Text>
                            <View style={[styles.statusPill, { backgroundColor: statusStyle.backgroundColor }]}>
                                <Text style={[styles.statusText, { color: statusStyle.color }]}>{invoice.statusText}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.invoiceBottom}>
                        <Text style={[styles.dateText, { color: colors.muted }]} numberOfLines={1}>
                            Issued {formatInvoiceDate(invoice.invoiceDate)} • Due {formatInvoiceDate(invoice.dueDate)}
                        </Text>
                        <Text style={[styles.outstanding, { color: hasBalance ? themePalette.hex_dc2626 : themePalette.hex_16a34a }]} numberOfLines={1}>
                            {hasBalance ? `Balance: ${formatCurrency(invoice.outstanding, invoice.currency)}` : 'Fully Paid'}
                        </Text>
                    </View>
                </Pressable>);
            })}
        </View>)}
    </View>);
}

const styles = makeThemeStyles(() => StyleSheet.create({
    container: {
        marginTop: s(4),
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: s(10),
    },
    title: {
        fontSize: font.lg,
        fontWeight: '700',
    },
    subtitle: {
        marginTop: s(2),
        fontSize: font.xs,
        fontWeight: '500',
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: s(4),
    },
    viewAllText: {
        fontSize: font.sm,
        fontWeight: '700',
    },
    list: {
        gap: s(8),
    },
    invoiceCard: {
        borderWidth: 1,
        borderRadius: s(14),
        paddingHorizontal: s(12),
        paddingVertical: s(10),
    },
    invoiceTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: s(8),
    },
    invoiceIdentity: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: s(9),
        flex: 1,
    },
    invoiceIcon: {
        width: s(32),
        height: s(32),
        borderRadius: s(10),
        alignItems: 'center',
        justifyContent: 'center',
    },
    invoiceTextBlock: {
        flex: 1,
    },
    invoiceNumber: {
        fontSize: font.sm,
        fontWeight: '700',
    },
    invoiceService: {
        marginTop: s(1),
        fontSize: font.xs,
        fontWeight: '500',
    },
    invoiceAmountBlock: {
        alignItems: 'flex-end',
        gap: s(4),
    },
    amount: {
        fontSize: font.sm,
        fontWeight: '700',
    },
    statusPill: {
        borderRadius: s(20),
        paddingHorizontal: s(7),
        paddingVertical: s(2),
    },
    statusText: {
        fontSize: s(9),
        fontWeight: '700',
    },
    invoiceBottom: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: s(8),
        marginTop: s(7),
    },
    dateText: {
        flexShrink: 1,
        fontSize: font.xs,
        fontWeight: '500',
    },
    outstanding: {
        flexShrink: 0,
        fontSize: font.xs,
        fontWeight: '700',
    },
    emptyState: {
        borderWidth: 1,
        borderRadius: s(14),
        paddingVertical: s(18),
        alignItems: 'center',
    },
    emptyText: {
        fontSize: font.sm,
        fontWeight: '500',
    },
}));

export default RecentInvoicesSection;
