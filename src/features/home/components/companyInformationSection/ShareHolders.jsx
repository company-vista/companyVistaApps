import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AnimatedAppear from '../../../../components/AnimatedAppear';
import { useThemeColors, themePalette } from '../../../../theme/colors';
import { useAppSelector } from '../../../../store/hooks';
import { fetchClientCompanyDetails } from '../../api/clientProfileApi';
import { styles } from "./ShareHoldersStyle";
function getShareholderPalette(colors) {
    const isDark = colors.mode === 'dark';
    return {
        cardShadow: isDark ? themePalette.hex_000000 : colors.shadow,
        icon: isDark ? themePalette.hex_85b7eb : themePalette.hex_155eab,
        infoText: isDark ? themePalette.hex_cbd5e1 : themePalette.hex_164066,
        roleBackground: isDark ? themePalette.rgba_133_183_235_0_14 : themePalette.hex_e7f1ff,
        roleBorder: isDark ? themePalette.rgba_133_183_235_0_28 : themePalette.hex_c7dff6,
        roleText: isDark ? themePalette.hex_85b7eb : themePalette.hex_155eab,
        sectionIcon: isDark ? themePalette.hex_85b7eb : themePalette.hex_155eab,
    };
}
const ShareHolders = ({ companyId }) => {
    const colors = useThemeColors();
    const palette = getShareholderPalette(colors);
    const token = useAppSelector(state => state.auth.token);
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    console.log(data);
    useEffect(() => {
        let isMounted = true;
        fetchClientCompanyDetails({ companyId, token }).then(result => {
            if (!isMounted)
                return;
            if (result.isSuccess && result.company?.shareholders) {
                setData(result.company.shareholders);
            }
            setIsLoading(false);
        });
        return () => {
            isMounted = false;
        };
    }, [companyId, token]);
    const totalStake = data.reduce((sum, shareholder) => sum + (Number(shareholder.sharePercentage) || 0), 0);
    if (isLoading) {
        return (<View style={[styles.container, { padding: 20, alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary}/>
      </View>);
    }
    return (<View style={styles.container}>
      <AnimatedAppear index={0}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryDeco}/>
          <View style={styles.summaryDecoSmall}>
            <FontAwesome name="users" size={19} color={themePalette.rgba_255_255_255_0_25}/>
          </View>
          <Text style={styles.summaryLabel}>Total Equity Stake</Text>
          <Text style={styles.summaryValue}>{totalStake}%</Text>
          <View style={styles.primaryBadge}>
            <FontAwesome name="user" size={9} color={themePalette.hex_85b7eb}/>
            <Text style={styles.primaryBadgeText}>Primary Shareholder</Text>
          </View>
        </View>
      </AnimatedAppear>



      <View style={styles.list}>
        {data.length === 0 ? (<Text style={{ color: colors.muted, marginTop: 10 }}>No shareholders found.</Text>) : (data.map((shareholder, index) => {
            const client = shareholder.clientId;
            const key = client?.id || client?._id || String(index);
            const name = `${client?.firstName || ''} ${client?.lastName || ''}`.trim() || 'Unnamed Shareholder';
            const role = shareholder.designation || client?.role || 'Shareholder';
            const sharePercentage = shareholder.sharePercentage || 0;
            const email = client?.email;
            const phone = client?.phoneNumber ? `${client?.countryCode || ''} ${client?.phoneNumber}`.trim() : null;
            return (<AnimatedAppear key={key} index={2 + index}>
                <View style={[
                    styles.shareholderCard,
                    {
                        // backgroundColor: colors.cardHighlight,
                        borderColor: colors.border,
                        shadowColor: palette.cardShadow,
                    },
                ]}>
                <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
                <View style={[
                    styles.roleBadge,
                    { backgroundColor: palette.roleBackground, borderColor: palette.roleBorder },
                ]}>
                  <Text style={[styles.roleText, { color: palette.roleText }]}>
                    {role}
                  </Text>
                </View>

                <InfoRow icon="percent" iconColor={palette.icon} text={`Share Percentage: ${sharePercentage}%`} textColor={palette.infoText}/>
                {email ? (<InfoRow icon="envelope-o" iconColor={palette.icon} text={email} textColor={palette.infoText}/>) : null}
                {phone ? (<InfoRow icon="phone" iconColor={palette.icon} text={phone} textColor={palette.infoText}/>) : null}
              </View>
              </AnimatedAppear>);
        }))}
      </View>
    </View>);
};
function InfoRow({ icon, iconColor, text, textColor, }) {
    return (<View style={styles.infoRow}>
      <FontAwesome name={icon} size={12} color={iconColor} style={styles.infoIcon}/>
      <Text style={[styles.infoText, { color: textColor }]}>{text}</Text>
    </View>);
}
export default ShareHolders;
