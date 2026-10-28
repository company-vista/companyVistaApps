import React from 'react';
import { Text, View } from 'react-native';
import { styles } from './companyDetailsStyles';

export const InfoRow = ({ label, value, isLast }) => (
  <View style={[styles.infoRow, !isLast && styles.infoRowBorder]}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue} numberOfLines={4}>
      {value || '—'}
    </Text>
  </View>
);

export const InfoCard = ({ title, subtitle, children }) => (
  <View style={styles.infoCard}>
    <Text style={styles.cardTitle}>{title}</Text>
    {subtitle ? <Text style={styles.cardSubtitle}>{subtitle}</Text> : null}
    <View style={styles.infoCardBody}>{children}</View>
  </View>
);
