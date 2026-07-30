import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';

import { useThemeColors } from '../../../../theme/colors';

export interface ServiceCardProps {
  title: string;
  price: string;
  description: string;
  onRequestQuote?: () => void;
  onPayNow?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  price,
  description,
  onRequestQuote,
  onPayNow,
  containerStyle,
}) => {
  const colors = useThemeColors();
  const isDark = colors.mode === 'dark';

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, containerStyle]}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={styles.price}>{price}</Text>
      </View>

      <Text style={[styles.description, { color: colors.muted }]}>{description}</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.outlineButton, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9', borderColor: colors.border }]}
          activeOpacity={0.7}
          onPress={onRequestQuote}>
          <Text style={[styles.outlineButtonText, { color: isDark ? '#F1F5F9' : colors.text }]}>Request Quote</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: isDark ? '#FF9500' : colors.buttonBackground }]}
          activeOpacity={0.8}
          onPress={onPayNow}>
          <Text style={[styles.primaryButtonText, { color: isDark ? '#000000' : colors.buttonText }]}>Pay Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFA500',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  outlineButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
