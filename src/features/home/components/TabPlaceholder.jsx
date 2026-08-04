import React, { useState, useEffect } from 'react';
import { Pressable, ScrollView, Text, View, ActivityIndicator } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import AnimatedAppear from '../../../components/AnimatedAppear';
import { useThemeColors } from '../../../theme/colors';
import { API_BASE_URL } from '../../../config/api';
import { useAppSelector } from '../../../store/hooks';
import styles from './TabPlaceholder.styles';
import { formatDate } from '../../../constants/dateFormatter';
function TabPlaceholder({ icon = 'exclamation-circle', title = 'Address Compliance', companyId, selectedCompanyName, onOpenRenewPage, onOpenComplianceHistory, }) {
    const colors = useThemeColors();
    const token = useAppSelector(state => state.auth.token);
    const [apiData, setApiData] = useState(null);
    const [loading, setLoading] = useState(true);
    const effectiveCompanyId = companyId ?? null;

    const avatarPlaceholder = {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    }
    const mainCardStyle = {
        backgroundColor: colors.surface,
        borderColor: colors.border,
        marginBottom: 12,
    }

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
                setApiData(response?.data);
            }
            catch (error) {
                console.error('Error fetching compliance data:', error);
            }
            finally {
                setLoading(false);
            }
        };
        fetchComplianceData();
    }, [effectiveCompanyId, token]);
    const getStatusTheme = (status) => {
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
    // 1. Agent aur Address ke liye status mapping
    const mapAgentAddressStatus = (apiStatus, defaultStatus = 'Pending') => {
        if (!apiStatus)
            return defaultStatus;
        const lower = apiStatus.toLowerCase().trim();
        if (lower === 'active' || lower === 'done' || lower === 'completed')
            return 'Active';
        if (lower === 'expired' || lower === 'expired_soon' || lower === 'overdue')
            return 'Expired';
        if (lower === 'client managed' || lower === 'client_managed' || lower === 'managed')
            return 'Client Managed';
        return defaultStatus;
    };
    // 2. Federal aur Annual Filing ke liye status mapping
    const mapFederalAnnualStatus = (apiStatus) => {
        if (!apiStatus)
            return 'Pending';
        const lower = apiStatus.toLowerCase().trim();
        if (lower === 'completed' || lower === 'active' || lower === 'done')
            return 'Completed';
        if (lower === 'expired' || lower === 'expired_soon')
            return 'Expired';
        if (lower === 'client managed' || lower === 'client_managed' || lower === 'managed')
            return 'Client Managed';
        return 'Pending';
    };
    const federalTaxFilingData = apiData?.data?.federalTaxFiling || {};
    const residentData = apiData?.data?.resident || {};
    const addressData = apiData?.data?.Address || {};
    const annualFilingData = apiData?.data?.annualFiling || {};
    const derivedActions = [];
    const shouldShowRenewButton = (action) => {
        return action.status === 'Pending' || action.status === 'Expired';
    };
    const handleRenewPress = (action) => {
        onOpenRenewPage?.({
            id: action.id,
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
    const handleOpenHistory = (action) => {
        onOpenComplianceHistory?.({
            id: action.id,
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
        title: 'Agent Renewal Services',
        subtitle: 'Registered agent',
        status: mapAgentAddressStatus(residentData.status),
        date: formatDate(residentData.dueDate),
        icon: 'clock-o',
        details: [
            { label: 'Info', value: residentData.name || 'N/A', icon: 'user' },
            { label: 'Email', value: residentData.email || 'N/A', icon: 'envelope' },
            { label: 'Phone', value: residentData.phone || 'N/A', icon: 'phone' },
            { label: 'Due Date', value: formatDate(residentData.dueDate), icon: 'calendar' },
            { label: 'Last Filed', value: formatDate(residentData.lastDate), icon: 'history' },
        ],
        price: 149,
        years: 1,
    });
    // Address Renewal
    derivedActions.push({
        id: 'address',
        title: 'Address Renewal Services',
        subtitle: 'Registered address',
        status: mapAgentAddressStatus(addressData.status, 'Client Managed'),
        date: formatDate(addressData.dueDate),
        icon: 'clock-o',
        details: [
            { label: 'Street Address', value: addressData.address || 'N/A', icon: 'map-marker' },
            { label: 'State', value: addressData.state || 'N/A', icon: 'map' },
            { label: 'Postal Code', value: addressData.postalCode || 'N/A', icon: 'map-pin' },
            { label: 'Country', value: addressData.country || 'N/A', icon: 'globe' },
            { label: 'Due Date', value: formatDate(addressData.dueDate), icon: 'calendar' },
            { label: 'Last Filed', value: formatDate(addressData.lastDate), icon: 'history' },
        ],
        price: 99,
        years: 1,
    });
    // Federal Filing
    derivedActions.push({
        id: 'federal_filing',
        title: 'Federal Filing Services',
        subtitle: 'Annual federal tax',
        status: mapFederalAnnualStatus(federalTaxFilingData.status),
        date: formatDate(federalTaxFilingData.dueDate),
        icon: 'exclamation-circle',
        details: [
            { label: 'Due Date', value: formatDate(federalTaxFilingData.dueDate), icon: 'calendar' },
            { label: 'Last Filed', value: formatDate(federalTaxFilingData.lastDate), icon: 'history' },
        ],
    });
    // Annual Filing
    derivedActions.push({
        id: 'annual_filing',
        title: 'Annual Filing Services',
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

    const doneCount = derivedActions.filter(a => a.status === 'Active' || a.status === 'Completed' || a.status === 'Client Managed').length;
    const totalCount = derivedActions.length;
    const healthPercentage = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
    return (<ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* --- 1. PROFILE HEADER SECTION --- */}
        <View style={styles.header}>
            <View style={styles.profileContainer}>
                <View style={styles.avatarWrapper}>
                    <View style={[
                        styles.avatarPlaceholder,
                        avatarPlaceholder,
                    ]}>
                        <FontAwesome name="user" size={20} color={colors.accent} />
                    </View>
                    <View style={styles.activeDot} />
                </View>
                <View style={styles.userInfo}>
                    <Text style={[styles.userName, { color: colors.text }]}>
                        {selectedCompanyName ?? residentData?.name ?? 'Loading...'}
                    </Text>
                    <Text style={[styles.userEmail, { color: colors.muted }]}>
                        {residentData?.email || 'Email not added'}
                    </Text>
                </View>
            </View>
        </View>

        <AnimatedAppear index={3}>
            <View style={[styles.healthCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.healthHeader}>
                    <Text style={[styles.healthTitle, { color: colors.muted }]}>Compliance Health</Text>
                    <Text style={[styles.healthPercentage, { color: colors.text }]}>{healthPercentage}%</Text>
                </View>
                <View style={[styles.progressBarBackground, { backgroundColor: colors.background }]}>
                    <View style={[
                        styles.progressBarFill,
                        { backgroundColor: '#1E5631', width: `${healthPercentage}%` },
                    ]} />
                </View>
                <Text style={[styles.healthSubtext, { color: colors.muted }]}>
                    {doneCount} of {totalCount} actions complete
                </Text>
            </View>
        </AnimatedAppear>

        <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitleText, { color: colors.text }]}>COMPLIANCE ACTIONS</Text>
        </View>

        {loading ? (<ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 20 }} />) : (derivedActions.map((action, idx) => {
            const theme = getStatusTheme(action.status);
            return (<AnimatedAppear key={action.id} index={4 + idx}>
                <Pressable style={[
                    styles.mainCard,
                    mainCardStyle,
                ]} onPress={() => handleOpenHistory(action)}>
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
                                <Text style={[styles.dateText, { color: colors.muted }]}>{action.date}</Text>
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={[styles.badgeWrap, { backgroundColor: theme.bg }]}>
                                <Text style={[styles.badgeText, { color: theme.text }]}>{action.status}</Text>
                            </View>
                            <FontAwesome name="chevron-right" size={16} color={colors.muted} style={styles.arrowIcon} />
                        </View>
                    </View>

                    <View style={styles.bottomRow}>
                        {shouldShowRenewButton(action) ? (<Pressable onPress={() => handleRenewPress(action)} style={[styles.renewButton, { backgroundColor: colors.buttonBackground }]}>
                            <Text style={[styles.renewButtonText, { color: colors.textOnDark }]}>Renew Now</Text>
                            {/* <FontAwesome name="chevron-right" size={14} color={colors.muted} style={styles.arrowIcon}/> */}
                        </Pressable>) : null}
                    </View>
                </Pressable>
            </AnimatedAppear>);
        }))}
    </ScrollView>);
}
export default TabPlaceholder;
