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
    width: s(200),
    height: s(54),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#0f172a',
    borderRadius: 4,
    padding: 2,
    marginBottom: s(32),
  },
  brandLogo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 4,
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
    gap: 8,
  },
  label: {
    color: '#cbd5e1a9',
    fontSize: s(13),
    fontWeight: '700',
  },
  inputWrap: {
    height: s(48),
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: s(12),
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
    fontWeight: '700',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    height: s(50),
    borderRadius: s(14),
    backgroundColor: '#14b8a6',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#042f2e',
    fontSize: s(15),
    fontWeight: '800',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#334155',
  },
  dividerText: {
    color: '#cbd5e1',
    fontSize: s(13),
    fontWeight: '700',
  },
  googleAuthButton: {
    height: s(48),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: s(12),
    backgroundColor: '#ffffffa2',
  },
  googleAuthText: {
    color: '#475569',
    fontSize: s(13),
    fontWeight: '700',
  },
  authLinkText: {
    color: '#94a3b8',
    fontSize: s(13),
    fontWeight: '600',
    textAlign: 'center',
  },
  authLink: {
    color: '#5eead4',
    fontWeight: '800',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -6,
  },
  forgotPasswordText: {
    fontSize: s(12),
    fontWeight: '600',
  },
  socialSection: {
    alignItems: 'center',
    gap: 10,
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