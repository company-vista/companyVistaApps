import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Pressable,
  StatusBar,
  Text,
  TextInput,
  View,
} from 'react-native';

// Disable system font scaling globally — 100% pixel-perfect UI on all devices
if (Text.defaultProps == null) Text.defaultProps = {};
Text.defaultProps.allowFontScaling = false;
if (TextInput.defaultProps == null) TextInput.defaultProps = {};
TextInput.defaultProps.allowFontScaling = false;
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast, { type ToastConfig } from 'react-native-toast-message';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import styles from './App.styles';

import RootStack from './src/navigation/RootStack';
// import logoImage from './src/assets/images/Logo1.png';
import companyLogo from './src/assets/images/newSplashScreen.gif';
import logoR from './src/assets/images/logoR.png';
import { useAppDispatch, useAppSelector } from './src/store/hooks';
import { restoreAuth } from './src/store/slices/authSlice';
import { store } from './src/store';
import { useThemeColors } from './src/theme/colors';

// Toast config ko factory ki tarah rakhte hain kyunki Toast component ke andar
// hooks nahi chal sakte — colors pass karna padta hai. Module-level const me
// theme ke bina sab kuch hardcoded rehta tha, jo dark mode me wrong render hota tha.
function createToastConfig(colors) {
  // Dark mode me theme ka `border` (#33415575) card ke bg (#06080ecb) ke upar
  // milke almost invisible ho jata tha. Halka white edge card ko surface se
  // alag dikhata hai, alpha low rakha hai taaki 0.3px border ek hard white line
  // na bane. Light me `colors.border` (#e5e7eb) sahi hi hai.
  const borderColor = colors.mode === 'dark' ? 'rgba(248, 250, 252, 0.16)' : colors.border;

  const renderToast = ({ text1, text2 }) => (
    <View style={[styles.toastCard, { backgroundColor: colors.surface, borderColor }]}>
      <View style={styles.toastContent}>
        <View style={styles.toastTextWrap}>
          <Text style={[styles.toastTitle, { color: colors.text }]}>{text1}</Text>
          {text2 ? <Text style={[styles.toastMessage, { color: colors.muted }]}>{text2}</Text> : null}
        </View>
        <Pressable onPress={() => Toast.hide()} hitSlop={8}>
          <Ionicons name="close" size={20} color={colors.muted} />
        </Pressable>
      </View>
    </View>
  );

  const toastConfig: ToastConfig = {
    success: renderToast,
    error: renderToast,
    info: renderToast,
  };
  return toastConfig;
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

function AppContent() {
  const dispatch = useAppDispatch();
  const { isRestoring } = useAppSelector(state => state.auth);
  const themeMode = useAppSelector(state => state.theme.mode);
  const isDarkMode = themeMode === 'dark';
  const colors = useThemeColors();
  const [showSplash, setShowSplash] = useState(true);

  // appThemes module-level object hai, to same mode par `colors` ki identity
  // stable rehti hai — config har render pe nahi banega, sirf theme switch par.
  const toastConfig = useMemo(() => createToastConfig(colors), [colors]);

  useEffect(() => {
    dispatch(restoreAuth());
  }, [dispatch]);

  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(splashTimer);
  }, []);

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        {showSplash || isRestoring ? (
          <SplashScreen />
        ) : (
          <RootStack />
        )}
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 9999, elevation: 9999 }}>
          <Toast config={toastConfig} position="bottom" bottomOffset={80} />
        </View>
      </View>
    </SafeAreaProvider>
  );
}

function SplashScreen() {
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(0)).current;
  const logoRise = useRef(new Animated.Value(0)).current;
  const textRise = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(logoRise, {
      toValue: 1,
      duration: 1200,
      delay: 250,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [logoRise]);

  // Logo ke baad text bhi niche se upar aaye — same motion, thoda late
  // (stagger) taaki dono ek saath na lagein.
  useEffect(() => {
    Animated.timing(textRise, {
      toValue: 1,
      duration: 1200,
      delay: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [textRise]);

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 25000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(pulseValue, {
        toValue: 1,
        duration: 8000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      })
    ).start();
  }, [spinValue, pulseValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const pulseScale = pulseValue.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0.7, 2.2, 2.2],
  });

  const pulseOpacity = pulseValue.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0.9, 0, 0],
  });

  const logoTranslateY = logoRise.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 0],
  });

  const textTranslateY = textRise.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 0],
  });

  return (
    <View style={[styles.splashScreen, { backgroundColor: '#050710' }]}>
      <StatusBar barStyle="light-content" />

      <Animated.View
        style={[
          styles.pulseRing,
          {
            transform: [{ scale: pulseScale }],
            opacity: pulseOpacity,
          },
        ]}
      />

      <Animated.View
        style={[
          styles.orbitalRing,
          {
            transform: [{ rotate: spin }],
          },
        ]}
      />

      <View style={styles.globeContainer}>
        <View style={styles.glowHalo} />
        <FastImage
          source={companyLogo}
          style={styles.globeImage}
          resizeMode={FastImage.resizeMode.contain}
        />
        {/* <Animated.Image
          source={logoR}
          style={{
            position: 'absolute',
            bottom: -116,
            width: 120,
            height: 42,
            resizeMode: 'contain',
            transform: [{ translateY: logoTranslateY }],
            opacity: logoRise,
          }}
        /> */}
        <Animated.Text style={{ position: 'absolute', bottom: -106, color: 'rgba(250, 234, 189, 0.64)', fontSize: 20, fontWeight: '500', letterSpacing: 1.5, textAlign: 'center', width: 400, transform: [{ translateY: textTranslateY }], opacity: textRise }}>Company Vista Inc</Animated.Text>
        <Animated.Text style={{ position: 'absolute', bottom: -138, color: 'rgba(250, 234, 189, 0.64)', fontSize: 12, fontWeight: '500', letterSpacing: 1.5, textAlign: 'center', width: 400, transform: [{ translateY: textTranslateY }], opacity: textRise }}>--a Koshika company--</Animated.Text>
      </View>
    </View>
  );
}


export default App;
