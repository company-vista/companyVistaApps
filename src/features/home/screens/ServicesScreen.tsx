import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import { useThemeColors } from '../../../theme/colors';
import { font } from '../../../theme/typography';

type ServiceItem = {
  title: string;
  subtitle: string;
  tag?: string;
  icon: string;
  tone: 'red' | 'amber' | 'blue' | 'purple' | 'green';
};

const serviceItems: ServiceItem[] = [
  {
    title: 'Subscription',
    subtitle: 'Manage your subscription plans',
    icon: 'credit-card',
    tone: 'green',
  },
  {
    title: 'Federal Filing',
    subtitle: 'Form 1120 / 5472 preparation',
    tag: 'Due Jul 15',
    icon: 'file-text',
    tone: 'amber',
  },
  {
    title: 'Add Entity',
    subtitle: 'LLC, C-Corp or S-Corp - Any state',
    icon: 'building-o',
    tone: 'blue',
  },
  {
    title: 'Change Agent',
    subtitle: 'Nationwide - Same day processing',
    icon: 'exchange',
    tone: 'purple',
  },
  {
    title: 'Bookkeeping',
    subtitle: 'Monthly reconciliation and reports',
    icon: 'calculator',
    tone: 'blue',
  },
  {
    title: 'Compliance Check',
    subtitle: 'Stay ahead of filing deadlines',
    tag: 'New',
    icon: 'check-square-o',
    tone: 'purple',
  },
];

const toneStyles: Record<string, { iconBg: string; iconColor: string; tagBg: string; tagText: string }> = {
  red: { iconBg: '#FEE2E2', iconColor: '#DC2626', tagBg: '#FEE2E2', tagText: '#DC2626' },
  amber: { iconBg: '#FEF3C7', iconColor: '#B45309', tagBg: '#FEF3C7', tagText: '#B45309' },
  blue: { iconBg: '#DBEAFE', iconColor: '#1D4ED8', tagBg: '#DBEAFE', tagText: '#1D4ED8' },
  purple: { iconBg: '#EDE9FE', iconColor: '#7C3AED', tagBg: '#EDE9FE', tagText: '#7C3AED' },
  green: { iconBg: '#D1FAE5', iconColor: '#059669', tagBg: '#D1FAE5', tagText: '#059669' },
};

type ServicesScreenProps = {
  onBackPress: () => void;
  onSubscriptionPress?: () => void;
};

export default function ServicesScreen({ onBackPress, onSubscriptionPress }: ServicesScreenProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const colors = useThemeColors();

  function handleItemPress(item: ServiceItem) {
    if (item.title === 'Subscription') {
      onSubscriptionPress?.();
    }
  }

  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: colors.background, paddingTop: safeAreaInsets.top + 22 },
      ]}
    >
      <View style={styles.header}>
        <Pressable
          onPress={onBackPress}
          style={[styles.backButton, { backgroundColor: colors.surface }]}
        >
          <FontAwesome name="arrow-left" size={18} color={colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>Services</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: safeAreaInsets.bottom + 24,
        }}
      >
        {serviceItems.map((item) => {
          const tone = toneStyles[item.tone];
          return (
            <Pressable
              key={item.title}
              onPress={() => handleItemPress(item)}
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={[styles.iconBox, { backgroundColor: tone.iconBg }]}>
                <FontAwesome name={item.icon} size={20} color={tone.iconColor} />
                {item.tag ? (
                  <View style={[styles.badge, { backgroundColor: tone.tagBg }]}>
                    <Text style={[styles.badgeText, { color: tone.tagText }]} numberOfLines={1}>
                      {item.tag}
                    </Text>
                  </View>
                ) : null}
              </View>
              <View style={styles.contentSection}>
                <Text style={[styles.serviceTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.serviceSubtitle, { color: colors.muted }]}>{item.subtitle}</Text>
              </View>
              <FontAwesome name="angle-right" size={18} color={colors.muted} />
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  title: { fontSize: font.hero, fontWeight: '500' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    maxWidth: 55,
  },
  badgeText: { fontSize: font.xs, fontWeight: '600' },
  contentSection: { flex: 1 },
  serviceTitle: { fontSize: font.lg, fontWeight: '600', marginBottom: 2 },
  serviceSubtitle: { fontSize: font.sm },
});
