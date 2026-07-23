import { lazy, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  StatusBar,
  Text,
  View,
} from 'react-native';
import Svg, { Defs, LinearGradient as SvgGradient, Rect, Stop } from 'react-native-svg';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast, { type ToastConfig } from 'react-native-toast-message';
import styles from './App.styles';

import RootStack from './src/navigation/RootStack';
import logoImage from './src/assets/images/logoR.png';
import { useAppDispatch, useAppSelector } from './src/store/hooks';
import { restoreAuth } from './src/store/slices/authSlice';
import { store } from './src/store';
import { useThemeColors, appThemes } from './src/theme/colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const toastConfig: ToastConfig = {
  success: ({ text1, text2 }) => (
    <View style={[styles.toastCard, styles.successToast]}>
      <Text style={styles.toastTitle}>{text1}</Text>
      {text2 ? <Text style={styles.toastMessage}>{text2}</Text> : null}
    </View>
  ),
  error: ({ text1, text2 }) => (
    <View style={[styles.toastCard, styles.errorToast]}>
      <Text style={styles.toastTitle}>{text1}</Text>
      {text2 ? <Text style={styles.toastMessage}>{text2}</Text> : null}
    </View>
  ),
  info: ({ text1, text2 }) => (
    <View style={[styles.toastCard]}>
      <Text style={styles.toastTitle}>{text1}</Text>
      {text2 ? <Text style={styles.toastMessage}>{text2}</Text> : null}
    </View>
  ),
};

function GradientBackground({ topColor, bottomColor }: { topColor: string; bottomColor: string }) {
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <Svg height={SCREEN_HEIGHT} width="100%">
        <Defs>
          <SvgGradient id="bg" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={topColor} />
            <Stop offset="1" stopColor={bottomColor} />
          </SvgGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height={SCREEN_HEIGHT} fill="url(#bg)" />
      </Svg>
    </View>
  );
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
  const colors = useThemeColors();
  const isDarkMode = themeMode === 'dark';
  const gradientColors: [string, string] = isDarkMode
    ? [colors.background, colors.background]
    : (appThemes.light.backgroundGradient as [string, string]);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    dispatch(restoreAuth());
  }, [dispatch]);

  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(splashTimer);
  }, []);

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}>
        {!isDarkMode && <GradientBackground topColor={gradientColors[0]} bottomColor={gradientColors[1]} />}
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        {showSplash || isRestoring ? (
          <SplashScreen />
        ) : (
          <RootStack />
        )}
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 9999, elevation: 9999 }}>
          <Toast config={toastConfig} topOffset={50} />
        </View>
      </View>
    </SafeAreaProvider>
  );
}

function SplashScreen() {
  const colors = useThemeColors();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const riseAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(riseAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, riseAnim, scaleAnim]);

  return (
    <View style={[styles.splashScreen, { backgroundColor: colors.authBackground }]}>
      <Animated.View
        style={[
          styles.logo,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { translateY: riseAnim }],
          },
        ]}>
        <Image source={logoImage} style={styles.logoImage} />
      </Animated.View>
    </View>
  );
}


export default App;
