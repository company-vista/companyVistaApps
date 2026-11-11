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
import { useCompanyCompliance, normalizeText } from '../hooks/useCompanyCompliance';
const STATUS_ORDER = ['Expired', 'Overdue', 'Expiring Soon', 'Pending', 'Client Managed', 'Active', 'Completed'];
const COUNTRY_LABELS = {
    usa: { federal: 'Federal Filing', state: 'State Filing', agent: 'Agent & Address' },
    'united states': { federal: 'Federal Filing', state: 'State Filing', agent: 'Agent & Address' },
    canada: { federal: 'GST/HST Filing', state: 'Annual Return', agent: 'Registered Agent & Office' },
    ca: { federal: 'GST/HST Filing', state: 'Annual Return', agent: 'Registered Agent & Office' },
};

function getCountryLabels(country) {
    const key = String(country ?? '').trim().toLowerCase();
    return COUNTRY_LABELS[key] ?? {
        federal: 'Corporate Tax Filing',
        state: 'Annual Government Filing',
        agent: 'Local Compliance Partner & Address',
    };
}

function isUnitedKingdom(country) {
    const value = String(country ?? '').trim().toLowerCase();
    return value === 'uk' || value === 'united kingdom';
}

function isExpiringSoon(dueDate) {
    if (!dueDate) return false;
    const due = new Date(dueDate);
    if (Number.isNaN(due.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysRemaining = Math.ceil((due.getTime() - today.getTime()) / 86400000);
    return daysRemaining >= 0 && daysRemaining <= 30;
}

function getComplianceStatus(apiStatus, dueDate, isFiling = false) {
    const status = normalizeText(apiStatus);
    if (status === 'client managed' || status === 'managed') return 'Client Managed';
    if (status === 'completed' || status === 'active' || status === 'done') {
        return isFiling ? 'Completed' : 'Active';
    }
    if (status === 'expired' || status === 'expired soon' || status === 'overdue') return 'Expired';
    if (status === 'expiring soon') return 'Expiring Soon';
    if (status === 'inprocess') return 'In Process';
    if (status === 'pending' && dueDate) {
        const due = new Date(dueDate);
        if (!Number.isNaN(due.getTime())) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const daysRemaining = Math.ceil((due.getTime() - today.getTime()) / 86400000);
            if (daysRemaining < 0) return 'Overdue';
            if (daysRemaining <= 30) return 'Expiring Soon';
        }
    }
    if (status === 'expiring_soon' || isExpiringSoon(dueDate)) return 'Expiring Soon';
    return 'Pending';
}

function formatStatusLabel(value) {
    const status = normalizeText(value);
    if (!status) {
        return 'N/A';
    }
    if (status === 'expiring soon') return 'Expiring Soon';
    if (status === 'client managed') return 'Client Managed';
    return status.charAt(0).toUpperCase() + status.slice(1);
}
function getWorstStatus(...statuses) {
    let worst = statuses[0];
    for (const status of statuses) {
        const a = STATUS_ORDER.indexOf(status);
        const b = STATUS_ORDER.indexOf(worst);
        const rankA = a === -1 ? Infinity : a;
        const rankB = b === -1 ? Infinity : b;
        if (rankA < rankB) {
            worst = status;
        }
    }
    return worst;
}
function TabPlaceholder({ icon = 'exclamation-circle', title = 'Address Compliance', companyId, selectedCompanyName, countryOfIncorporation, onOpenRenewPage, onOpenComplianceHistory, }) {
    const colors = useThemeColors();
    const token = useAppSelector(state => state.auth.token);
    const [apiData, setApiData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const effectiveCompanyId = companyId ?? null;
    const hasCompany = Boolean(effectiveCompanyId);
    const isUKCompany = isUnitedKingdom(countryOfIncorporation);
    const [ukCompliance, setUkCompliance] = useState(null);
    const { statusesByTitle } = useCompanyCompliance(isUKCompany ? null : effectiveCompanyId);

    const mainCardStyle = {
        backgroundColor: colors.mode === 'dark' ? colors.cardElevated : colors.cardHighlight,
        borderColor: colors.mode === 'dark' ? 'rgba(255,255,255,0.08)' : colors.border,
        marginBottom: 12,
    }

    useEffect(() => {
        let isMounted = true;
        const fetchComplianceData = async () => {
            if (!token || !effectiveCompanyId) {
                setApiData(null);
                setUkCompliance(null);
                setLoadError(Boolean(effectiveCompanyId && !token));
                setLoading(false);
                return;
            }
            setLoading(true);
            setApiData(null);
            setUkCompliance(null);
            setLoadError(false);
            try {
                const endpoint = isUKCompany ? 'uk-compliance/core' : 'company-compliance';
                const response = await axios.get(`${API_BASE_URL}/api/${endpoint}/${effectiveCompanyId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'x-auth-token': token,
                    },
                });
                if (isMounted) {
                    if (isUKCompany) setUkCompliance(response?.data?.data ?? null);
                    else setApiData(response?.data);
                }
            }
            catch {
                if (isMounted) {
                    setApiData(null);
                    setUkCompliance(null);
                    setLoadError(true);
                }
            }
            finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchComplianceData();
        return () => {
            isMounted = false;
        };
    }, [effectiveCompanyId, token, isUKCompany, refreshKey]);
    const getStatusTheme = (status) => {
        const isDark = colors.mode === 'dark';
        const key = String(status ?? '').toLowerCase().trim();
        if (key === 'expired' || key === 'overdue') {
            return { text: isDark ? '#FCA5A5' : '#DE3730', bg: isDark ? '#3D1717' : '#FCE8E6' };
        }
        if (key === 'pending' || key === 'due' || key === 'expiring soon' || key === 'expiring_soon') {
            return { text: isDark ? '#FCD34D' : '#E28704', bg: isDark ? '#3A2A15' : '#FEF3D6' };
        }
        if (key === 'active' || key === 'completed') {
            return { text: isDark ? '#6EE7B7' : '#256F46', bg: isDark ? '#15352A' : '#E6F4EA' };
        }
        if (key === 'in process') {
            return { text: isDark ? '#93C5FD' : '#1D4ED8', bg: isDark ? '#172554' : '#DBEAFE' };
        }
        if (key === 'client managed') {
            return { text: isDark ? '#94A3B8' : '#4A5568', bg: isDark ? '#1E293B' : '#EDF2F7' };
        }
        return { text: isDark ? '#94A3B8' : '#4A5568', bg: isDark ? '#1E293B' : '#EDF2F7' };
    };
    const federalTaxFilingData = apiData?.data?.federalTaxFiling || {};
    const residentData = apiData?.data?.resident || {};
    const addressData = apiData?.data?.Address || {};
    const annualFilingData = apiData?.data?.annualFiling || {};
    const labels = getCountryLabels(countryOfIncorporation);
    const derivedActions = [];
    const shouldShowRenewButton = (action) => {
        return action.complianceSource !== 'uk' &&
            ['Pending', 'Expired', 'Overdue', 'Expiring Soon'].includes(action.status);
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
            complianceSource: action.complianceSource,
            price: action.price,
            years: action.years,
        });
    };
    if (isUKCompany) {
        [
            { id: 'AnnAccRegOff', title: 'Registered Office', subtitle: 'Registered office address', icon: 'building' },
            { id: 'AnnualAccounts', title: 'Annual Accounts', subtitle: 'Statutory annual accounts', icon: 'file-text' },
            { id: 'ConfStatement', title: 'Confirmation Statement', subtitle: 'Annual confirmation statement', icon: 'check-square-o' },
        ].forEach(item => {
            const data = ukCompliance?.[item.id] ?? {};
            derivedActions.push({
                ...item,
                complianceSource: 'uk',
                status: getComplianceStatus(data.status, data.dueDate, true),
                date: formatDate(data.dueDate),
                details: [
                    { label: 'Applicable Year', value: data.applicableYear || 'N/A', icon: 'calendar' },
                    { label: 'Due Date', value: formatDate(data.dueDate), icon: 'calendar' },
                    { label: 'Last Filed', value: formatDate(data.lastDate), icon: 'history' },
                    { label: 'Status', value: formatStatusLabel(data.status), icon: 'check-circle' },
                ],
            });
        });
    }
    else {
    const residentStatus = getComplianceStatus(residentData.status, residentData.dueDate);
    const addressStatus = getComplianceStatus(addressData.status || 'client_managed', addressData.dueDate);
    // Agent & Address
    derivedActions.push({
        id: 'agent_address',
        title: labels.agent,
        subtitle: countryOfIncorporation === 'Canada' || countryOfIncorporation === 'CA'
            ? 'Corporate representative + registered office'
            : countryOfIncorporation === 'United States' || countryOfIncorporation === 'USA'
                ? 'Registered agent & address'
                : 'Local representative + registered address',
        status: statusesByTitle['Agent & Address']
            ? formatStatusLabel(statusesByTitle['Agent & Address'])
            : getWorstStatus(residentStatus, addressStatus),
        date: formatDate(addressData.dueDate || residentData.dueDate),
        icon: 'building',
        details: [
            { label: 'Applicable Year', value: addressData.dueDate || residentData.dueDate ? String(new Date(addressData.dueDate || residentData.dueDate).getFullYear() - 1) : 'N/A', icon: 'calendar' },
            { label: 'Info', value: residentData.name || 'N/A', icon: 'user' },
            { label: 'Email', value: residentData.email || 'N/A', icon: 'envelope' },
            { label: 'Phone', value: residentData.phone || 'N/A', icon: 'phone' },
            { label: 'Street Address', value: addressData.address || 'N/A', icon: 'map-marker' },
            { label: 'State', value: addressData.state || 'N/A', icon: 'map' },
            { label: 'Postal Code', value: addressData.postalCode || 'N/A', icon: 'map-pin' },
            { label: 'Country', value: addressData.country || 'N/A', icon: 'globe' },
            { label: 'Due Date', value: formatDate(addressData.dueDate || residentData.dueDate), icon: 'calendar' },
            { label: 'Last Filed', value: formatDate(addressData.lastDate || residentData.lastDate), icon: 'history' },
        ],
        price: 99,
        years: 1,
    });
    // Federal Filing
    derivedActions.push({
        id: 'federal_filing',
        title: labels.federal,
        subtitle: countryOfIncorporation === 'Canada' || countryOfIncorporation === 'CA'
            ? 'Federal GST/HST'
            : countryOfIncorporation === 'United States' || countryOfIncorporation === 'USA'
                ? 'Annual federal tax'
                : 'Corporate tax filing',
        status: statusesByTitle['Federal Filing']
            ? formatStatusLabel(statusesByTitle['Federal Filing'])
            : getComplianceStatus(federalTaxFilingData.status, federalTaxFilingData.dueDate, true),
        date: formatDate(federalTaxFilingData.dueDate),
        icon: 'exclamation-circle',
        details: [
            { label: 'Applicable Year', value: federalTaxFilingData.applicableYear || federalTaxFilingData.taxYear || 'N/A', icon: 'calendar' },
            { label: 'Due Date', value: formatDate(federalTaxFilingData.dueDate), icon: 'calendar' },
            { label: 'Last Filed', value: formatDate(federalTaxFilingData.lastDate), icon: 'history' },
        ],
    });
    // Annual Filing
    derivedActions.push({
        id: 'annual_filing',
        title: labels.state,
        subtitle: countryOfIncorporation === 'Canada' || countryOfIncorporation === 'CA'
            ? 'Annual corporate return'
            : countryOfIncorporation === 'United States' || countryOfIncorporation === 'USA'
                ? 'State compliance'
                : 'Government filing',
        status: statusesByTitle['State Filing']
            ? formatStatusLabel(statusesByTitle['State Filing'])
            : getComplianceStatus(annualFilingData.status, annualFilingData.dueDate, true),
        date: formatDate(annualFilingData.dueDate),
        icon: 'check-circle',
        details: [
            { label: 'Applicable Year', value: annualFilingData.applicableYear || annualFilingData.fiscalYear || 'N/A', icon: 'calendar' },
            { label: 'Due Date', value: formatDate(annualFilingData.dueDate), icon: 'calendar' },
            { label: 'Last Filed', value: formatDate(annualFilingData.lastDate), icon: 'history' },
        ],
        price: 149,
        years: 1,
    });
    }

    const doneCount = derivedActions.filter(a => a.status === 'Active' || a.status === 'Completed' || a.status === 'Client Managed').length;
    const totalCount = derivedActions.length;
    const healthPercentage = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
    return (<ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {!loadError && hasCompany && !loading ? (<AnimatedAppear index={3}>
            <View style={[styles.healthCard, {
                backgroundColor: colors.mode === 'dark' ? colors.cardElevated : colors.cardHighlight,
                borderColor: colors.mode === 'dark' ? 'rgba(255,255,255,0.08)' : colors.border,
            }]}>
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
                    {doneCount} of {totalCount} Actions Complete
                </Text>
            </View>
        </AnimatedAppear>) : null}

        {!loadError && hasCompany && !loading ? (<View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitleText, { color: colors.text }]}>Compliance Actions</Text>
        </View>) : null}

        {loading ? (<ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 20 }} />) : !hasCompany ? (
            <View style={[styles.mainCard, mainCardStyle]}>
                <Text style={[styles.sectionSubtitle, { color: colors.muted }]}>Select a company to view its compliance data.</Text>
            </View>
        ) : loadError ? (
            <View style={[styles.mainCard, mainCardStyle]}>
                <Text style={[styles.sectionSubtitle, { color: colors.muted }]}>Compliance data could not be loaded.</Text>
                <Pressable onPress={() => setRefreshKey(value => value + 1)} style={[styles.renewButton, { backgroundColor: colors.buttonBackground }]}>
                    <Text style={[styles.renewButtonText, { color: colors.buttonText }]}>Retry</Text>
                </Pressable>
            </View>
        ) : (derivedActions.map((action, idx) => {
            const theme = getStatusTheme(action.status);
            const year = action.details.find(detail => detail.label === 'Applicable Year')?.value;
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
                            {year && year !== 'N/A'
                                ? <Text style={[styles.dateText, { color: colors.muted }]} numberOfLines={1}>Year: {year}</Text>
                                : null}
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

                        <FontAwesome name="chevron-right" size={16} color={colors.muted} style={styles.arrowIcon} />
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <View style={styles.bottomRow}>
                        <View style={[styles.badgeWrap, { backgroundColor: colors.mode === 'dark' && action.status === 'Pending' ? 'transparent' : theme.bg }]}>
                            <Text style={[styles.badgeText, { color: theme.text }]}>{action.status}</Text>
                        </View>
                        {shouldShowRenewButton(action) ? (<Pressable onPress={(event) => {
                            event.stopPropagation();
                            handleRenewPress(action);
                        }} style={[styles.renewButton, { backgroundColor: colors.buttonBackground }]}>
                            <Text style={[styles.renewButtonText, { color: colors.buttonText }]}>Renew Now</Text>
                            {/* <FontAwesome name="chevron-right" size={14} color={colors.muted} style={styles.arrowIcon}/> */}
                        </Pressable>) : null}
                    </View>
                </Pressable>
            </AnimatedAppear>);
        }))}
    </ScrollView>);
}
export default TabPlaceholder;
