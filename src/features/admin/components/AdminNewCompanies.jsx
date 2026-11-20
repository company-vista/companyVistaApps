import { font } from '../../../theme/typography';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from '../../../theme/colors';

const getBadgeStyles = colors => ({
  success: { backgroundColor: colors.accentSoft, color: colors.accent },
  warning: { backgroundColor: colors.sheet, color: colors.muted },
  danger: { backgroundColor: colors.sheet, color: colors.danger },
  action: { backgroundColor: colors.sheet, color: colors.accent },
});

const AdminNewCompanies = ({ companies = [], onViewAll }) => {
  const colors = useThemeColors();
  const badgeStyles = getBadgeStyles(colors);

  return (
    <View
      style={[
        styles.tableCard,
        {
          backgroundColor: colors.cardHighlight,
          borderColor: colors.border,
        },
      ]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Newly Registered Companies
        </Text>
        <TouchableOpacity onPress={onViewAll} disabled={!onViewAll}>
          <Text style={[styles.viewAllText, { color: colors.accent }]}>
            View all
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.tableRowHeader, { borderBottomColor: colors.border }]}>
        <Text style={[styles.tableCol, { flex: 2, color: colors.subtle }]}>
          COMPANY
        </Text>
        <Text
          style={[
            styles.tableCol,
            { flex: 1.2, textAlign: 'right', color: colors.subtle },
          ]}>
          REGISTERED ON
        </Text>
      </View>

      {companies.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.muted }]}>
          No companies registered yet.
        </Text>
      ) : (
        companies.map(item => {
          const badge = badgeStyles[item.statusType] || badgeStyles.warning;
          return (
            <View
              key={item.id}
              style={[styles.tableRow, { borderBottomColor: colors.border }]}>
              <View style={{ flex: 2, paddingRight: 8 }}>
                <Text style={[styles.companyName, { color: colors.text }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <View style={styles.metaRow}>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: badge.backgroundColor },
                    ]}>
                    <Text style={[styles.statusText, { color: badge.color }]}>
                      {item.status}
                    </Text>
                  </View>
                  <Text style={[styles.stateText, { color: colors.subtle }]} numberOfLines={1}>
                    {item.state}
                  </Text>
                </View>
              </View>
              <Text style={[styles.dateText, { color: colors.muted }]}>
                {item.date}
              </Text>
            </View>
          );
        })
      )}
    </View>
  );
};

export default AdminNewCompanies;

const styles = StyleSheet.create({
  tableCard: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: font.base,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  viewAllText: {
    fontSize: font.small,
  },
  tableRowHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingBottom: 6,
    marginBottom: 8,
  },
  tableCol: {
    fontSize: font.caption,
    fontWeight: '700',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  companyName: {
    fontSize: font.sm,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: font.caption,
    fontWeight: '600',
  },
  stateText: {
    fontSize: font.caption,
    marginLeft: 6,
    flex: 1,
  },
  dateText: {
    fontSize: font.small,
    textAlign: 'right',
  },
  emptyText: {
    fontSize: font.sm,
    textAlign: 'center',
    paddingVertical: 16,
  },
});
