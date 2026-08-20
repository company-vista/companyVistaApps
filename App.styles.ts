import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  splashScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 75,
    marginBottom: 16,
    padding: 2,
    // backgroundColor: '#0f766e',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 75,
  },
  appName: {
    color: '#0f766e',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 0,
    textAlign: 'center',
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