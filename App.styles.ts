import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  authScreen: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  authTransition: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  splashScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
  },
  logo: {
    width: 250,
    height: 66,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 4,
    marginBottom: 48,
    padding: 2,
    // backgroundColor: '#0f766e',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  appName: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 22,
  },
  toastCard: {
    width: '90%',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 9999,
  },
  successToast: {},
  errorToast: {},
  toastTitle: {
    color: '#1e1b4b',
    fontSize: 15,
    fontWeight: '900',
  },
  toastMessage: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
});

export default styles;