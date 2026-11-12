import { font } from '../../../theme/typography';
import { StyleSheet } from "react-native";
import { s } from '../../../theme/responsive';
import { themePalette, makeThemeStyles } from '../../../theme/colors';
const styles = makeThemeStyles(() => StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: themePalette.hex_0f172a,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: s(24),
        paddingVertical: 24,
    },
    brandMark: {
        width: 120,
        height: 120,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderRadius: 60,
        padding: 0,
        marginBottom: 14,
        marginTop: 8,
    },
    brandLogo: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        borderRadius: 60,
    },
    header: {
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        color: themePalette.hex_f8fafc,
        fontSize: font.displayXXL,
        fontWeight: '500',
        textAlign: 'center',
    },
    subtitle: {
        color: themePalette.hex_94a3b8,
        fontSize: font.lg,
        lineHeight: 24,
        marginTop: 8,
        textAlign: 'center',
    },
    form: {
        width: '100%',
        maxWidth: 390,
        gap: 18,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    field: {
        gap: 8,
    },
    fieldLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        color: themePalette.hex_1b1e22a9,
        fontSize: font.base,
        fontWeight: '700',
    },
    verifyButton: {
        paddingHorizontal: s(12),
        paddingVertical: 7,
        borderRadius: 10,
        backgroundColor: themePalette.hex_187269,
        justifyContent: 'center',
        alignItems: 'center',
    },
    verifyLabel: {
        fontSize: font.bodySmall,
        fontWeight: '700',
        color: themePalette.hex_f59e0b,
    },
    inputWrap: {
        height: 48,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: themePalette.hex_080808,
        borderRadius: 12,
        backgroundColor: themePalette.hex_111827,
        paddingHorizontal: s(16),
    },
    input: {
        flex: 1,
        height: '100%',
        padding: 0,
        color: themePalette.hex_f8fafc,
        fontSize: font.lg,
    },
    passwordToggle: {
        width: 34,
        height: 34,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: -6,
    },
    inputError: {
        borderColor: themePalette.hex_f87171,
    },
    errorText: {
        color: themePalette.hex_fca5a5,
        fontSize: font.sm,
        fontWeight: '700',
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 54,
        borderRadius: 24,
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        fontSize: font.lg,
        fontWeight: '500',
    },
    authLinkText: {
        color: themePalette.hex_94a3b8,
        fontSize: font.lg,
        fontWeight: '500',
        textAlign: 'center',
    },
    authLink: {
        color: themePalette.hex_5eead4,
        fontWeight: '600',
    },
    socialSection: {
        alignItems: 'center',
        gap: 12,
        marginTop: 10,
    },
    socialTitle: {
        color: themePalette.hex_64748b,
        fontSize: font.bodySmall,
        fontWeight: '700',
    },
    socialRow: {
        flexDirection: 'row',
        gap: 14,
    },
    socialButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
    },
    facebookButton: {
        backgroundColor: themePalette.hex_1877f2,
    },
    instagramButton: {
        backgroundColor: themePalette.hex_e1306c,
    },
    linkedinButton: {
        backgroundColor: themePalette.hex_0a66c2,
    },
}));
export default styles;
