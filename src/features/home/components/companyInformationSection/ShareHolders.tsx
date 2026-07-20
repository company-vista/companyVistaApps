import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import AnimatedAppear from '../../../../components/AnimatedAppear';
import { useThemeColors, type AppTheme } from '../../../../theme/colors';
import { useAppSelector } from '../../../../store/hooks';
import { fetchClientCompanyDetails } from '../../api/clientProfileApi';
import { styles } from "./ShareHoldersStyle"

type ShareholderClient = {
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  countryCode?: string;
  role?: string;
  isPrimary?: boolean;
};

type Shareholder = {
  clientId?: ShareholderClient;
  sharePercentage?: number;
  designation?: string;
};

type ShareHoldersProps = {
  companyId: string;
};

function getShareholderPalette(colors: AppTheme) {
  const isDark = colors.mode === 'dark';

  return {
    cardShadow: isDark ? '#000000' : colors.shadow,
    icon: isDark ? '#85B7EB' : '#155EAB',
    infoText: isDark ? '#CBD5E1' : '#164066',
    roleBackground: isDark ? 'rgba(133,183,235,0.14)' : '#E7F1FF',
    roleBorder: isDark ? 'rgba(133,183,235,0.28)' : '#C7DFF6',
    roleText: isDark ? '#85B7EB' : '#155EAB',
    sectionIcon: isDark ? '#85B7EB' : '#155EAB',
  };
}

const ShareHolders: React.FC<ShareHoldersProps> = ({ companyId }) => {
  const colors = useThemeColors();
  const palette = getShareholderPalette(colors);

  const token = useAppSelector(state => state.auth.token);
  const [data, setData] = useState<Shareholder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  console.log(data)
  useEffect(() => {
    let isMounted = true;

    fetchClientCompanyDetails({ companyId, token }).then(result => {
      if (!isMounted) return;

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
    return (
      <View style={[styles.container, { padding: 20, alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AnimatedAppear index={0}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryDeco} />
          <View style={styles.summaryDecoSmall}>
            <FontAwesome name="users" size={19} color="rgba(255,255,255,0.25)" />
          </View>
          <Text style={styles.summaryLabel}>Total Equity Stake</Text>
          <Text style={styles.summaryValue}>{totalStake}%</Text>
          <View style={styles.primaryBadge}>
            <FontAwesome name="user" size={9} color="#85B7EB" />
            <Text style={styles.primaryBadgeText}>Primary Shareholder</Text>
          </View>
        </View>
      </AnimatedAppear>

      <AnimatedAppear index={1}>
        <View style={styles.sectionTitleRow}>
          <FontAwesome name="users" size={16} color={palette.sectionIcon} />
          <Text style={[styles.header, { color: colors.text }]}>Shareholders</Text>
        </View>
      </AnimatedAppear>

      <View style={styles.list}>
        {data.length === 0 ? (
          <Text style={{ color: colors.muted, marginTop: 10 }}>No shareholders found.</Text>
        ) : (
          data.map((shareholder, index) => {
            const client = shareholder.clientId;
            const key = client?.id || client?._id || String(index);
            const name = `${client?.firstName || ''} ${client?.lastName || ''}`.trim() || 'Unnamed Shareholder';
            const role = shareholder.designation || client?.role || 'Shareholder';
            const sharePercentage = shareholder.sharePercentage || 0;
            const email = client?.email;
            const phone = client?.phoneNumber ? `${client?.countryCode || ''} ${client?.phoneNumber}`.trim() : null;

            return (
              <AnimatedAppear key={key} index={2 + index}>
                <View
                  style={[
                    styles.shareholderCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      shadowColor: palette.cardShadow,
                    },
                  ]}>
                <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
                <View
                  style={[
                    styles.roleBadge,
                    { backgroundColor: palette.roleBackground, borderColor: palette.roleBorder },
                  ]}>
                  <Text style={[styles.roleText, { color: palette.roleText }]}>
                    {role}
                  </Text>
                </View>

                <InfoRow
                  icon="percent"
                  iconColor={palette.icon}
                  text={`Share Percentage: ${sharePercentage}%`}
                  textColor={palette.infoText}
                />
                {email ? (
                  <InfoRow
                    icon="envelope-o"
                    iconColor={palette.icon}
                    text={email}
                    textColor={palette.infoText}
                  />
                ) : null}
                {phone ? (
                  <InfoRow
                    icon="phone"
                    iconColor={palette.icon}
                    text={phone}
                    textColor={palette.infoText}
                  />
                ) : null}
              </View>
              </AnimatedAppear>
            );
          })
        )}
      </View>
    </View>
  );
};

function InfoRow({
  icon,
  iconColor,
  text,
  textColor,
}: {
  icon: string;
  iconColor: string;
  text: string;
  textColor: string;
}) {
  return (
    <View style={styles.infoRow}>
      <FontAwesome name={icon} size={12} color={iconColor} style={styles.infoIcon} />
      <Text style={[styles.infoText, { color: textColor }]}>{text}</Text>
    </View>
  );
}


export default ShareHolders;
