import { font } from '../../../../theme/typography';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const AccountSecuritySection = () => {
  const [expanded, setExpanded] = useState(false);

  const showComingSoon = () => {
    Alert.alert('Coming Soon', 'This feature will be available soon.');
  };

  const items = [
    {
      key: 'password',
      title: 'Password',
      subtitle: 'Change your account password',
      icon: 'lock-closed-outline',
      color: '#2563EB',
      backgroundColor: '#EFF6FF',
      onPress: showComingSoon,
    },
    {
      key: 'help-support',
      title: 'Help & Support',
      subtitle: 'Get help or contact support',
      icon: 'help-circle-outline',
      color: '#2563EB',
      backgroundColor: '#EFF6FF',
      onPress: showComingSoon,
    },
    {
      key: 'terms-policies',
      title: 'Terms & Policies',
      subtitle: 'View terms and privacy policy',
      icon: 'document-text-outline',
      color: '#2563EB',
      backgroundColor: '#EFF6FF',
      onPress: showComingSoon,
    },
  ];

  return (
    <View style={styles.section}>
      <Pressable
        style={styles.header}
        onPress={() => setExpanded(previous => !previous)}
        accessibilityRole="button"
        accessibilityLabel="Toggle account security">
        <Text style={styles.sectionTitle}>Account Security</Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color="#64748B"
        />
      </Pressable>
      {expanded ? (
        <View style={styles.sectionCard}>
          {items.map((item, index) => (
            <Pressable
              key={item.key}
              onPress={item.onPress}
              style={[styles.row, index > 0 && styles.rowBorder]}>
              <View
                style={[
                  styles.iconWrap,
                  item.backgroundColor && { backgroundColor: item.backgroundColor },
                ]}>
                <Ionicons
                  name={item.icon}
                  size={18}
                  color={item.color || '#2563EB'}
                />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>{item.title}</Text>
                <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
};

export default AccountSecuritySection;

const styles = StyleSheet.create({
  section: {
    marginBottom: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    marginTop: 10,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: font.bodySmall,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    fontSize: font.bodySmall,
    fontWeight: '700',
    color: '#0F172A',
  },
  rowSubtitle: {
    fontSize: font.xs,
    color: '#64748B',
    marginTop: 2,
  },
});
