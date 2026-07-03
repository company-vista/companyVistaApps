import React, { useState, useEffect } from 'react';
import { Pressable, ScrollView, Text, View, ActivityIndicator } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';

import { useThemeColors } from '../../../theme/colors';
import { API_BASE_URL } from '../../../config/api';
import { useAppSelector } from '../../../store/hooks';
import styles from './TabPlaceholder.styles';

import { formatDate } from '../../../constants/dateFormatter';

type RenewActionData = {
  id: 'address' | 'annual_filing' | 'resident' | 'federal_filing';
  title: string;
  subtitle: string;
  status: string;
  date: string;
  details: { label: string; value: string; icon?: string }[];
  companyId?: string | null;
  price?: number;
  years?: number;
  services?: Array<{
    id?: number | string | null;
    name?: string | null;
    lastDate?: string | null;
    dueDate?: string | null;
    price?: number | null;
    years?: number | null;
    isExpired?: boolean | null;
  }> | null;
};

type TabPlaceholderProps = {
  icon?: string;
  title?: string;
  companyId?: string;
  selectedCompanyName?: string | null;
  onOpenRenewPage?: (action: RenewActionData) => void;
  onOpenComplianceHistory?: (action: RenewActionData) => void;
};

// Typescript Structure for Actions
interface ComplianceActionItem {
  id: string;
  title: string;
  subtitle: string;
  status: 'Active' | 'Expired' | 'Pending' | 'Client Managed' | 'Completed';
  date: string;
  icon: string;
  details: { label: string; value: string; icon?: string }[];
  price?: number;
  years?: number;
}

function TabPlaceholder({
  icon = 'exclamation-circle',
  title = 'Address Compliance',
  companyId,
  selectedCompanyName,
  onOpenRenewPage,
  onOpenComplianceHistory,
}: TabPlaceholderProps) {
  const colors = useThemeColors();
  const token = useAppSelector(state => state.auth.token);

  const [apiData, setApiData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const effectiveCompanyId = companyId ?? null;

  useEffect(() => {
    const fetchComplianceData = async () => {
      if (!token || !effectiveCompanyId) {
        setApiData(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/company-compliance/${effectiveCompanyId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'x-auth-token': token,
          },
        });
        // console.log("response ", response.data)
        setApiData(response?.data);
      } catch (error) {
        console.error('Error fetching compliance data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplianceData();
  }, [effectiveCompanyId, token]);

  const getStatusTheme = (status: ComplianceActionItem['status']) => {
    const isDark = colors.mode === 'dark';

    switch (status) {
      case 'Expired':
        return { text: isDark ? '#FCA5A5' : '#DE3730', bg: isDark ? '#3D1717' : '#FCE8E6' };
      case 'Pending':
        return { text: isDark ? '#FCD34D' : '#E28704', bg: isDark ? '#3A2A15' : '#FEF3D6' };
      case 'Active':
      case 'Completed':
        return { text: isDark ? '#6EE7B7' : '#256F46', bg: isDark ? '#15352A' : '#E6F4EA' };
      case 'Client Managed':
        return { text: isDark ? '#94A3B8' : '#4A5568', bg: isDark ? '#1E293B' : '#EDF2F7' };
      default:
        return { text: isDark ? '#94A3B8' : '#4A5568', bg: isDark ? '#1E293B' : '#EDF2F7' };
    }
  };

  // 1. Agent और Address के लिए स्टेटस मैपिंग
  const mapAgentAddressStatus = (apiStatus?: string): 'Active' | 'Expired' | 'Pending' | 'Client Managed' => {
    if (!apiStatus) return 'Pending';
    const lower = apiStatus.toLowerCase().trim();

    if (lower === 'active' || lower === 'done' || lower === 'completed') return 'Active';
    if (lower === 'expired' || lower === 'overdue') return 'Expired';
    if (lower === 'client managed' || lower === 'client_managed' || lower === 'managed') return 'Client Managed';

    return 'Pending';
  };

  // 2. Federal और Annual Filing के लिए स्टेटस मैपिंग
  const mapFederalAnnualStatus = (apiStatus?: string): 'Client Managed' | 'Pending' | 'Completed' => {
    if (!apiStatus) return 'Pending';
    const lower = apiStatus.toLowerCase().trim();

    if (lower === 'completed' || lower === 'active' || lower === 'done') return 'Completed';
    if (lower === 'client managed' || lower === 'client_managed' || lower === 'managed') return 'Client Managed';

    return 'Pending';
  };

  const federalTaxFilingData = apiData?.data?.federalTaxFiling || {};
  const residentData = apiData?.data?.resident || {};
  const addressData = apiData?.data?.Address || {};
  const annualFilingData = apiData?.data?.annualFiling || {};

  const derivedActions: ComplianceActionItem[] = [];

  const shouldShowRenewButton = (action: ComplianceActionItem) => {
    return action.status === 'Pending' || action.status === 'Expired';
  };

  const handleRenewPress = (action: ComplianceActionItem) => {
    onOpenRenewPage?.({
      id: action.id as RenewActionData['id'],
      title: action.title,
      subtitle: action.subtitle,
      status: action.status,
      date: action.date,
      details: action.details,
      companyId: effectiveCompanyId,
      price: action.price,
      years: action.years,
    });
  };

  const handleOpenHistory = (action: ComplianceActionItem) => {
    onOpenComplianceHistory?.({
      id: action.id as RenewActionData['id'],
      title: action.title,
      subtitle: action.subtitle,
      status: action.status,
      date: action.date,
      details: action.details,
      companyId: effectiveCompanyId,
      price: action.price,
      years: action.years,
    });
  };

  // Agent Renewal
  derivedActions.push({
    id: 'resident',
    title: 'Agent Renewal',
    subtitle: 'Registered agent',
    status: mapAgentAddressStatus(residentData.status),
    date: formatDate(residentData.dueDate),
    icon: 'clock-o',
    details: [
      { label: 'Info', value: residentData.name || 'Not set', icon: 'user' },
      { label: 'Email', value: residentData.email || 'Not set', icon: 'envelope' },
      { label: 'Phone', value: residentData.phone || 'Not set', icon: 'phone' },
      { label: 'Due Date', value: formatDate(residentData.dueDate), icon: 'calendar' },
      { label: 'Last Filed', value: formatDate(residentData.lastDate), icon: 'history' },
    ]
  });

  // Address Renewal
  derivedActions.push({
    id: 'address',
    title: 'Address Renewal',
    subtitle: 'Registered address',
    status: mapAgentAddressStatus(addressData.status),
    date: formatDate(addressData.dueDate),
    icon: 'clock-o',
    details: [
      { label: 'Street Address', value: addressData.address || 'Not set', icon: 'map-marker' },
      { label: 'State', value: addressData.state || 'Not set', icon: 'map' },
      { label: 'Postal Code', value: addressData.postalCode || 'Not set', icon: 'map-pin' },
      { label: 'Country', value: addressData.country || 'Not set', icon: 'globe' },
      { label: 'Due Date', value: formatDate(addressData.dueDate), icon: 'calendar' },
      { label: 'Last Filed', value: formatDate(addressData.lastDate), icon: 'history' },
    ],
    price: 99,
    years: 1,
  });

  // Federal Filing
  derivedActions.push({
    id: 'federal_filing',
    title: 'Federal Filing',
    subtitle: 'Annual federal tax',
    status: mapFederalAnnualStatus(federalTaxFilingData.status),
    date: formatDate(federalTaxFilingData.dueDate),
    icon: 'exclamation-circle',
    details: [
      { label: 'Due Date', value: formatDate(federalTaxFilingData.dueDate), icon: 'calendar' },
      { label: 'Last Filed', value: formatDate(federalTaxFilingData.lastDate), icon: 'history' },
    ]
  });

  // Annual Filing
  derivedActions.push({
    id: 'annual_filing',
    title: 'Annual Filing',
    subtitle: 'State compliance',
    status: mapFederalAnnualStatus(annualFilingData.status),
    date: formatDate(annualFilingData.dueDate),
    icon: 'check-circle',
    details: [
      { label: 'Due Date', value: formatDate(annualFilingData.dueDate), icon: 'calendar' },
      { label: 'Last Filed', value: formatDate(annualFilingData.lastDate), icon: 'history' },
    ],
    price: 149,
    years: 1,
  });

  // Stats Counters 
  const overdueCount = derivedActions.filter(a => a.status === 'Expired').length;
  const pendingCount = derivedActions.filter(a => a.status === 'Pending').length;
  const doneCount = derivedActions.filter(a => a.status === 'Active' || a.status === 'Completed' || a.status === 'Client Managed').length;
  const totalCount = derivedActions.length;
  const healthPercentage = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

      {/* --- 1. PROFILE HEADER SECTION --- */}
      <View style={styles.header}>
        <View style={styles.profileContainer}>
          <View style={styles.avatarWrapper}>
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, justifyContent: 'center', alignItems: 'center' }]}>
              <FontAwesome name="user" size={20} color={colors.accent} />
            </View>
            <View style={styles.activeDot} />
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}> 
              {selectedCompanyName ?? residentData?.name ?? 'Loading...'}
            </Text>
            <Text style={[styles.userEmail, { color: colors.muted }]}>{residentData?.email || 'Not set'}</Text>
          </View>
        </View>
      </View>

      {/* --- 2. STATS COUNTER CARDS --- */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.statDot, { backgroundColor: '#DE3730' }]} />
          <Text style={[styles.statNumber, { color: colors.text }]}>{overdueCount}</Text>
          <Text style={[styles.statLabel, { color: colors.muted }]}>Expired</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.statDot, { backgroundColor: '#E28704' }]} />
          <Text style={[styles.statNumber, { color: colors.text }]}>{pendingCount}</Text>
          <Text style={[styles.statLabel, { color: colors.muted }]}>Pending</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.statDot, { backgroundColor: '#256F46' }]} />
          <Text style={[styles.statNumber, { color: colors.text }]}>{doneCount}</Text>
          <Text style={[styles.statLabel, { color: colors.muted }]}>Done / Active</Text>
        </View>
      </View>

      {/* --- 3. COMPLIANCE HEALTH CARD --- */}
      <View style={[styles.healthCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.healthHeader}>
          <Text style={[styles.healthTitle, { color: colors.muted }]}>Compliance health</Text>
          <Text style={[styles.healthPercentage, { color: colors.text }]}>{healthPercentage}%</Text>
        </View>
        <View style={[styles.progressBarBackground, { backgroundColor: colors.background }]}>
          <View style={[styles.progressBarFill, { backgroundColor: '#1E5631', width: `${healthPercentage}%` }]} />
        </View>
        <Text style={[styles.healthSubtext, { color: colors.muted }]}>{doneCount} of {totalCount} actions complete</Text>
      </View>

      {/* --- 4. SECTION TITLE --- */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitleText, { color: colors.text }]}>COMPLIANCE ACTIONS</Text>
      </View>

      {/* --- 5. DYNAMIC COMPLIANCE ACTIONS LIST --- */}
      {loading ? (
        <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 20 }} />
      ) : (
        derivedActions.map((action: ComplianceActionItem) => {
          const theme = getStatusTheme(action.status);

          return (
            <Pressable
              key={action.id}
              style={[
                styles.mainCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  marginBottom: 12,
                },
              ]}
              onPress={() => handleOpenHistory(action)}
            >
              <View style={styles.headerRow}>

                <View style={[styles.iconWrap, { backgroundColor: theme.bg }]}>
                  <FontAwesome name={action.icon} size={20} color={theme.text} />
                </View>

                <View style={styles.headerTextBlock}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]} numberOfLines={1}>
                    {action.title}
                  </Text>
                  <Text style={[styles.sectionSubtitle, { color: colors.muted }]} numberOfLines={1}>
                    {action.subtitle}
                  </Text>
                  <View style={styles.dateRow}>
                    <FontAwesome name="calendar" size={12} color={colors.muted} />
                    <Text style={[styles.dateText, { color: colors.muted }]}>
                      {action.date}
                    </Text>
                  </View>
                </View>

                <View style={styles.rightBadgeWrapper}>
                  <View style={styles.statusRow}>
                    
                    {shouldShowRenewButton(action) ? (
                      <Pressable
                        onPress={() => handleRenewPress(action)}
                        style={[styles.renewButton, { backgroundColor: colors.mode === 'dark' ? '#0f766e' : colors.accent }]}
                      >
                        <Text style={[styles.renewButtonText, { color: colors.textOnDark }]}>Renew Now</Text>
                      </Pressable>
                    ) : null}
                    <View style={[styles.badgeWrap, { backgroundColor: theme.bg }]}> 
                      <Text style={[styles.badgeText, { color: theme.text }]}>{action.status}</Text>
                    </View>
                  </View>
                </View>
              </View>

            </Pressable>
          );
        })
      )}
    </ScrollView>
  );
}

export default TabPlaceholder;