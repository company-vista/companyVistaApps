import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Pressable,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast, { type ToastConfig } from 'react-native-toast-message';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from './App.styles';

import RootStack from './src/navigation/RootStack';
import logoImage from './src/assets/images/logo.jpg';
import { useAppDispatch, useAppSelector } from './src/store/hooks';
import { restoreAuth } from './src/store/slices/authSlice';
import { store } from './src/store';
import { useThemeColors } from './src/theme/colors';

const toastConfig: ToastConfig = {
  success: ({ text1, text2 }) => (
    <View style={[styles.toastCard, styles.successToast]}>
      <View style={styles.toastContent}>
        <View style={styles.toastTextWrap}>
          <Text style={styles.toastTitle}>{text1}</Text>
          {text2 ? <Text style={styles.toastMessage}>{text2}</Text> : null}
        </View>
        <Pressable onPress={() => Toast.hide()} hitSlop={8}>
          <Ionicons name="close" size={20} color="#64748b" />
        </Pressable>
      </View>
    </View>
  ),
  error: ({ text1, text2 }) => (
    <View style={[styles.toastCard, styles.errorToast]}>
      <View style={styles.toastContent}>
        <View style={styles.toastTextWrap}>
          <Text style={styles.toastTitle}>{text1}</Text>
          {text2 ? <Text style={styles.toastMessage}>{text2}</Text> : null}
        </View>
        <Pressable onPress={() => Toast.hide()} hitSlop={8}>
          <Ionicons name="close" size={20} color="#64748b" />
        </Pressable>
      </View>
    </View>
  ),
  info: ({ text1, text2 }) => (
    <View style={[styles.toastCard]}>
      <View style={styles.toastContent}>
        <View style={styles.toastTextWrap}>
          <Text style={styles.toastTitle}>{text1}</Text>
          {text2 ? <Text style={styles.toastMessage}>{text2}</Text> : null}
        </View>
        <Pressable onPress={() => Toast.hide()} hitSlop={8}>
          <Ionicons name="close" size={20} color="#64748b" />
        </Pressable>
      </View>
    </View>
  ),
};

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
    <View style={[styles.splashScreen, { backgroundColor: '#ffffff' }]}>
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
      <Animated.Text
        style={[
          styles.appName,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { translateY: riseAnim }],
          },
        ]}>
        Welcome To Company Vista
      </Animated.Text>
    </View>
  );
}


export default App;
