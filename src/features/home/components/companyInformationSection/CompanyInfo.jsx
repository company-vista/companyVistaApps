import React from 'react';
import { View, Text } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AnimatedAppear from '../../../../components/AnimatedAppear';
import { useThemeColors, themePalette } from '../../../../theme/colors';
import { styles } from "./CompanyInfoStles";
const CompanyInfo = ({ companyData }) => {
    const colors = useThemeColors();
    const iconColor = colors.mode === 'dark' ? themePalette.hex_85b7eb : themePalette.hex_0d2137;
    const iconBg = colors.mode === 'dark' ? themePalette.rgba_133_183_235_0_14 : themePalette.hex_eaf4ff;
    const iconBorder = colors.mode === 'dark' ? themePalette.rgba_133_183_235_0_35 : themePalette.hex_c7dff6;
    const iconStyle = {
        backgroundColor: iconBg,
        borderColor: iconBorder,
    };
    return (<View style={styles.container}>
            {/* COMPANY INFORMATION SECTION */}
            <AnimatedAppear index={0}>
                <View style={styles.sectionContainer}>
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
