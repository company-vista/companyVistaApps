import React, { useState, useRef, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  SafeAreaView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Ionicons from 'react-native-vector-icons/Ionicons';

/**
 * StripeCheckoutModal - No Native Config required
 *
 * Props:
 * @param {boolean} visible - modal visibility
 * @param {string} checkoutUrl - Stripe checkoutUrl from backend /create-checkout/:companyId
 * @param {() => void} onClose - called when user taps X / backdrop
 * @param {() => void} onSuccess - called when URL contains /company-signup/payment-success
 * @param {() => void} onCancel - called when URL contains /review (cancel)
 *
 * URL Listener: onNavigationStateChange + onShouldStartLoadWithRequest
 * No deep-linking / appScheme needed.
 */
export default function StripeCheckoutModal({
  visible,
  checkoutUrl,
  onClose,
  onSuccess,
  onCancel,
}) {
  const [loading, setLoading] = useState(true);
  const handledRef = useRef(false);

  const resetOnClose = useCallback(() => {
    handledRef.current = false;
    setLoading(true);
    onClose?.();
  }, [onClose]);

  const handleUrl = useCallback(
    (url) => {
      if (handledRef.current || !url) return false;
      const lower = url.toLowerCase();

      // SUCCESS: Stripe redirects to FRONTEND_URL/company-signup/payment-success
      if (lower.includes('/company-signup/payment-success') || lower.includes('/payment-success')) {
        handledRef.current = true;
        onSuccess?.(url);
        return true;
      }

      // CANCEL: Stripe cancel_url -> /review (as per requirement)
      if (lower.includes('/review') || lower.includes('/cancel') || lower.includes('canceled=true')) {
        handledRef.current = true;
        onCancel?.(url);
        return true;
      }

      return false;
    },
    [onSuccess, onCancel],
  );

  const onNavStateChange = useCallback(
    (navState) => {
      handleUrl(navState.url);
    },
    [handleUrl],
  );

  // iOS + Android intercept before load - best place to catch redirect without flashing
  const onShouldStartLoad = useCallback(
    (request) => {
      const consumed = handleUrl(request.url);
      // If we consumed success/cancel, prevent WebView from actually loading that frontend URL
      return !consumed;
    },
    [handleUrl],
  );

  if (!visible || !checkoutUrl) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={resetOnClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header with close button */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Secure Checkout</Text>
          <TouchableOpacity
            onPress={resetOnClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.closeBtn}
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.webViewContainer}>
          <WebView
            source={{ uri: checkoutUrl }}
            onNavigationStateChange={onNavStateChange}
            onShouldStartLoadWithRequest={onShouldStartLoad}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onLoadProgress={() => {}}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState={false}
            cacheEnabled={false}
            incognito={false}
            // Prevent Stripe from trying to open external browser via target="_blank"
            setSupportMultipleWindows={false}
            originWhitelist={['*']}
          />

          {/* Loading overlay */}
          {loading && (
            <View style={styles.loadingOverlay} pointerEvents="none">
              <ActivityIndicator size="large" color="#D4AF37" />
              <Text style={styles.loadingText}>Loading secure payment...</Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080E18',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#080E18',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8,14,24,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#8E9BAE',
    fontSize: 13,
    marginTop: 10,
  },
});
