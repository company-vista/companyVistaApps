// Global ScreenWrapper - keyboard overlap fix, use anywhere
import React from 'react';
import { KeyboardAvoidingView, ScrollView, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const ScreenWrapper = ({
  children,
  style,
  contentContainerStyle,
  keyboardVerticalOffset,
  behavior,
  enableScroll = true,
  keyboardShouldPersistTaps = 'handled',
  showsVerticalScrollIndicator = false,
}) => {
  const insets = useSafeAreaInsets();
  const offset = keyboardVerticalOffset ?? insets.top + 12;

  const inner = enableScroll ? (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      bounces={false}
    >
      {children}
    </ScrollView>
  ) : (
    children
  );

  return (
    <KeyboardAvoidingView
      behavior={behavior ?? (Platform.OS === 'ios' ? 'padding' : 'height')}
      style={[styles.flex, style]}
      keyboardVerticalOffset={offset}
    >
      {inner}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },
});

export default ScreenWrapper;
