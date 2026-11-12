import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useThemeColors, themePalette, makeThemeStyles } from '../../../../theme/colors';
import { font } from '../../../../theme/typography';
import { s } from '../../../../theme/responsive';
const serviceItems = [
    {
        title: 'Tax / Acct Services',
        subtitle: 'Tax filing & bookkeeping',
        tag: undefined,
        icon: 'calculator',
        tone: 'amber',
    },
    {
        title: 'Business / Regs',
        subtitle: 'Entity formation & compliance',
        tag: undefined,
        icon: 'briefcase',
        tone: 'blue',
    },
    {
        title: 'Banking / Owner Serv.',
        subtitle: 'Banking & ownership solutions',
        tag: undefined,
        icon: 'university',
        tone: 'purple',
    },
    {
        title: 'Corporate / Legal Docs',
        subtitle: 'Amendments & legal docs',
        tag: undefined,
        icon: 'file-text-o',
        tone: 'red',
    },
    {
        title: 'Bookkeeping',
        subtitle: 'Monthly reconciliation and reports',
        tag: undefined,
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
function getToneStyles(tone) {
    const toneStyles = {
        amber: {
            icon: styles.iconAmber,
            iconText: styles.iconTextAmber,
            tag: styles.tagAmber,
            tagText: styles.tagTextAmber,
            borderColor: themePalette.rgba_245_158_11_0_5,
        },
        blue: {
            icon: styles.iconBlue,
            iconText: styles.iconTextBlue,
            tag: styles.tagBlue,
            tagText: styles.tagTextBlue,
            borderColor: themePalette.rgba_59_130_246_0_5,
        },
        purple: {
            icon: styles.iconPurple,
            iconText: styles.iconTextPurple,
            tag: styles.tagPurple,
            tagText: styles.tagTextPurple,
            borderColor: themePalette.rgba_139_92_246_0_5,
        },
        red: {
            icon: styles.iconRed,
            iconText: styles.iconTextRed,
            tag: styles.tagRed,
            tagText: styles.tagTextRed,
            borderColor: themePalette.rgba_239_68_68_0_5,
        },
    };
    return toneStyles[tone];
}
function ExploreServicesSection({ onQuickAccessItemPress: _onQuickAccessItemPress, selectedCompany, }) {
    const navigation = useNavigation();
    const colors = useThemeColors();
    const isLight = colors.mode === 'light';
    return (<View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Explore Services</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gridContainer}>
        {serviceItems.map(item => {
            const tone = getToneStyles(item.tone);
            return (<Pressable key={item.title} style={[styles.gridItem, { borderColor: tone.borderColor, backgroundColor: isLight ? themePalette.hex_ffffff : colors.surface }]} onPress={() => {
                    const screenMap = {
                        'Tax / Acct Services': 'TaxAccounting',
                        'Business / Regs': 'BusinessCompliance',
                        'Banking / Owner Serv.': 'BankingOwner',
                        'Corporate / Legal Docs': 'CorporateChanges',
                        'Bookkeeping': 'Bookkeeping',
                        'Compliance Check': 'ComplianceCheck',
                    };
                    const screen = screenMap[item.title];
                    if (screen)
                        navigation.navigate(screen, { companyId: selectedCompany?.id });
                }}>
              <View style={styles.iconWrapper}>
                <View style={[styles.serviceIcon, tone.icon]}>
                  <FontAwesome name={item.icon} size={22} style={tone.iconText}/>
                </View>
              </View>

                  <Text style={[styles.serviceTitle, { color: colors.text }]} numberOfLines={2} ellipsizeMode="tail">
                {item.title}
              </Text>
            </Pressable>);
        })}
      </ScrollView>
    </View>);
}
const styles = makeThemeStyles(() => StyleSheet.create({
    section: {
        marginTop: 14,
        paddingHorizontal: s(8),
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    sectionTitle: {
        color: themePalette.hex_2c2c2a,
        fontSize: font.xl,
        fontWeight: '500',
    },
    gridContainer: {
        flexDirection: 'row',
        alignItems: 'stretch',
        columnGap: 10,
        // paddingRight: 4,
    },
    gridItem: {
        width: 140,
        alignItems: 'flex-start',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: themePalette.hex_e5e7eb,
        borderRadius: 14,
        paddingVertical: 8,
        paddingHorizontal: s(12),
        overflow: 'hidden',
    },
    iconWrapper: {
        position: 'relative',
        marginBottom: 0,
    },
    serviceIcon: {
        width: 40,
        height: 40,
        // alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
    },
    serviceTitle: {
        fontSize: font.xs,
        fontWeight: '500',
        textAlign: 'left',
        lineHeight: font.xs + 2,
        marginTop: 1,
    },
    serviceSubtitle: {
        fontSize: font.xs,
        textAlign: 'center',
        marginTop: 2,
        opacity: 0.7,
    },
    badge: {
        position: 'absolute',
        top: -5,
        right: -10,
        borderRadius: 8,
        paddingHorizontal: s(5),
        paddingVertical: 1,
        maxWidth: 45,
    },
    badgeText: {
        fontSize: font.xs,
        fontWeight: '600',
    },
    iconBlue: {},
    iconAmber: {},
    iconRed: {},
    iconPurple: {},
    iconTextBlue: {
        color: themePalette.hex_1d4ed8,
    },
    iconTextAmber: {
        color: themePalette.hex_b45309,
    },
    iconTextRed: {
        color: themePalette.hex_dc2626,
    },
    iconTextPurple: {
        color: themePalette.hex_7c3aed,
    },
    tagBlue: {
        backgroundColor: themePalette.hex_dbeafe,
    },
    tagAmber: {
        backgroundColor: themePalette.hex_fef3c7,
    },
    tagRed: {
        backgroundColor: themePalette.hex_fee2e2,
    },
    tagPurple: {
        backgroundColor: themePalette.hex_ede9fe,
    },
    tagTextBlue: {
        color: themePalette.hex_1d4ed8,
    },
    tagTextAmber: {
        color: themePalette.hex_b45309,
    },
    tagTextRed: {
        color: themePalette.hex_dc2626,
    },
    tagTextPurple: {
        color: themePalette.hex_7c3aed,
    },
}));
export default ExploreServicesSection;
