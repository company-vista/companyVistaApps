import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useThemeColors } from '../../../../theme/colors';
import { font } from '../../../../theme/typography';
function RecentActivityAndPaymentOverviewSection({ onPress, onServicesPress, selectedCompany, }) {
    const colors = useThemeColors();
    const isLight = colors.mode === 'light';
    const companySubtitle = selectedCompany?.name ?? selectedCompany?.companyName ?? 'Company';
    const recentActivities = [
        { title: 'Transaction History', subtitle: companySubtitle, icon: 'history', onItemPress: onPress, iconColor: '#3B82F6', iconBg: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.5)' },
        { title: 'Subscription & Services', subtitle: companySubtitle, icon: 'cogs', onItemPress: onServicesPress, iconColor: '#8B5CF6', iconBg: 'rgba(139, 92, 246, 0.1)', borderColor: 'rgba(139, 92, 246, 0.5)' },
    ];
    return (<View style={styles.wrapper}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Links</Text>
      <View style={styles.grid}>
        {recentActivities.map(item => (<Pressable key={item.title} style={[styles.card, { backgroundColor: isLight ? '#ffffff' : 'rgba(255,255,255,0.07)', borderColor: item.borderColor }]} onPress={item.onItemPress}>
            <View style={[styles.iconContainer]}>
              <FontAwesome name={item.icon} size={20} color={item.iconColor}/>
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>{item.title}</Text>
          </Pressable>))}
      </View>
    </View>);
}
const styles = StyleSheet.create({
    wrapper: {
        marginTop: 19,
        marginBottom: 14,
    },
    sectionTitle: {
        fontSize: font.lg,
        fontWeight: '500',
        marginBottom: 12,
        marginLeft: 2,
    },
    grid: {
        flexDirection: 'row',
        alignItems: 'stretch',
        columnGap: 5,
    },
    card: {
        width: '24%',
        aspectRatio: 1,
        borderWidth: 1,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 4,
        overflow: 'hidden',
    },
    iconContainer: {
        width: 38,
        height: 38,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
        backgroundColor: 'transparent',
    },
    cardTitle: {
        fontSize: font.xs,
        fontWeight: '500',
        textAlign: 'center',
        lineHeight: font.xs + 4,
        minHeight: font.xs * 2 + 4,
    },
});
export default RecentActivityAndPaymentOverviewSection;
