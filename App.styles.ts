import { StyleSheet } from "react-native";
import { s } from "./src/theme/responsive";

const styles = StyleSheet.create({
  splashScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashContent: {
    alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 80,
    borderWidth: 1.5,
    borderColor: 'rgba(201,168,76,0.4)',
  },
  orbitalRing: {
    position: 'absolute',
    width: 302,
    height: 302,
    borderRadius: 178,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.2)',
  },
  globeContainer: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowHalo: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 125,
    // backgroundColor: 'rgba(201,168,76,0.12)',
  },
  globeImage: {
    width: 240,
    height: 240,
    borderRadius: 100,
  },
  companyName: {
    color: '#334155',
    fontSize: 20,
    fontWeight: '500',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginTop: s(16),
  },
  companyTagline: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginTop: s(6),
  },
  // Toast ka background/border/text runtime me theme se aata hai (createToastConfig
  // in App.jsx) — isliye yahan sirf layout hai, koi hardcoded color nahi.
  // Pehle yahan '#d8c4c4f8' bg + '#1e1b4b'/'#475569' text hardcoded the, jo dark
  // mode me light card par dark text de kar poora toast un-readable kar deta tha.
  toastCard: {
    width: '80%',
    borderRadius: 24,
    paddingHorizontal: s(18),
    paddingVertical: 12,
    borderWidth: 0.3,
    // shadowColor: '#000000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.08,
    // shadowRadius: 8,
    zIndex: 9999,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toastTextWrap: {
    flex: 1,
    marginRight: 10,
  },
  toastTitle: {
    fontSize: 15,
    fontWeight: '400',
  },
  toastMessage: {
    fontSize: 13,
    fontWeight: '400',
    marginTop: 4,
  },
});

export default styles;