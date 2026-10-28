import React from 'react';
import { Text, View } from 'react-native';
import { styles } from './companyDetailsStyles';

const TONE_STYLES = {
  green: { backgroundColor: '#ECFDF5', color: '#059669' },
  amber: { backgroundColor: '#FEF3C7', color: '#B45309' },
  red: { backgroundColor: '#FEF2F2', color: '#DC2626' },
  blue: { backgroundColor: '#EFF6FF', color: '#1D4ED8' },
  gray: { backgroundColor: '#F1F5F9', color: '#475569' },
};

const StatusPill = ({ label, tone = 'gray' }) => {
  const toneStyle = TONE_STYLES[tone] || TONE_STYLES.gray;
  return (
    <View style={[styles.statusPill, { backgroundColor: toneStyle.backgroundColor }]}>
      <Text style={[styles.statusPillText, { color: toneStyle.color }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
};

export default StatusPill;
