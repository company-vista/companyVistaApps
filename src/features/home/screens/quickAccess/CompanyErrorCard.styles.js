import { StyleSheet } from 'react-native';
const styles = StyleSheet.create({
    emptyCard: {
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        backgroundColor: '#ffffff',
        paddingHorizontal: 18,
        paddingVertical: 28,
    },
    emptyTitle: {
        color: '#111827',
        fontSize: 17,
        fontWeight: '500',
    },
    emptyText: {
        color: '#64748b',
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
        marginTop: 8,
        textAlign: 'center',
    },
    retryButton: {
        minHeight: 38,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        gap: 8,
        marginTop: 16,
        paddingHorizontal: 16,
    },
    retryText: {
        color: '#2563eb',
        fontSize: 12,
        fontWeight: '800',
    },
});
export default styles;
