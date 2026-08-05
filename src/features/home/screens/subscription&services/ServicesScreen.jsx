import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import BackButton from '../../../../components/buttons/BackButton';
import { useThemeColors } from '../../../../theme/colors';
import { font } from '../../../../theme/typography';
const serviceItems = [
    {
        title: 'Subscription',
        subtitle: 'Manage your subscription plans',
        icon: 'credit-card',
        tone: 'green',
    },
    {
      title: 'Request a services',
      subtitle: 'Request a service from our team',
    //   tag: 'Due Jul 15',
      icon: 'envelope',
      tone: 'amber',
    },
    {
      title: 'Services History',
      subtitle: 'See your past service requests and payments',
      icon: 'history',
      tone: 'blue',
    },
    // {
    //   title: 'Change Agent',
    //   subtitle: 'Nationwide - Same day processing',
    //   icon: 'exchange',
    //   tone: 'purple',
    // },
    // {
    //   title: 'Bookkeeping',
    //   subtitle: 'Monthly reconciliation and reports',
    //   icon: 'calculator',
    //   tone: 'blue',
    // },
    // {
    //   title: 'Compliance Check',
    //   subtitle: 'Stay ahead of filing deadlines',
    //   tag: 'New',
    //   icon: 'check-square-o',
    //   tone: 'purple',
    // },
];
const toneStyles = {
    red: { iconBg: '#FEE2E2', iconColor: '#DC2626', tagBg: '#FEE2E2', tagText: '#DC2626' },
    amber: { iconBg: '#FEF3C7', iconColor: '#B45309', tagBg: '#FEF3C7', tagText: '#B45309' },
    blue: { iconBg: '#DBEAFE', iconColor: '#1D4ED8', tagBg: '#DBEAFE', tagText: '#1D4ED8' },
    purple: { iconBg: '#EDE9FE', iconColor: '#7C3AED', tagBg: '#EDE9FE', tagText: '#7C3AED' },
    green: { iconBg: '#D1FAE5', iconColor: '#059669', tagBg: '#D1FAE5', tagText: '#059669' },
};
export default function ServicesScreen({ onBackPress, onSubscriptionPress, onExploreServicesPress, onServicesHistoryPress }) {
    const safeAreaInsets = useSafeAreaInsets();
    const colors = useThemeColors();
    const isLight = colors.mode === 'light';
    function handleItemPress(item) {
        if (item.title === 'Subscription') {
            onSubscriptionPress?.();
        }
        if (item.title === 'Request a services') {
            onExploreServicesPress?.();
        }
        if (item.title === 'Services History') {
            onServicesHistoryPress?.();
        }
    }
    return (<View style={styles.screen}>
      <View style={[
            styles.headerArea,
            { backgroundColor: isLight ? '#ffffff' : undefined, paddingTop: safeAreaInsets.top + 12 },
        ]}>
        <View style={styles.header}>
          <BackButton onPress={onBackPress}/>
          <Text style={[styles.title, { color: colors.text }]}>Services</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: safeAreaInsets.bottom + 24,
        }}>
        {serviceItems.map((item) => {
            const tone = toneStyles[item.tone];
            return (<Pressable key={item.title} onPress={() => handleItemPress(item)} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.iconBox, { backgroundColor: tone.iconBg }]}>
                <FontAwesome name={item.icon} size={20} color={tone.iconColor}/>
                {item.tag ? (<View style={[styles.badge, { backgroundColor: tone.tagBg }]}>
                    <Text style={[styles.badgeText, { color: tone.tagText }]} numberOfLines={1}>
                      {item.tag}
                    </Text>
                  </View>) : null}
              </View>
              <View style={styles.contentSection}>
                <Text style={[styles.serviceTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.serviceSubtitle, { color: colors.muted }]}>{item.subtitle}</Text>
              </View>
              <FontAwesome name="angle-right" size={18} color={colors.muted}/>
            </Pressable>);
        })}
      </ScrollView>
    </View>);
}
const styles = StyleSheet.create({
    screen: { flex: 1 },
    headerArea: {
        paddingHorizontal: 20,
        paddingBottom: 12,
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    title: { fontSize: font.title, fontWeight: '600' },
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
