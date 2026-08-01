import { StyleSheet } from 'react-native';
const styles = StyleSheet.create({
    filterRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 22,
    },
    filterChip: {
        minHeight: 40,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        backgroundColor: '#ffffff',
        paddingHorizontal: 18,
        gap: 1,
    },
    activeFilterChip: {
        borderColor: '#bfdbfe',
    },
    activeFilterText: {
        color: '#2563eb',
        fontSize: 12,
        fontWeight: '800',
    },
    filterText: {
        color: '#111827',
        fontSize: 12,
        fontWeight: '600',
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#22c55e',
    },
    activeStatusDot: {
        backgroundColor: '#22c55e',
    },
});
export default styles;
