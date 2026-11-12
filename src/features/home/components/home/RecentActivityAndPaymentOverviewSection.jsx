import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useThemeColors, themePalette } from '../../../../theme/colors';
import { font } from '../../../../theme/typography';
function RecentActivityAndPaymentOverviewSection({ onPress, onServicesPress, selectedCompany, }) {
    const colors = useThemeColors();
    const isLight = colors.mode === 'light';
    const companySubtitle = selectedCompany?.name ?? selectedCompany?.companyName ?? 'Company';
    const recentActivities = [
        { title: 'Transaction History', subtitle: companySubtitle, icon: 'history', onItemPress: onPress, iconColor: themePalette.hex_3b82f6, iconBg: themePalette.rgba_59_130_246_0_1, borderColor: themePalette.rgba_59_130_246_0_25 },
        { title: 'Subscription & Services', subtitle: companySubtitle, icon: 'cogs', onItemPress: onServicesPress, iconColor: themePalette.hex_8b5cf6, iconBg: themePalette.rgba_139_92_246_0_1, borderColor: themePalette.rgba_139_92_246_0_25 },
    ];
    return (<View style={styles.wrapper}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Links</Text>
      <View style={styles.grid}>
        {recentActivities.map(item => (
          <View key={item.title} style={styles.item}>
            <Pressable style={[styles.card, { backgroundColor: isLight ? colors.cardHighlight : themePalette.hex_0d1b2a, borderColor: isLight ? item.borderColor : themePalette.rgba_255_255_255_0_08, borderWidth: 1 }]} onPress={item.onItemPress}>
              <View style={styles.iconContainer}>
                <FontAwesome
                  name={item.icon}
                  size={24}
                  color={isLight ? item.iconColor : themePalette.hex_ffffffc2}
                />
              </View>
            </Pressable>
            <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2} ellipsizeMode="tail">{item.title}</Text>
          </View>
        ))}
      </View>
    </View>);
}
const styles = StyleSheet.create({
    wrapper: {
        marginTop: 19,
        marginBottom: 14,
    },
    sectionTitle: {
        fontSize: font.xl,
        fontWeight: '400',
        marginBottom: 12,
        marginLeft: 2,
    },
    grid: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        columnGap: 14,
        justifyContent: 'flex-start',
    },
    item: {
        width: '21%',
        alignItems: 'center',
    },
    card: {
        width: '100%',
        aspectRatio: 1.12,
        borderWidth: 1,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 4,
        paddingHorizontal: 2,
        overflow: 'hidden',
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    cardTitle: {
        fontSize: font.sm,
        fontWeight: '400',
        textAlign: 'center',
        lineHeight: 16,
        marginTop: 6,
    },
});
export default RecentActivityAndPaymentOverviewSection;
