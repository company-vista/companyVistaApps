import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, Text, View, ScrollView, TouchableOpacity, } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { BackButton } from '../../../../components/buttons';
import { useThemeColors } from '../../../../theme/colors';
import { font } from '../../../../theme/typography';
import { API_BASE_URL } from '../../../../config/api';
const STATUS_STEPS = {
    standard: [
        { title: 'Application Submitted', description: 'Your application is in queue for review.', timeframe: '0-1 day' },
        { title: 'Under Review', description: 'Our team is carefully reviewing your application.', timeframe: '1-2 days' },
        { title: 'Action Required', description: 'We need additional information from you to proceed.', timeframe: 'Varies' },
        { title: 'EIN In Progress', description: 'We are obtaining your EIN. Regular processing takes 45-80 days.', timeframe: '45-80 days' },
        { title: 'Completed', description: 'Your company registration is complete.', timeframe: 'Done' },
    ],
    express: [
        { title: 'Application Submitted', description: 'Your application is in queue for express review.', timeframe: '0-1 day' },
        { title: 'Under Review', description: 'Our team is reviewing your application with priority.', timeframe: '12-24 hrs' },
        { title: 'Action Required', description: 'We need additional information from you to proceed.', timeframe: 'Varies' },
        { title: 'EIN In Progress', description: 'We are obtaining your EIN with express processing.', timeframe: '5-15 days' },
        { title: 'Completed', description: 'Your company registration is complete.', timeframe: 'Done' },
    ],
    premium: [
        { title: 'Application Submitted', description: 'Your application is queued for premium processing.', timeframe: '0 hrs' },
        { title: 'Under Review', description: 'Dedicated specialist reviewing your application.', timeframe: '6-12 hrs' },
        { title: 'Action Required', description: 'We need additional information from you to proceed.', timeframe: 'Varies' },
        { title: 'EIN In Progress', description: 'We are obtaining your EIN with premium processing.', timeframe: '3-7 days' },
        { title: 'Completed', description: 'Your company registration is complete.', timeframe: 'Done' },
    ],
};
const STATUS_ORDER = ['pending', 'submitted', 'under_review', 'action_required', 'processing', 'completed', 'delivered', 'active'];
function getStatusIndex(status) {
    const normalized = status?.toLowerCase().replace(/\s+/g, '_') || 'pending';
    const idx = STATUS_ORDER.indexOf(normalized);
    return idx >= 0 ? idx : 0;
}
function getProgressPercent(status) {
    const idx = getStatusIndex(status);
    const totalSteps = STATUS_STEPS.standard.length;
    const mappedIdx = Math.min(idx, totalSteps - 1);
    return Math.round(((mappedIdx + 1) / totalSteps) * 100);
}
function formatDate(dateStr) {
    if (!dateStr)
        return '—';
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    catch {
        return dateStr;
    }
}
const TimelineStep = ({ title, description, timeframe, status }) => {
    const colors = useThemeColors();
    const isCurrent = status === 'current';
    const isCompleted = status === 'completed';
    return (<View style={styles.stepContainer}>
        <View style={styles.timelineLeft}>
            <View style={[
                styles.timelineDot,
                {
                    backgroundColor: isCurrent ? `${colors.primary}30` : isCompleted ? `${colors.primary}20` : colors.surface,
                    borderColor: isCurrent ? colors.primary : isCompleted ? colors.primary : colors.border,
                },
            ]}>
                {isCompleted && <FontAwesome name="check" size={8} color={colors.primary} />}
                {isCurrent && <View style={[styles.dotInner, { backgroundColor: colors.primary }]} />}
            </View>
            <View style={[styles.timelineLine, { backgroundColor: isCompleted ? colors.primary : colors.border }]} />
        </View>
        <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
                <Text style={[styles.stepTitle, { color: isCurrent ? colors.primary : isCompleted ? colors.text : colors.subtle }]}>{title}</Text>
                <Text style={[styles.stepTime, { color: colors.muted }]}>{timeframe}</Text>
            </View>
            <Text style={[styles.stepDescription, { color: colors.muted }]}>{description}</Text>
        </View>
    </View>);
};
const PACKAGE_LABELS = {
    standard: 'Standard - 45-80 Days',
    express: 'Express - 5-15 Days',
    premium: 'Premium - 3-7 Days',
};
const PACKAGE_TIMES = {
    standard: ['• Normal Filing (1-3 days)', '• Standard EIN (45-80 days)'],
    express: ['• Priority Filing (12-24 hrs)', '• Express EIN (5-15 days)'],
    premium: ['• Premium Filing (6-12 hrs)', '• Premium EIN (3-7 days)'],
};
export default function RegistrationTrackingScreen({ onBackPress, onAddCompany, onEditPress, onContactSupport, companyId, onRefreshCompanies }) {
    const safeAreaInsets = useSafeAreaInsets();
    const colors = useThemeColors();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [company, setCompany] = useState(null);
    const [error, setError] = useState(null);
    const fetchCompany = useCallback(async (silent = false) => {
        if (!companyId) {
            setError('No company ID provided.');
            setLoading(false);
            return;
        }
        try {
            if (!silent)
                setLoading(true);
            const res = await axios.get(`${API_BASE_URL}/api/companies/${companyId}`);
            setCompany(res.data.data || res.data);
            setError(null);
        }
        catch (e) {
            setError(e?.response?.data?.message || 'Failed to load registration details.');
        }
        finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [companyId]);
    useEffect(() => {
        fetchCompany();
    }, [fetchCompany]);
    const prevStatusRef = React.useRef('');
    useEffect(() => {
        if (!company)
            return;
        const currentStatus = company.registrationStatus || 'pending';
        if (prevStatusRef.current && prevStatusRef.current !== currentStatus) {
            Toast.show({
                type: 'success',
                text1: 'Status Updated',
                text2: `Registration is now: ${currentStatus.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}`,
            });
        }
        prevStatusRef.current = currentStatus;
    }, [company]);
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchCompany(true);
        onRefreshCompanies?.();
    }, [fetchCompany, onRefreshCompanies]);
    if (loading) {
        return (<View style={styles.container}>
            <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: safeAreaInsets.top }]}>
                <BackButton onPress={onBackPress} />
                <Text style={[styles.headerTitle, { color: colors.text }]}>Registration Tracking</Text>
            </View>
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.muted }]}>Loading registration…</Text>
            </View>
        </View>);
    }
    if (error || !company) {
        return (<View style={styles.container}>
            <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: safeAreaInsets.top }]}>
                <BackButton onPress={onBackPress} />
                <Text style={[styles.headerTitle, { color: colors.text }]}>Registration Tracking</Text>
            </View>
            <View style={styles.centered}>
                <FontAwesome name="exclamation-circle" size={40} color={colors.danger} />
                <Text style={[styles.errorText, { color: colors.text }]}>{error || 'Registration not found.'}</Text>
                <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={() => fetchCompany()}>
                    <Text style={[styles.retryText, { color: colors.primaryText }]}>Retry</Text>
                </TouchableOpacity>
            </View>
        </View>);
    }
    const status = company.registrationStatus || 'pending';
    const normalizedStatus = status.toLowerCase().replace(/\s+/g, '_');
    const selectedPkg = company.selectedPackage || 'standard';
    const steps = STATUS_STEPS[selectedPkg] || STATUS_STEPS.standard;
    const statusIdx = getStatusIndex(status);
    const progress = getProgressPercent(status);
    const pkgLabel = PACKAGE_LABELS[selectedPkg] || PACKAGE_LABELS.standard;
    const pkgTimes = PACKAGE_TIMES[selectedPkg] || PACKAGE_TIMES.standard;
    const getStepStatus = (index) => {
        if (index < statusIdx)
            return 'completed';
        if (index === statusIdx)
            return 'current';
        return 'pending';
    };
    const nextStep = steps[statusIdx + 1];
    return (<View style={styles.container}>
        <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: safeAreaInsets.top }]}>
            <BackButton onPress={onBackPress} />
            <Text style={[styles.headerTitle, { color: colors.text }]}>Registration Tracking</Text>
            {onAddCompany && (<TouchableOpacity style={[styles.addCompanyBtn, { backgroundColor: colors.primary }]} onPress={onAddCompany}>
                <FontAwesome name="plus" color={colors.primaryText} size={16} />
            </TouchableOpacity>)}
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingBottom: safeAreaInsets.bottom + 24 }]} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}>
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.headerRow}>
                    <View style={[styles.iconContainer, { backgroundColor: colors.surfaceAlt }]}>
                        <FontAwesome name="file-text-o" color={colors.primary} size={24} />
                    </View>
                    <View style={styles.headerTextContainer}>
                        <View style={styles.badgeRow}>
                            <Text style={[styles.cardTitle, { color: colors.text }]}>{steps[statusIdx]?.title || 'Submitted'}</Text>
                            <View style={[styles.badge, { backgroundColor: `${colors.primary}20`, borderColor: colors.primary }]}>
                                <Text style={[styles.badgeText, { color: colors.primary }]}>{progress}%</Text>
                            </View>
                        </View>
                        <Text style={[styles.cardSubtitle, { color: colors.muted }]}>{steps[statusIdx]?.description || 'Your application is in queue.'}</Text>
                    </View>
                </View>

                <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
                    <View style={[styles.progressBarFill, { backgroundColor: colors.primary, width: `${progress}%` }]} />
                </View>
                <Text style={[styles.progressText, { color: colors.subtle }]}>Overall Progress: {progress}%</Text>

                {nextStep && (<Text style={[styles.nextStepText, { color: colors.text }]}>
                    <Text style={{ fontWeight: '600', color: colors.muted }}>Next: </Text>
                    {nextStep.title} ({nextStep.timeframe})
                </Text>)}

                {normalizedStatus === 'completed' || normalizedStatus === 'delivered' || normalizedStatus === 'active' ? (<View style={[styles.editIconBtn, { backgroundColor: '#22c55e', alignSelf: 'flex-end' }]}>
                    <FontAwesome name="check" size={16} color="#ffffff" />
                </View>) : (<TouchableOpacity style={[styles.editIconBtn, { backgroundColor: '#ef4444', alignSelf: 'flex-end' }]} onPress={() => onEditPress?.(companyId ?? undefined)}>
                    <FontAwesome name="pencil" size={16} color="#ffffff" />
                </TouchableOpacity>)}
            </View>

            <View style={styles.metaContainer}>
                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, flex: 1, marginBottom: 12 }]}>
                    <Text style={[styles.sectionLabel, { color: colors.subtle }]}>Selected Package</Text>
                    <View style={styles.packageHeader}>
                        <Text style={[styles.packageMainText, { color: colors.text }]}>{selectedPkg.charAt(0).toUpperCase() + selectedPkg.slice(1)}</Text>
                        <View style={[styles.timeBadge, { backgroundColor: colors.surfaceAlt }]}>
                            <Text style={[styles.timeBadgeText, { color: colors.subtle }]}>{pkgLabel.split(' - ')[1] || ''}</Text>
                        </View>
                    </View>
                    {pkgTimes.map((t, i) => (<Text key={i} style={[styles.metaDetailText, { color: colors.muted }]}>{t}</Text>))}
                </View>

                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.sectionLabel, { color: colors.subtle }]}>Company Details</Text>

                    <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.detailLabel, { color: colors.subtle }]}>COMPANY NAME</Text>
                        <Text style={[styles.detailValue, { color: colors.text }]}>{company.companyName || '—'}</Text>
                    </View>
                    <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.detailLabel, { color: colors.subtle }]}>TYPE</Text>
                        <Text style={[styles.detailValue, { color: colors.text }]}>{company.companyType || company.entityType || '—'}</Text>
                    </View>
                    <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.detailLabel, { color: colors.subtle }]}>JURISDICTION</Text>
                        <Text style={[styles.detailValue, { color: colors.text }]}>{company.countryOfIncorporation || '—'}</Text>
                    </View>
                    <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.detailLabel, { color: colors.subtle }]}>STATE</Text>
                        <Text style={[styles.detailValue, { color: colors.text }]}>{company.stateOfRegistration || '—'}</Text>
                    </View>
                    <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.detailLabel, { color: colors.subtle }]}>SUBMITTED ON</Text>
                        <Text style={[styles.detailValue, { color: colors.text }]}>{formatDate(company.submittedAt || company.createdAt)}</Text>
                    </View>
                </View>
            </View>

            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.packageHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Registration Process</Text>
                    <View style={[styles.timeBadge, { backgroundColor: colors.surfaceAlt }]}>
                        <Text style={[styles.timeBadgeText, { color: colors.subtle }]}>{pkgLabel}</Text>
                    </View>
                </View>
                <Text style={[styles.cardSubtitle, { color: colors.muted, marginBottom: 20 }]}>
                    {selectedPkg === 'standard' && 'Standard filing with regular processing times.'}
                    {selectedPkg === 'express' && 'Priority filing with faster processing.'}
                    {selectedPkg === 'premium' && 'Premium filing with dedicated specialist.'}
                </Text>

                {steps.map((step, index) => (<TimelineStep key={index} title={step.title} description={step.description} timeframe={step.timeframe} status={getStepStatus(index)} />))}
            </View>

            <View style={[styles.helpCard, { backgroundColor: colors.mode === 'dark' ? colors.surfaceAlt : colors.primary }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <FontAwesome name="question-circle" color={colors.mode === 'dark' ? colors.accent : colors.primaryText} size={20} style={{ marginRight: 8 }} />
                    <Text style={[styles.helpTitle, { color: colors.mode === 'dark' ? colors.text : colors.primaryText }]}>Need Help?</Text>
                </View>
                <Text style={[styles.helpSubtitle, { color: colors.mode === 'dark' ? colors.muted : colors.primaryText }]}>Have questions? Our support team is ready.</Text>
                <TouchableOpacity style={[styles.helpButton, { backgroundColor: colors.mode === 'dark' ? colors.buttonBackground : colors.buttonBackground }]} onPress={onContactSupport}>
                    <Text style={[styles.helpButtonText, { color: colors.mode === 'dark' ? colors.primaryText : colors.buttonText }]}>Contact Support</Text>
                </TouchableOpacity>
            </View>

        </ScrollView>
    </View>);
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 12,
        gap: 12,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: font.heading,
        fontWeight: '600',
        flex: 1,
    },
    addCompanyBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    loadingText: {
        fontSize: font.md,
        marginTop: 12,
    },
    errorText: {
        fontSize: font.lg,
        marginTop: 12,
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 16,
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryText: {
        fontSize: font.md,
        fontWeight: '600',
    },
    scrollContent: {
        padding: 16,
    },
    card: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconContainer: {
        padding: 10,
        borderRadius: 12,
        marginRight: 12,
    },
    headerTextContainer: {
        flex: 1,
    },
    badgeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: font.xxl,
        fontWeight: '700',
    },
    cardSubtitle: {
        fontSize: font.md,
        marginTop: 2,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        borderWidth: 1,
    },
    badgeText: {
        fontSize: font.sm,
        fontWeight: '600',
    },
    progressBarBg: {
        height: 6,
        borderRadius: 3,
        marginVertical: 12,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    progressText: {
        fontSize: font.sm,
        textAlign: 'right',
        marginBottom: 8,
    },
    nextStepText: {
        fontSize: font.md,
        marginBottom: 16,
        flex: 1,
    },
    editIconBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    editButton: {
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    editButtonText: {
        fontSize: font.lg,
        fontWeight: '600',
    },
    metaContainer: {
        marginBottom: 4,
    },
    sectionLabel: {
        fontSize: font.sm,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: font.xxl,
        fontWeight: '700',
    },
    packageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    packageMainText: {
        fontSize: font.heading,
        fontWeight: '700',
    },
    timeBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    timeBadgeText: {
        fontSize: font.sm,
        fontWeight: '600',
    },
    metaDetailText: {
        fontSize: font.md,
        marginVertical: 2,
    },
    detailRow: {
        borderBottomWidth: 1,
        paddingVertical: 10,
    },
    detailLabel: {
        fontSize: font.sm,
        fontWeight: '600',
    },
    detailValue: {
        fontSize: font.lg,
        fontWeight: '500',
        marginTop: 2,
    },
    stepContainer: {
        flexDirection: 'row',
        minHeight: 70,
    },
    timelineLeft: {
        alignItems: 'center',
        marginRight: 12,
    },
    timelineDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 4,
    },
    dotInner: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    timelineLine: {
        flex: 1,
        width: 2,
        marginVertical: 4,
    },
    stepContent: {
        flex: 1,
        paddingBottom: 16,
    },
    stepHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    stepTitle: {
        fontSize: font.lg,
        fontWeight: '600',
    },
    stepTime: {
        fontSize: font.base,
    },
    stepDescription: {
        fontSize: font.base,
        marginTop: 4,
    },
    helpCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
    },
    helpTitle: {
        fontSize: font.xxl,
        fontWeight: '700',
    },
    helpSubtitle: {
        fontSize: font.md,
        marginBottom: 16,
    },
    helpButton: {
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    helpButtonText: {
        fontSize: font.lg,
        fontWeight: '600',
    },
});
