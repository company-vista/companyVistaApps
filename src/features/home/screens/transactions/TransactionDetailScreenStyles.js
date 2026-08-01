import { StyleSheet } from "react-native";
import { font } from "../../../../theme/typography";
export const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        gap: 10,
        marginBottom: 12,
    },
    title: {
        fontSize: font.hero,
        fontWeight: '500',
    },
    amountCard: {
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 24,
        alignItems: 'center',
    },
    amountLabel: {
        fontSize: font.base,
        fontWeight: '600',
        marginBottom: 8,
    },
    amountValue: {
        fontSize: font.display,
        fontWeight: '800',
        marginBottom: 12,
    },
    amountBreakdown: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
        width: '100%',
    },
    amountModeCard: {
        flex: 1,
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    amountModeLabel: {
        fontSize: font.sm,
        fontWeight: '600',
        marginBottom: 4,
    },
    amountModeGateway: {
        fontSize: font.xs,
        fontWeight: '700',
        marginBottom: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    amountModeValue: {
        fontSize: font.lg,
        fontWeight: '700',
    },
    statusBadge: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 8,
    },
    statusText: {
        fontSize: font.base,
        fontWeight: '700',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: font.lg,
        fontWeight: '700',
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    detailLabel: {
        fontSize: font.base,
        fontWeight: '600',
        flex: 0.4,
    },
    detailValue: {
        fontSize: font.base,
        fontWeight: '500',
        flex: 0.6,
        textAlign: 'right',
    },
    downloadRow: {
        alignItems: 'flex-end',
        marginBottom: 12,
    },
    downloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#eef2ff',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 8,
    },
    downloadButtonText: {
        color: '#4f46e5',
        fontSize: font.md,
        fontWeight: '600',
    },
});
