import { StyleSheet } from 'react-native';
import { s } from '../../../../theme/responsive';
import { themePalette, makeThemeStyles } from '../../../../theme/colors';
const styles = makeThemeStyles(() => StyleSheet.create({
    rewardCard: {
        minHeight: s(154),
        flexDirection: 'row',
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: themePalette.hex_fde1b8,
        borderRadius: s(12),
        backgroundColor: themePalette.hex_fff1d6,
        marginTop: s(28),
        padding: s(18),
    },
    rewardText: {
        flex: 1,
    },
    rewardTitle: {
        color: themePalette.hex_111827,
        fontSize: s(21),
        fontWeight: '800',
    },
    rewardBrand: {
        color: themePalette.hex_c2410c,
        fontSize: s(17),
    },
    rewardSubtitle: {
        color: themePalette.hex_6b7280,
        fontSize: s(14),
        lineHeight: s(23),
        marginTop: s(6),
    },
    enrollButton: {
        alignSelf: 'flex-start',
        borderRadius: s(22),
        backgroundColor: themePalette.hex_ea580c,
        marginTop: s(14),
        paddingHorizontal: s(20),
        paddingVertical: s(10),
    },
    enrollText: {
        color: themePalette.hex_ffffff,
        fontSize: s(15),
        fontWeight: '800',
    },
    coin: {
        width: s(86),
        height: s(86),
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: s(7),
        borderColor: themePalette.hex_fed7aa,
        borderRadius: s(43),
        backgroundColor: themePalette.hex_f59e0b,
        marginLeft: s(14),
    },
    coinText: {
        color: themePalette.hex_9a3412,
        fontSize: s(22),
        fontWeight: '900',
    },
}));
export default styles;
