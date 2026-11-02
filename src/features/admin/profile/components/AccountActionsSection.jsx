import { font } from '../../../../theme/typography';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch } from '../../../../store/hooks';
import { logoutUser } from '../../../../store/slices/authSlice';

const AccountActionsSection = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const [expanded, setExpanded] = useState(false);

  const items = [
    {
      key: 'logout',
      title: 'Logout',
      subtitle: 'Sign out from this account',
      icon: 'log-out-outline',
      color: '#DC2626',
      backgroundColor: '#FEF2F2',
      onPress: () => dispatch(logoutUser()),
    },
    {
      key: 'deactivate',
      title: 'Deactivate Account',
      subtitle: 'Temporarily disable your account',
      icon: 'pause-circle-outline',
      color: '#B45309',
      backgroundColor: '#FEF3C7',
      onPress: () => navigation.navigate('DeactivateAccount'),
    },
    {
      key: 'delete',
      title: 'Delete Account',
      subtitle: 'Permanently delete your account',
      icon: 'trash-outline',
      color: '#DC2626',
      backgroundColor: '#FEF2F2',
      onPress: () => navigation.navigate('DeleteAccount'),
    },
  ];

  return (
    <View style={styles.section}>
      <Pressable
        style={styles.header}
        onPress={() => setExpanded(previous => !previous)}
        accessibilityRole="button"
        accessibilityLabel="Toggle account actions">
        <Text style={styles.sectionTitle}>Account Actions</Text>
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
                <Text style={[styles.rowTitle, item.color && { color: item.color }]}>
                  {item.title}
                </Text>
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

export default AccountActionsSection;

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
