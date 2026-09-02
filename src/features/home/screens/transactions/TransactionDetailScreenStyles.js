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
        paddingBottom: 12,
        gap: 16,
        justifyContent: 'space-between',
    },
    title: {
        fontSize: font.hero,
        fontWeight: '500',
    },
    amountCard: {
        padding: 32,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 24,
        alignItems: 'center',
        marginTop: 12,
    },
    amountLabel: {
        fontSize: font.base,
        fontWeight: '600',
        marginBottom: 8,
    },
    amountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    amountValue: {
        fontSize: font.display,
        fontWeight: '800',
        marginBottom: 12,
    },
    amountBracket: {
        fontSize: font.base,
        fontWeight: '700',
        marginBottom: 12,
    },
    statusBadge: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 8,
    },
    amountModeTag: {
        position: 'absolute',
        right: 12,
        bottom: 12,
        fontSize: font.sm,
        fontWeight: '700',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        overflow: 'hidden',
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
    sectionCard: {
        borderRadius: 16,
        borderWidth: 1,
        paddingHorizontal: 16,
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
