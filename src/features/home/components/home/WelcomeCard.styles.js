import { StyleSheet } from 'react-native';
import { s } from '../../../../theme/responsive';
const styles = StyleSheet.create({
    rewardCard: {
        minHeight: s(154),
        flexDirection: 'row',
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#fde1b8',
        borderRadius: s(12),
        backgroundColor: '#fff1d6',
        marginTop: s(28),
        padding: s(18),
    },
    rewardText: {
        flex: 1,
    },
    rewardTitle: {
        color: '#111827',
        fontSize: s(21),
        fontWeight: '800',
    },
    rewardBrand: {
        color: '#c2410c',
        fontSize: s(17),
    },
    rewardSubtitle: {
        color: '#6b7280',
        fontSize: s(14),
        lineHeight: s(23),
        marginTop: s(6),
    },
    enrollButton: {
        alignSelf: 'flex-start',
        borderRadius: s(22),
        backgroundColor: '#ea580c',
        marginTop: s(14),
        paddingHorizontal: s(20),
        paddingVertical: s(10),
    },
    enrollText: {
        color: '#ffffff',
        fontSize: s(15),
        fontWeight: '800',
    },
    coin: {
        width: s(86),
        height: s(86),
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: s(7),
        borderColor: '#fed7aa',
        borderRadius: s(43),
        backgroundColor: '#f59e0b',
        marginLeft: s(14),
    },
    coinText: {
        color: '#9a3412',
        fontSize: s(22),
        fontWeight: '900',
    },
});
export default styles;
