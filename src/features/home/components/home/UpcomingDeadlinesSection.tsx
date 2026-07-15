import { StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '../../../../theme/colors';

const deadlineItems = [
  {
    day: '15',
    month: 'Jul',
    title: 'Annual Report',
    subtitle: 'C-Corp - Extended deadline',
    badge: '35 days',
    tone: 'soon',
  },
  {
    day: '31',
    month: 'Jul',
    title: 'Franchise Tax',
    subtitle: 'Delaware - Good Standing',
    badge: '51 days',
    tone: 'soon',
  },
  {
    day: '01',
    month: 'Aug',
    title: 'Business License Renewal',
    subtitle: 'State - Annual',
    badge: '52 days',
    tone: 'ok',
  },
] as const;

function UpcomingDeadlinesSection() {
  const colors = useThemeColors();

  return (
    <View style={[styles.section, styles.deadlineSection]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Upcoming deadlines
        </Text>
      </View>
      <View style={styles.deadlineList}>
        {deadlineItems.map((item, index) => (
          <View key={item.title} style={[styles.deadlineRow, { backgroundColor: colors.surface, borderColor: index === 0 ? 'rgba(59, 130, 246, 0.5)' : index === 1 ? 'rgba(139, 92, 246, 0.5)' : 'rgba(245, 158, 11, 0.5)' }]}>
            <View style={styles.deadlineDate}>
              <Text style={[styles.deadlineDueLabel, { color: colors.muted }]}>Due</Text>
              <Text style={[styles.deadlineDay, { color: colors.danger }]}>{item.day}</Text>
              <Text style={[styles.deadlineMonth, { color: colors.muted }]}>{item.month}</Text>
            </View>
            <View style={[styles.deadlineDivider, { backgroundColor: colors.border }]} />
            <View style={styles.deadlineCopy}>
              <Text style={[styles.deadlineTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.deadlineSubtitle, { color: colors.muted }]}>{item.subtitle}</Text>
            </View>
            <View
              style={[
                styles.deadlineBadge,
                item.tone === 'soon' ? styles.badgeSoon : styles.badgeOk,
              ]}>
              <Text
                style={[
                  styles.deadlineBadgeText,
                  item.tone === 'soon'
                    ? styles.badgeSoonText
                    : styles.badgeOkText,
                ]}>
                {item.badge}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 14,
  },
  deadlineSection: {
    paddingBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 9,
  },
  sectionTitle: {
    color: '#2C2C2A',
    fontSize: 15,
    fontWeight: '500',
  },
  sectionLink: {
    color: '#D85A30',
    fontSize: 11,
    fontWeight: '500',
  },
  deadlineList: {
    gap: 7,
  },
  deadlineRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  deadlineDate: {
    width: 36,
    alignItems: 'center',
  },
  deadlineDueLabel: {
    fontSize: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  deadlineDay: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 18,
  },
  deadlineMonth: {
    fontSize: 10,
  },
  deadlineDivider: {
    width: 1,
    height: 32,
  },
  deadlineCopy: {
    flex: 1,
  },
  deadlineTitle: {
    fontSize: 14,
    fontWeight: '400',
  },
  deadlineSubtitle: {
    fontSize: 10,
    marginTop: 1,
  },
  deadlineBadge: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  deadlineBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  badgeSoon: {
    backgroundColor: '#FEF3C7',
  },
  badgeSoonText: {
    color: '#B45309',
  },
  badgeOk: {
    backgroundColor: '#D1FAE5',
  },
  badgeOkText: {
    color: '#047857',
  },
});

export default UpcomingDeadlinesSection;
