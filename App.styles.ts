import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  splashScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1.5,
    borderColor: 'rgba(201,168,76,0.4)',
  },
  orbitalRing: {
    position: 'absolute',
    width: 356,
    height: 356,
    borderRadius: 178,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.2)',
  },
  globeContainer: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowHalo: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(201,168,76,0.12)',
  },
  globeImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
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