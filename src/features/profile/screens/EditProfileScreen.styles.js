import { font } from '../../../theme/typography';
import { StyleSheet } from 'react-native';
import { s } from '../../../theme/responsive';
import { themePalette, makeThemeStyles } from '../../../theme/colors';
const styles = makeThemeStyles(() => StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: 'transparent',
        paddingHorizontal: s(10),
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: s(12),
    },
    title: {
        color: themePalette.hex_111827,
        fontSize: font.hero,
        fontWeight: '400',
    },
    content: {
        paddingTop: s(24),
    },
    avatarCard: {
        alignItems: 'center',
        borderRadius: 18,
        backgroundColor: themePalette.hex_ffffff,
        padding: s(24),
        marginTop: s(28),
    },
    avatarWrap: {
        position: 'relative',
        width: 148,
        height: 148,
    },
    avatar: {
        width: 148,
        height: 148,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: themePalette.hex_7dd3fc,
        borderRadius: 100,
        backgroundColor: themePalette.hex_ecfeff,
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    cameraButton: {
        position: 'absolute',
        right: s(-16),
        bottom: s(-4),
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderRadius: 21,
        backgroundColor: themePalette.hex_121414,
    },
    formCard: {
        borderRadius: 18,
        backgroundColor: themePalette.hex_ffffff,
        marginTop: s(18),
        padding: s(16),
        gap: s(14),
    },
    inputGroup: {
        gap: s(7),
    },
    inputLabel: {
        color: themePalette.hex_94a3b8,
        fontSize: font.sm,
        fontWeight: '400',
    },
    inputRow: {
        minHeight: 50,
        flexDirection: 'row',
        alignItems: 'center',
        gap: s(12),
        borderWidth: 1,
        borderColor: themePalette.hex_e5e7eb,
        borderRadius: 14,
        backgroundColor: themePalette.hex_ecfeff,
        paddingHorizontal: s(14),
    },
    input: {
        flex: 1,
        color: themePalette.hex_111827,
        fontSize: font.md,
        fontWeight: '400',
        paddingVertical: 0,
    },
    dateInputText: {
        lineHeight: 22,
    },
    modalOverlay: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: themePalette.rgba_15_23_42_0_42,
        paddingHorizontal: s(24),
    },
    modalCard: {
        width: '100%',
        borderRadius: 18,
        backgroundColor: themePalette.hex_ffffff,
        padding: s(18),
    },
    modalTitle: {
        color: themePalette.hex_111827,
        fontSize: font.xxl,
        fontWeight: '400',
        textAlign: 'center',
    },
    datePickerColumns: {
        flexDirection: 'row',
        gap: s(10),
        marginTop: s(18),
    },
    dateColumn: {
        flex: 1,
        alignItems: 'center',
        gap: s(10),
    },
    dateLabel: {
        color: themePalette.hex_94a3b8,
        fontSize: font.sm,
        fontWeight: '400',
    },
    dateStepButton: {
        width: '100%',
        minHeight: 38,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: themePalette.hex_e5e7eb,
        borderRadius: 12,
    },
    dateValue: {
        color: themePalette.hex_111827,
        fontSize: font.xl,
        fontWeight: '400',
    },
    modalActions: {
        flexDirection: 'row',
        gap: s(12),
        marginTop: s(22),
    },
    modalButton: {
        flex: 1,
        minHeight: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: themePalette.hex_e5e7eb,
        borderRadius: 12,
    },
    modalButtonText: {
        color: themePalette.hex_111827,
        fontSize: font.base,
        fontWeight: '400',
    },
    modalDoneText: {
        color: themePalette.hex_ffffff,
        fontSize: font.base,
        fontWeight: '900',
    },
}));
export default styles;
