import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import StatusPill from './StatusPill';
import { styles } from './companyDetailsStyles';
import {
  getAddonSubtitle,
  getFilingMeta,
  getFilingSubtitle,
} from '../utils/companyDetails';

export const ComplianceCard = ({ title, icon, item, wide, onPress }) => {
  const meta = getFilingMeta(item);
  return (
    <TouchableOpacity
      style={[styles.complianceCard, wide && styles.complianceCardWide]}
      activeOpacity={0.85}
      onPress={onPress}>
      <View style={styles.complianceTopRow}>
        <View style={styles.iconCircle}>
          <Ionicons name={icon} size={17} color="#1E3A8A" />
        </View>
        <StatusPill label={meta.label} tone={meta.tone} />
      </View>
      <Text style={styles.complianceTitle} numberOfLines={2}>
        {title}
      </Text>
      <View style={styles.complianceBottomRow}>
        <Text style={styles.complianceSubtitle} numberOfLines={1}>
          {getFilingSubtitle(item)}
        </Text>
        <Ionicons name="chevron-forward" size={14} color="#94A3B8" />
      </View>
    </TouchableOpacity>
  );
};

export const AddonCard = ({ title, icon, item }) => {
  const meta = getFilingMeta(item);
  return (
    <View style={styles.addonCard}>
      <View style={styles.addonHeader}>
        <View style={[styles.iconCircle, styles.addonIconCircle]}>
          <Ionicons name={icon} size={17} color="#6D28D9" />
        </View>
        <StatusPill label={meta.label} tone={meta.tone} />
      </View>
      <Text style={styles.complianceTitle} numberOfLines={2}>
        {title}
      </Text>
      <Text style={styles.complianceSubtitle}>
        {getAddonSubtitle(item)}
      </Text>
    </View>
  );
};
