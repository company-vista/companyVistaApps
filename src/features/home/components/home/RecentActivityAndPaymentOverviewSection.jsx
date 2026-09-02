import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useThemeColors } from '../../../../theme/colors';
import { font } from '../../../../theme/typography';
function RecentActivityAndPaymentOverviewSection({ onPress, onServicesPress, onRegistrationTrackingPress, selectedCompany, }) {
    const colors = useThemeColors();
    const isLight = colors.mode === 'light';
    const companySubtitle = selectedCompany?.name ?? selectedCompany?.companyName ?? 'Company';
    const recentActivities = [
        { title: 'Transaction History', subtitle: companySubtitle, icon: 'history', onItemPress: onPress, iconColor: '#3B82F6', iconBg: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.5)' },
        { title: 'Subscription & Services', subtitle: companySubtitle, icon: 'cogs', onItemPress: onServicesPress, iconColor: '#8B5CF6', iconBg: 'rgba(139, 92, 246, 0.1)', borderColor: 'rgba(139, 92, 246, 0.5)' },
        { title: 'Registration Tracking', subtitle: companySubtitle, icon: 'map-marker', onItemPress: onRegistrationTrackingPress, iconColor: '#0891b2', iconBg: 'rgba(8, 145, 178, 0.1)', borderColor: 'rgba(8, 145, 178, 0.5)' },
    ];
    return (<View style={styles.wrapper}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Links</Text>
      <View style={styles.grid}>
        {recentActivities.map(item => (<Pressable key={item.title} style={[styles.card, { backgroundColor: isLight ? colors.cardHighlight : '#0D1B2A', borderColor: isLight ? item.borderColor : 'rgba(255,255,255,0.08)', borderWidth: isLight ? 1 : 1 }]} onPress={item.onItemPress}>
            <View style={[styles.iconContainer]}>
              <FontAwesome name={item.icon} size={16} color={item.iconColor}/>
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
        fontSize: font.xl,
        fontWeight: '500',
        marginBottom: 12,
        marginLeft: 2,
    },
    grid: {
        flexDirection: 'row',
        alignItems: 'stretch',
        columnGap: 8,
        justifyContent: 'flex-start',
    },
    card: {
        width: '23%',
        aspectRatio: 1,
        borderWidth: 1,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 3,
        overflow: 'hidden',
    },
    iconContainer: {
        width: 30,
        height: 30,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
        backgroundColor: 'transparent',
    },
    cardTitle: {
        fontSize: 10,
        fontWeight: '500',
        textAlign: 'center',
        lineHeight: 12,
        minHeight: 24,
    },
});
export default RecentActivityAndPaymentOverviewSection;
