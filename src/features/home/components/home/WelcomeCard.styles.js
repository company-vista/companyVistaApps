import { StyleSheet } from 'react-native';
const styles = StyleSheet.create({
    rewardCard: {
        minHeight: 154,
        flexDirection: 'row',
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#fde1b8',
        borderRadius: 12,
        backgroundColor: '#fff1d6',
        marginTop: 28,
        padding: 18,
    },
    rewardText: {
        flex: 1,
    },
    rewardTitle: {
        color: '#111827',
        fontSize: 21,
        fontWeight: '800',
    },
    rewardBrand: {
        color: '#c2410c',
        fontSize: 17,
    },
    rewardSubtitle: {
        color: '#6b7280',
        fontSize: 14,
        lineHeight: 23,
        marginTop: 6,
    },
    enrollButton: {
        alignSelf: 'flex-start',
        borderRadius: 22,
        backgroundColor: '#ea580c',
        marginTop: 14,
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    enrollText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '800',
    },
    coin: {
        width: 86,
        height: 86,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 7,
        borderColor: '#fed7aa',
        borderRadius: 43,
        backgroundColor: '#f59e0b',
        marginLeft: 14,
    },
    coinText: {
        color: '#9a3412',
        fontSize: 22,
        fontWeight: '900',
    },
});
export default styles;
