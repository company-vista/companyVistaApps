import { StyleSheet } from "react-native";
import { s } from "../../../../theme/responsive";
import { font } from "../../../../theme/typography";
export const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: s(20),
        paddingBottom: s(12),
        gap: s(16),
        justifyContent: 'space-between',
    },
    title: {
        fontSize: font.hero,
        fontWeight: '500',
    },
    amountCard: {
        padding: s(32),
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: s(24),
        alignItems: 'center',
        marginTop: s(12),
    },
    amountLabel: {
        fontSize: font.base,
        fontWeight: '600',
        marginBottom: s(8),
    },
    amountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: s(8),
    },
    amountValue: {
        fontSize: font.display,
        fontWeight: '800',
        marginBottom: s(12),
    },
    amountBracket: {
        fontSize: font.base,
        fontWeight: '700',
        marginBottom: s(12),
    },
    statusBadge: {
        paddingHorizontal: s(16),
        paddingVertical: s(6),
        borderRadius: 8,
    },
    amountModeTag: {
        position: 'absolute',
        right: s(12),
        bottom: s(12),
        fontSize: font.sm,
        fontWeight: '700',
        paddingHorizontal: s(8),
        paddingVertical: s(3),
        borderRadius: 6,
        overflow: 'hidden',
    },
    statusText: {
        fontSize: font.base,
        fontWeight: '700',
    },
    section: {
        marginBottom: s(24),
    },
    sectionTitle: {
        fontSize: font.lg,
        fontWeight: '700',
        marginBottom: s(12),
    },
    sectionCard: {
        borderRadius: 16,
        borderWidth: 1,
        paddingHorizontal: s(16),
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: s(12),
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
    downloadButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    downloadButtonText: {
        color: '#4f46e5',
        fontSize: font.md,
        fontWeight: '600',
    },
});
