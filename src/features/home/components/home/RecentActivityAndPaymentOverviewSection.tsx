import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import type { CompanyCardItem } from '../../screens/quickAccess/CompanyCard';
import { useThemeColors } from '../../../../theme/colors';

type RecentActivityAndPaymentOverviewSectionProps = {
  onPress?: () => void;
  onServicesPress?: () => void;
  selectedCompany?: CompanyCardItem | null;
};

function RecentActivityAndPaymentOverviewSection({
  onPress,
  onServicesPress,
  selectedCompany,
}: RecentActivityAndPaymentOverviewSectionProps) {
  const colors = useThemeColors();

  const companySubtitle = selectedCompany?.name ?? selectedCompany?.companyName ?? 'Company';

  const recentActivities = [
    { title: 'Transaction History', subtitle: companySubtitle, icon: 'history', onItemPress: onPress },
    { title: 'Services', subtitle: companySubtitle, icon: 'cogs', onItemPress: onServicesPress },
  ];

  return (
    <View style={styles.wrapper}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
      <View
        // style={[
        //   styles.container,
        //   { backgroundColor: colors.surface, borderColor: colors.border },
        // ]}
      >
        <View style={styles.section}>

          {recentActivities.map(item => (
            <Pressable
              key={item.title}
              style={[
                styles.activityRow,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 12,
                  paddingHorizontal: 10,
                  paddingVertical: 10,
                },
              ]}
              onPress={item.onItemPress}
            >
              <View style={styles.iconContainer}>
                <FontAwesome name={item.icon} size={16} color={colors.accent || '#F97316'} />
              </View>
              <View style={styles.activityCopy}>
                <Text style={[styles.activityTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.activitySubtitle, { color: colors.muted }]}>{item.subtitle}</Text>
              </View>
              <FontAwesome name="angle-right" size={18} color={colors.muted} />
            </Pressable>
          ))}
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 19,
    marginBottom: 14,
  },
  container: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
},
section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    marginLeft: 2,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF1E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  activityCopy: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  activitySubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  paymentLabel: {
    fontSize: 12,
  },
});

export default RecentActivityAndPaymentOverviewSection;
