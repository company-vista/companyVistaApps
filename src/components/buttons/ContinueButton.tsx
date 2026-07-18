import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';

import { useThemeColors } from '../../theme/colors';
import { font } from '../../theme/typography';

type ContinueButtonProps = {
  label?: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export default function ContinueButton({
  label = 'Continue →',
  onPress,
  disabled = false,
  loading = false,
}: ContinueButtonProps) {
  const colors = useThemeColors();
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[styles.button, isDisabled && styles.disabled]}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color="#1a1204" />
      ) : (
        <Text style={[styles.text, label !== 'Continue →' && styles.textBold]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#e6a82a',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: font.base,
    fontWeight: '500',
    color: '#1a1204',
  },
  textBold: {
    fontSize: font.md,
    fontWeight: '600',
  },
});
