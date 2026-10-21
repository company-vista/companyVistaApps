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
        {recentActivities.map(item => (
          <View key={item.title} style={styles.item}>
            <Pressable style={[styles.card, { backgroundColor: isLight ? colors.cardHighlight : '#0D1B2A', borderColor: isLight ? item.borderColor : 'rgba(255,255,255,0.08)', borderWidth: isLight ? 1 : 1 }]} onPress={item.onItemPress}>
              <View style={styles.iconContainer}>
                <FontAwesome name={item.icon} size={24} color={item.iconColor}/>
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
        fontWeight: '500',
        marginBottom: 12,
        marginLeft: 2,
    },
    grid: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        columnGap: 8,
        justifyContent: 'flex-start',
    },
    item: {
        width: '20%',
        alignItems: 'center',
    },
    card: {
        width: '100%',
        aspectRatio: 1,
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
        fontSize: 12,
        fontWeight: '500',
        textAlign: 'center',
        lineHeight: 15,
        marginTop: 6,
    },
});
export default RecentActivityAndPaymentOverviewSection;
