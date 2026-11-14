import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import BackButton from '../../../../components/buttons/BackButton';
import { useThemeColors, themePalette } from '../../../../theme/colors';
import { font } from '../../../../theme/typography';
import { s } from '../../../../theme/responsive';
const serviceItems = [
    {
        title: 'Active Services',
        subtitle: 'Active plan, document balance and renewals',
        icon: 'credit-card',
        tone: 'green',
    },
    {
      title: 'Request an Add-on Service',
      subtitle: 'Browse tax, compliance, banking and legal services',
    //   tag: 'Due Jul 15',
      icon: 'envelope',
      tone: 'amber',
    },
    {
      title: 'Request Change',
      subtitle: 'Submit request for company updates',
      icon: 'edit',
      tone: 'purple',
    },
    {
      title: 'Service History',
      subtitle: "Every quote you've requested and service purchased",
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
    red: { iconBg: themePalette.hex_fee2e2, iconColor: themePalette.hex_dc2626, tagBg: themePalette.hex_fee2e2, tagText: themePalette.hex_dc2626 },
    amber: { iconBg: themePalette.hex_fef3c7, iconColor: themePalette.hex_b45309, tagBg: themePalette.hex_fef3c7, tagText: themePalette.hex_b45309 },
    blue: { iconBg: themePalette.hex_dbeafe, iconColor: themePalette.hex_1d4ed8, tagBg: themePalette.hex_dbeafe, tagText: themePalette.hex_1d4ed8 },
    purple: { iconBg: themePalette.hex_ede9fe, iconColor: themePalette.hex_7c3aed, tagBg: themePalette.hex_ede9fe, tagText: themePalette.hex_7c3aed },
    green: { iconBg: themePalette.hex_d1fae5, iconColor: themePalette.hex_059669, tagBg: themePalette.hex_d1fae5, tagText: themePalette.hex_059669 },
};
export default function ServicesScreen({ onBackPress, onSubscriptionPress, onExploreServicesPress, onServicesHistoryPress, onRequestChangePress }) {
    const safeAreaInsets = useSafeAreaInsets();
    const colors = useThemeColors();
    const isLight = colors.mode === 'light';
    function handleItemPress(item) {
        if (item.title === 'Active Services') {
            onSubscriptionPress?.();
        }
        if (item.title === 'Request an Add-on Service') {
            onExploreServicesPress?.();
        }
        if (item.title === 'Service History') {
            onServicesHistoryPress?.();
        }
        if (item.title === 'Request Change') {
            onRequestChangePress?.();
        }
    }
    return (<View style={styles.screen}>
      <View style={[
            styles.headerArea,
            { backgroundColor: isLight ? themePalette.hex_ffffff : undefined, paddingTop: safeAreaInsets.top + 12 },
        ]}>
        <View style={styles.header}>
          <BackButton onPress={onBackPress}/>
          <Text style={[styles.title, { color: colors.text }]}>Services</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{
            paddingHorizontal: s(12),
            paddingBottom: safeAreaInsets.bottom + 24,
        }}>
        {serviceItems.map((item) => {
            const tone = toneStyles[item.tone];
            return (<Pressable key={item.title} onPress={() => handleItemPress(item)} style={styles.card}>
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
        paddingHorizontal: s(12),
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
        paddingHorizontal: s(5),
        paddingVertical: 1,
        maxWidth: 55,
    },
    badgeText: { fontSize: font.xs, fontWeight: '600' },
    contentSection: { flex: 1 },
    serviceTitle: { fontSize: font.lg, fontWeight: '600', marginBottom: 2 },
    serviceSubtitle: { fontSize: font.sm },
});
