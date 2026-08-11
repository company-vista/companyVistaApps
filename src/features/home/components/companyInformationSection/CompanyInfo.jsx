import React from 'react';
import { View, Text } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AnimatedAppear from '../../../../components/AnimatedAppear';
import { useThemeColors } from '../../../../theme/colors';
import { styles } from "./CompanyInfoStles";
const CompanyInfo = ({ companyData }) => {
    const colors = useThemeColors();
    const iconColor = colors.mode === 'dark' ? '#85B7EB' : '#0D2137';
    const iconBg = colors.mode === 'dark' ? 'rgba(133,183,235,0.14)' : '#EAF4FF';
    const iconBorder = colors.mode === 'dark' ? 'rgba(133,183,235,0.35)' : '#C7DFF6';
    const iconStyle = {
        backgroundColor: iconBg,
        borderColor: iconBorder,
    };
    return (<View style={styles.container}>
            {/* COMPANY INFORMATION SECTION */}
            <AnimatedAppear index={0}>
                <Text style={[styles.sectionHeader, { color: colors.text }]}>Company Information</Text>
                <View style={[styles.sectionContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.fieldGroup}>
                        <View style={[styles.fieldIcon, iconStyle]}>
                            <FontAwesome name="building" size={17} color={iconColor}/>
                        </View>
                        <View style={styles.fieldCopy}>
                            <Text style={[styles.fieldLabel, { color: colors.subtle }]}>COMPANY NAME</Text>
                            <Text style={[styles.fieldValue, { color: colors.text }]}>{companyData.name}</Text>
                        </View>
                    </View>
                    <View style={[styles.divider, { backgroundColor: colors.border }]}/>
                    <View style={styles.fieldGroup}>
                        <View style={[styles.fieldIcon, iconStyle]}>
                            <FontAwesome name="map-marker" size={18} color={iconColor}/>
                        </View>
                        <View style={styles.fieldCopy}>
                            <Text style={[styles.fieldLabel, { color: colors.subtle }]}>COUNTRY OF INCORPORATION</Text>
                            <Text style={[styles.fieldValue, { color: colors.text }]}>{companyData.countryOfIncorporation}</Text>
                        </View>
                    </View>
                    <View style={[styles.divider, { backgroundColor: colors.border }]}/>
                    <View style={styles.fieldGroup}>
                        <View style={[styles.fieldIcon, iconStyle]}>
                            <FontAwesome name="briefcase" size={16} color={iconColor}/>
                        </View>
                        <View style={styles.fieldCopy}>
                            <Text style={[styles.fieldLabel, { color: colors.subtle }]}>COMPANY TYPE</Text>
                            <Text style={[styles.fieldValue, { color: colors.text }]}>{companyData.companyType}</Text>
                        </View>
                    </View>
                    <View style={[styles.divider, { backgroundColor: colors.border }]}/>
                    <View style={styles.fieldGroup}>
                        <View style={[styles.fieldIcon, iconStyle]}>
                            <FontAwesome name="id-card-o" size={16} color={iconColor}/>
                        </View>
                        <View style={styles.fieldCopy}>
                            <Text style={[styles.fieldLabel, { color: colors.subtle }]}>EIN</Text>
                            <Text style={[styles.fieldValue, { color: colors.text }]}>{companyData.ein}</Text>
                        </View>
                    </View>
                    <View style={[styles.divider, { backgroundColor: colors.border }]}/>
                    <View style={styles.fieldGroup}>
                        <View style={[styles.fieldIcon, iconStyle]}>
                            <FontAwesome name="calendar" size={16} color={iconColor}/>
                        </View>
                        <View style={styles.fieldCopy}>
                            <Text style={[styles.fieldLabel, { color: colors.subtle }]}>DATE ADDED</Text>
                            <Text style={[styles.fieldValue, { color: colors.text }]}>{companyData.date}</Text>
                        </View>
                    </View>
                </View>
            </AnimatedAppear>
        </View>);
};
export default CompanyInfo;
