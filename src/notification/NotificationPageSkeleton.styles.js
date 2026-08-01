import { StyleSheet } from 'react-native';
const styles = StyleSheet.create({
    filterRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 24,
    },
    filterPill: {
        width: 86,
        height: 32,
        borderRadius: 10,
    },
    listCard: {
        borderWidth: 1,
        borderRadius: 18,
        flexGrow: 1,
        marginTop: 16,
        minHeight: 620,
        paddingHorizontal: 14,
    },
    notificationRow: {
        flexDirection: 'row',
        gap: 14,
        borderBottomWidth: 1,
        paddingVertical: 16,
    },
    iconSkeleton: {
        width: 44,
        height: 44,
        borderRadius: 13,
    },
    copySkeleton: {
        flex: 1,
        gap: 9,
    },
    titleSkeleton: {
        width: '62%',
        height: 16,
        borderRadius: 8,
    },
    messageSkeleton: {
        width: '92%',
        height: 13,
        borderRadius: 7,
    },
    timeSkeleton: {
        width: '34%',
        height: 12,
        borderRadius: 6,
    },
});
export default styles;
