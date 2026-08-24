import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  splashScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 210,
    height: 210,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 75,
    marginBottom: 2,
    padding: 0,
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
    fontSize: 17,
    fontWeight: '500',
    marginTop: 0,
    textAlign: 'center',
  },
  toastCard: {
    width: '80%',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: '#fffffff8',
    borderWidth: 0.3,
    borderColor: '#2325294d',
    // shadowColor: '#000000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.08,
    // shadowRadius: 8,
    zIndex: 9999,
  },
  successToast: {},
  errorToast: {},
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toastTextWrap: {
    flex: 1,
    marginRight: 10,
  },
  toastTitle: {
    color: '#1e1b4b',
    fontSize: 15,
    fontWeight: '400',
  },
  toastMessage: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '400',
    marginTop: 4,
  },
});

export default styles;