import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AnimatedAppear from '../../../../components/AnimatedAppear';
import { useThemeColors } from '../../../../theme/colors';
import type { CompanyCardItem } from '../../screens/quickAccess/CompanyCard';
import { styles } from "./CompanyInfoStles"

type CompanyInfoProps = {
    companyData: CompanyCardItem;
};

const CompanyInfo: React.FC<CompanyInfoProps> = ({ companyData }) => {
    const colors = useThemeColors();
    const iconColor = colors.mode === 'dark' ? '#85B7EB' : '#0D2137';
    const iconBg = colors.mode === 'dark' ? 'rgba(133,183,235,0.14)' : '#EAF4FF';
    const iconBorder = colors.mode === 'dark' ? 'rgba(133,183,235,0.35)' : '#C7DFF6';
    const statusColor = companyData.status === 'Active'
        ? { bg: '#E6F4EA', text: '#137333', dot: '#1E8E3E' }
        : { bg: '#FCE8E6', text: '#C5221F', dot: '#D93025' };

    const iconStyle = {
        backgroundColor: iconBg,
        borderColor: iconBorder,
    };

    return (
        <View style={styles.container}>
            {/* HERO SECTION */}
            <AnimatedAppear index={0}>
                <View style={styles.heroSection}>
                    <View style={styles.companyNameRow}>
                        <Text style={[styles.companyMainTitle, { color: colors.text }]}>{companyData.name}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                            <View style={[styles.statusDot, { backgroundColor: statusColor.dot }]} />
                            <Text style={[styles.statusBadgeText, { color: statusColor.text }]}>{companyData.status}</Text>
                        </View>
                    </View>
                    <Text style={[styles.companyIdText, { color: colors.muted }]}>ID: {companyData.id}</Text>
                    <View style={styles.locationRow}>
                        <Text style={styles.locationIcon}>📍</Text>
                        <Text style={[styles.locationText, { color: colors.muted }]}>{companyData.countryOfIncorporation}</Text>
                    </View>
                </View>
            </AnimatedAppear>

            {/* COMPANY INFORMATION SECTION */}
            <AnimatedAppear index={1}>
                <View style={[styles.sectionContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.sectionHeader, { color: colors.text }]}>Company Information</Text>
                <View style={styles.fieldGroup}>
                    <View style={[styles.fieldIcon, iconStyle]}>
                        <FontAwesome name="building" size={15} color={iconColor} />
                    </View>
                    <View style={styles.fieldCopy}>
                        <Text style={[styles.fieldLabel, { color: colors.subtle }]}>COMPANY NAME</Text>
                        <Text style={[styles.fieldValue, { color: colors.text }]}>{companyData.name}</Text>
                    </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.fieldGroup}>
                    <View style={[styles.fieldIcon, iconStyle]}>
                        <FontAwesome name="map-marker" size={16} color={iconColor} />
                    </View>
                    <View style={styles.fieldCopy}>
                        <Text style={[styles.fieldLabel, { color: colors.subtle }]}>COUNTRY OF INCORPORATION</Text>
                        <Text style={[styles.fieldValue, { color: colors.text }]}>{companyData.countryOfIncorporation}</Text>
                    </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.fieldGroup}>
                    <View style={[styles.fieldIcon, iconStyle]}>
                        <FontAwesome name="briefcase" size={14} color={iconColor} />
                    </View>
                    <View style={styles.fieldCopy}>
                        <Text style={[styles.fieldLabel, { color: colors.subtle }]}>COMPANY TYPE</Text>
                        <Text style={[styles.fieldValue, { color: colors.text }]}>{companyData.companyType}</Text>
                    </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.fieldGroup}>
                    <View style={[styles.fieldIcon, iconStyle]}>
                        <FontAwesome name="id-card-o" size={14} color={iconColor} />
                    </View>
                    <View style={styles.fieldCopy}>
                        <Text style={[styles.fieldLabel, { color: colors.subtle }]}>EIN</Text>
                        <Text style={[styles.fieldValue, { color: colors.text }]}>{companyData.ein}</Text>
                    </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.fieldGroup}>
                    <View style={[styles.fieldIcon, iconStyle]}>
                        <FontAwesome name="calendar" size={14} color={iconColor} />
                    </View>
                    <View style={styles.fieldCopy}>
                        <Text style={[styles.fieldLabel, { color: colors.subtle }]}>DATE ADDED</Text>
                        <Text style={[styles.fieldValue, { color: colors.text }]}>{companyData.date}</Text>
                    </View>
                </View>
            </View>
            </AnimatedAppear>
        </View>
    );
};

export default CompanyInfo;

