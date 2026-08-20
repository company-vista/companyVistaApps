import { StyleSheet } from "react-native";
import { s } from "../../../theme/responsive";
import { font } from "../../../theme/typography";
const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#0f172a',
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
        color: '#f8fafc',
        fontSize: s(20),
        fontWeight: '400',
        textAlign: 'center',
    },
    subtitle: {
        color: '#94a3b8',
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
        color: '#cbd5e1a9',
        fontSize: s(13),
        fontWeight: '700',
    },
    inputWrap: {
        height: s(54),
        flexDirection: 'row',
        alignItems: 'center',
        gap: s(10),
        borderWidth: 1,
        borderColor: '#0d1116',
        borderRadius: s(20),
        backgroundColor: '#111827',
        paddingHorizontal: s(14),
    },
    input: {
        flex: 1,
        height: '100%',
        padding: 0,
        color: '#f8fafc',
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
        borderColor: '#f87171',
    },
    errorText: {
        color: '#fca5a5',
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
        backgroundColor: '#334155',
    },
    dividerText: {
        color: '#cbd5e1',
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
        borderColor: '#e5e7eb',
        borderRadius: s(22),
        backgroundColor: '#ffffff',
    },
    googleAuthText: {
        color: '#475569',
        fontSize: s(15),
        fontWeight: '500',
    },
    authLinkText: {
        color: '#94a3b8',
        fontSize: s(15),
        fontWeight: '600',
        textAlign: 'center',
    },
    authLink: {
        color: '#5eead4',
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
        color: '#64748b',
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
        backgroundColor: '#1877f2',
    },
    instagramButton: {
        backgroundColor: '#e1306c',
    },
    linkedinButton: {
        backgroundColor: '#0a66c2',
    },
});
export default styles;
