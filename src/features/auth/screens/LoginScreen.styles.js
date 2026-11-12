import { StyleSheet } from "react-native";
import { s } from "../../../theme/responsive";
import { font } from "../../../theme/typography";
import { themePalette, makeThemeStyles } from '../../../theme/colors';
const styles = makeThemeStyles(() => StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: themePalette.hex_0f172a,
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: s(24),
    },
    brandMark: {
        width: s(120),
        height: s(120),
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderRadius: s(60),
        padding: 0,
        marginBottom: s(32),
    },
    brandLogo: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        borderRadius: s(60),
    },
    header: {
        alignItems: 'center',
        marginBottom: s(20),
    },
    title: {
        color: themePalette.hex_f8fafc,
        fontSize: s(20),
        fontWeight: '400',
        textAlign: 'center',
    },
    subtitle: {
        color: themePalette.hex_94a3b8,
        fontSize: s(13),
        lineHeight: s(22),
        marginTop: 8,
        textAlign: 'center',
    },
    form: {
        width: '100%',
        maxWidth: s(360),
        gap: s(14),
    },
    field: {
        gap: s(14),
    },
    label: {
        color: themePalette.hex_cbd5e1a9,
        fontSize: s(13),
        fontWeight: '700',
    },
    inputWrap: {
        height: s(54),
        flexDirection: 'row',
        alignItems: 'center',
        gap: s(10),
        borderWidth: 1,
        borderColor: themePalette.hex_0d1116,
        borderRadius: s(20),
        backgroundColor: themePalette.hex_111827,
        paddingHorizontal: s(14),
    },
    input: {
        flex: 1,
        height: '100%',
        padding: 0,
        color: themePalette.hex_f8fafc,
        fontSize: s(14),
    },
    passwordToggle: {
        width: s(32),
        height: s(32),
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: -4,
    },
    inputError: {
        borderColor: themePalette.hex_f87171,
    },
    errorText: {
        color: themePalette.hex_fca5a5,
        fontSize: font.base,
        fontWeight: '500',
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        height: s(50),
        borderRadius: s(22),
        // backgroundColor: '#2563eb',
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        // color: '#042f2e',
        fontSize: s(16),
        fontWeight: '400',
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: s(10),
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: themePalette.hex_334155,
    },
    dividerText: {
        color: themePalette.hex_cbd5e1,
        fontSize: s(15),
        fontWeight: '700',
    },
    googleAuthButton: {
        height: s(50),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: s(10),
        borderWidth: 1,
        borderColor: themePalette.hex_e5e7eb,
        borderRadius: s(22),
        backgroundColor: themePalette.hex_ffffff,
    },
    googleAuthText: {
        color: themePalette.hex_475569,
        fontSize: s(15),
        fontWeight: '500',
    },
    authLinkText: {
        color: themePalette.hex_94a3b8,
        fontSize: s(15),
        fontWeight: '600',
        textAlign: 'center',
    },
    authLink: {
        color: themePalette.hex_5eead4,
        fontWeight: '500',
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginTop: -4,
    },
    forgotPasswordText: {
        fontSize: s(14),
        fontWeight: '500',
    },
    socialSection: {
        alignItems: 'center',
        gap: s(10),
        marginTop: 8,
    },
    socialTitle: {
        color: themePalette.hex_64748b,
        fontSize: s(12),
        fontWeight: '700',
    },
    socialRow: {
        flexDirection: 'row',
        gap: 10,
    },
    socialButton: {
        width: s(38),
        height: s(38),
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: s(19),
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
