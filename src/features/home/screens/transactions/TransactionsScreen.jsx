import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View, } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useThemeColors } from '../../../../theme/colors';
import { useAppSelector } from '../../../../store/hooks';
import DocumentNotFound from '../../../../components/emptyState/DocumentNotFound';
import TransactionDetailScreen from './TransactionDetailScreen';
import { fetchSubscriptionPayments } from '../../api/subscriptionPaymentsApi';
import { formatDate } from '../../../../constants/dateFormatter';
import { matchesTransactionSearch, } from './transactionsUtils';
import { formatCurrency } from '../../../../constants/currencyConverter';
import { s } from '../../../../theme/responsive';
import { font } from '../../../../theme/typography';
import { UNPAID_REGISTRATION_STATUSES, normalizeRegistrationStatus } from '../../../../utils/companyStatus';


function formatAmountField(value, currency) {
    const resolvedCurrency = currency && currency.trim() ? currency : 'USD';
    if (value === undefined || value === null || value === '') {
        return formatCurrency(0, resolvedCurrency);
    }
    if (typeof value === 'number') {
        return formatCurrency(value, resolvedCurrency);
    }
    const parsed = Number(String(value).replace(/[^0-9.-]+/g, ''));
    return Number.isFinite(parsed)
        ? formatCurrency(parsed, resolvedCurrency)
        : String(value);
}
function parseApiAmount(value) {
    if (typeof value === 'number') {
        return value;
    }
    const parsed = Number(String(value).replace(/[^0-9.-]+/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
}
function getApiStatus(value, isActive) {
    if (isActive)
        return 'Active';
    if (typeof value === 'string' && value.trim()) {
        const normalized = value.trim().toLowerCase().replace(/[_\-]+/g, ' ').trim();
        const isSuccess = normalized === 'success' || normalized === 'succeeded' || normalized === 'successful' || normalized === 'paid' || normalized === 'completed' || normalized === 'confirmed';
        const isFailed = normalized === 'failed' || normalized === 'fail' || normalized === 'declined' || normalized === 'cancelled' || normalized === 'canceled' || normalized === 'error';
        const isPending = normalized === 'pending' || normalized === 'unpaid' || normalized === 'not paid' || normalized === 'awaiting payment' || normalized === 'payment pending' || normalized === 'processing' || normalized === 'incomplete';
        // Check in strict order - "not paid" / "unpaid" ko "paid" mat samjho
        if (isFailed) return 'Failed';
        if (isPending) return 'Pending';
        if (isSuccess) return 'Success';
        if (normalized.includes('active')) return 'Active';
        if (normalized.includes('fail') || normalized.includes('decline') || normalized.includes('cancel')) {
            return 'Failed';
        }
        if (normalized.includes('pending') || normalized.includes('unpaid') || normalized.includes('awaiting')) {
            return 'Pending';
        }
        if (normalized.includes('success') || normalized.includes('succeed') || normalized.includes('paid') || normalized.includes('paid')) {
            return 'Success';
        }
        return value.trim().charAt(0).toUpperCase() + value.trim().slice(1);
    }
    return 'Pending';
}
// Company ka registration status unpaid hai to uska transaction "Success" nahi ho sakta.
// Backend kabhi payment record me galat success bhej deta hai, isliye company status se cross-check karo.
const normalizeRegStatus = normalizeRegistrationStatus;
const UNPAID_REG_STATUSES = UNPAID_REGISTRATION_STATUSES;
function buildCompanyStatusIndex(companies) {
    const index = {};
    (Array.isArray(companies) ? companies : []).forEach(company => {
        if (!company) return;
        const id = String(company._id ?? company.id ?? company.companyId ?? '').trim();
        if (!id) return;
        index[id] = normalizeRegStatus(company.registrationStatus ?? company.registration_status ?? company.status ?? '');
    });
    return index;
}
function normalizeApiTransaction(item, companyStatusIndex = {}) {
    const title = item.title ||
        item.name ||
        (typeof item.company === 'object' && item.company !== null
            ? item.company.companyName
            : undefined) ||
        item.description ||
        item.type?.replace(/_/g, ' ') ||
        'Payment';
    const amountNumber = parseApiAmount(item.amount ?? item.onlineAmount ?? item.cashAmount);
    const onlineAmountNumber = parseApiAmount(item.onlineAmount);
    const cashAmountNumber = parseApiAmount(item.cashAmount);
    const statusValue = getApiStatus(item.status, item.isActive);
    const companyId = typeof item.company === 'object' && item.company !== null
        ? String(item.company._id ?? item.company.id ?? '')
        : String(item.company ?? '');
    // Company registration payment_pending hai par backend ne "success" bheja -> Pending dikhao
    const regStatus = companyStatusIndex[companyId] ?? '';
    const finalStatus = UNPAID_REG_STATUSES.includes(regStatus) && statusValue === 'Success'
        ? 'Pending'
        : statusValue;
    const details = {
        _id: String(item._id ?? item.id ?? item.transactionId ?? 'unknown'),
        amount: amountNumber,
        onlineAmount: Number.isFinite(onlineAmountNumber)
            ? onlineAmountNumber
            : undefined,
        cashAmount: Number.isFinite(cashAmountNumber)
            ? cashAmountNumber
            : undefined,
        currency: String(item.currency ?? 'USD').toUpperCase(),
        date: item.date ?? item.createdAt ?? '',
        status: finalStatus.toLowerCase(),
        type: String(item.type ?? item.category ?? 'payment'),
        description: String(item.description ?? item.title ?? 'Payment record'),
        notes: String(item.notes ?? ''),
        company: companyId,
        paymentMethod: String(item.method ?? item.paymentMethod ?? ''),
        referenceId: String(item.referenceId ?? ''),
        transactionId: String(item.transactionId ?? item.referenceId ?? item._id ?? ''),
        gateway: String(item.gateway ?? ''),
        bankName: String(item.bankName ?? ''),
        accountLast4: String(item.accountLast4 ?? ''),
        createdBy: String(item.createdBy ?? ''),
        isActive: Boolean(item.isActive ?? true),
        createdAt: item.createdAt ?? item.date ?? '',
        updatedAt: item.updatedAt ?? item.date ?? '',
        invoice: item.invoice ?? null,
    };
    return {
        id: String(item._id ??
            item.id ??
            item.transactionId ??
            item.referenceId ??
            title ??
            'unknown'),
        title,
        date: item.date ?? item.createdAt ?? '',
        amount: formatAmountField(amountNumber, item.currency),
        onlineAmount: Number.isFinite(onlineAmountNumber)
            ? formatAmountField(onlineAmountNumber, item.currency)
            : undefined,
        cashAmount: Number.isFinite(cashAmountNumber)
            ? formatAmountField(cashAmountNumber, item.currency)
            : undefined,
        status: finalStatus,
        method: String(item.method ?? item.paymentMethod ?? 'Unknown'),
        category: String(item.category ?? item.type ?? 'Payment'),
        details,
    };
}
// Backend kabhi ek hi payment record ko multiple rows me bhej deta hai (ya _id ke bina).
// Isliye stable identity se ek hi entry rakhte hain - warna list me duplicate dikhta hai.
function dedupeApiTransactions(items) {
    const seen = new Set();
    return (Array.isArray(items) ? items : []).filter(item => {
        const details = item?.details ?? {};
        const strongId = String(details._id ?? '').trim();
        const txnId = String(details.transactionId ?? '').trim();
        const refId = String(details.referenceId ?? '').trim();
        const identity = strongId && strongId !== 'unknown'
            ? `id:${strongId}`
            : (txnId || refId)
                ? `txn:${txnId || refId}`
                // Koi id nahi to content se banana padega, warna alag payments merge ho jayenge
                : `composite:${details.company ?? ''}|${details.amount ?? item?.amount ?? ''}|${item?.date ?? ''}|${item?.type ?? item?.category ?? ''}|${item?.status ?? ''}`;
        if (seen.has(identity)) {
            return false;
        }
        seen.add(identity);
        return true;
    });
}
export default function TransactionsScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const companyId = route.params?.companyId;
    const safeAreaInsets = useSafeAreaInsets();
    const colors = useThemeColors();
    const token = useAppSelector(state => state.auth.token);
    const rawCompanies = useAppSelector(state => state.auth.user?.companies);
    const userCompanies = useMemo(() => rawCompanies ?? [], [rawCompanies]);
    const hasNoCompany = userCompanies.length === 0;
    const [activeFilter, setActiveFilter] = useState('All');
    const [selectedCurrency, setSelectedCurrency] = useState(null);
    const [search, setSearch] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    // Company registration status ka index - payment pending wali company ka transaction
    // Success nahi dikhna chahiye, chahe backend payment record me aisa bhej de
    const companyStatusIndex = useMemo(() => buildCompanyStatusIndex(userCompanies), [userCompanies]);
    useEffect(() => {
        let isMounted = true;
        async function loadTransactions() {
            setIsLoading(true);
            setErrorMessage('');
            try {
                const response = await fetchSubscriptionPayments(token ?? undefined);
                if (!isMounted)
                    return;
                if (response.isSuccess) {
                    const normalized = response.payments.map(payment => normalizeApiTransaction(payment, companyStatusIndex));
                    setTransactions(dedupeApiTransactions(normalized));
                }
                else {
                    setErrorMessage(response.error || 'Unable to load transactions.');
                }
            }
            catch (err) {
                if (isMounted)
                    setErrorMessage('Something went wrong.');
            }
            finally {
                if (isMounted)
                    setIsLoading(false);
            }
        }
        loadTransactions();
        return () => {
            isMounted = false;
        };
    }, [token, companyStatusIndex]);
    const filteredTransactions = useMemo(() => {
        if (hasNoCompany) return [];
        return transactions.filter(item => {
            if (companyId) {
                const txnCompanyId = String(item.details?.company ?? '').trim();
                if (!txnCompanyId || txnCompanyId !== String(companyId)) {
                    return false;
                }
            }
            const matchesFilter = activeFilter === 'All' || item.status === activeFilter;
            const matchesSearch = matchesTransactionSearch(item, search);
            return matchesFilter && matchesSearch;
        });
    }, [
        companyId,
        hasNoCompany,
        activeFilter,
        search,
        transactions,
    ]);
    const currencyFilteredTransactions = useMemo(() => {
        if (!selectedCurrency)
            return filteredTransactions;
        return filteredTransactions.filter(item => item.details?.currency === selectedCurrency);
    }, [filteredTransactions, selectedCurrency]);
    // UI समरी कार्ड्स के लिए डायनामिक करेंसी रेंडरिंग लॉजिक
    const summaryDOM = useMemo(() => {
        const totals = {};
        filteredTransactions.forEach(item => {
            const currency = item.details?.currency || 'USD';
            const parsedAmount = Number(String(item.amount).replace(/[^0-9.-]+/g, '')) || 0;
            if (!totals[currency]) {
                totals[currency] = { total: 0, pending: 0 };
            }
            totals[currency].total += parsedAmount;
            if (item.status === 'Pending') {
                totals[currency].pending += parsedAmount;
            }
        });
        const keys = Object.keys(totals);
        if (keys.length === 0) {
            return { totals: { USD: { total: 0, pending: 0 } }, keys: ['USD'] };
        }
        return { totals, keys };
    }, [filteredTransactions]);
    const getStatusColor = (status) => {
        switch (status) {
            case 'Success':
                return '#fff'; // ग्रीन कलर फॉर सक्सेस
            case 'Pending':
                return '#fff'; // येलो कलर फॉर पेंडिंग
            case 'Failed':
                return '#fff'; // रेड कलर फॉर फ़ील्ड
            default:
                return '#2563eb';
        }
    };
    const getStatusBg = (status) => {
        switch (status) {
            case 'Success':
                return '#16a34a';
            case 'Pending':
                return '#ca8a04';
            case 'Failed':
                return '#fef2f2';
            default:
                return '#dc2626';
        }
    };
    if (selectedTransaction && selectedTransaction.details) {
        return (<TransactionDetailScreen transaction={selectedTransaction.details} onBackPress={() => {
            setSelectedTransaction(null);
            navigation.setOptions({ headerShown: true });
        }} />);
    }
    return (<View style={styles.screen}>
        {/* Summary Cards (one per currency) */}
        <View style={styles.summaryContainer}>
            {summaryDOM.keys.map(currency => {
                const isActive = selectedCurrency === currency;
                return (<Pressable key={currency} onPress={() => setSelectedCurrency(isActive ? null : currency)} style={[
                    styles.summaryCard,
                    {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                    },
                    isActive && {
                        borderColor: colors.accent,
                        backgroundColor: colors.accentSoft,
                    },
                ]}>
                    <Text style={[styles.summaryLabel, { color: colors.muted }]}>
                        Total Spent ({currency})
                    </Text>
                    <Text style={[styles.summaryValue, { color: colors.text }]} numberOfLines={1} adjustsFontSizeToFit>
                        {formatCurrency(summaryDOM.totals[currency].total, currency)}
                    </Text>
                    <Text style={[
                        styles.summaryLabel,
                        { color: colors.muted, marginTop: s(8) },
                    ]}>
                        Pending ({currency})
                    </Text>
                    <Text style={[styles.summaryValue, { color: '#ca8a04' }]} numberOfLines={1} adjustsFontSizeToFit>
                        {formatCurrency(summaryDOM.totals[currency].pending, currency)}
                    </Text>
                </Pressable>);
            })}
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
            <TextInput placeholder="Search by amount or methods" placeholderTextColor={colors.muted} style={[
                styles.searchInput,
                {
                    color: colors.text,
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                },
            ]} value={search} onChangeText={setSearch} returnKeyType="search" />
        </View>

        {/* Filters */}
        <View style={styles.filterRow}>
            {['All', 'Success', 'Pending', 'Failed'].map(filter => {
                const isActive = activeFilter === filter;
                return (<Pressable key={filter} onPress={() => setActiveFilter(filter)} style={[
                    styles.filterButton,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    isActive
                        ? {
                            borderColor: colors.accent,
                            backgroundColor: colors.accentSoft,
                        }
                        : null,
                ]}>
                    <Text style={[
                        styles.filterText,
                        { color: colors.text },
                        isActive ? { color: colors.accent, fontWeight: '700' } : null,
                    ]}>
                        {filter}
                    </Text>
                </Pressable>);
            })}
        </View>

        {isLoading ? (<View style={styles.centerContent}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={[styles.emptyText, { color: colors.text, marginTop: s(12) }]}>
                Loading transactions...
            </Text>
        </View>) : hasNoCompany ? (<View style={[styles.emptyContainer, { backgroundColor: 'transparent' }]}>
            <DocumentNotFound subtitle="No transactions found" />
        </View>) : errorMessage ? (<View style={[styles.emptyContainer, { backgroundColor: colors.surface }]}>
            <FontAwesome name="exclamation-circle" size={40} color={colors.accent} />
            <Text style={[
                styles.emptyText,
                { color: colors.text, textAlign: 'center' },
            ]}>
                {errorMessage}
            </Text>
        </View>) : (<FlatList data={currencyFilteredTransactions} keyExtractor={(item, index) => `${item.id}-${index}`} contentContainerStyle={{
            paddingHorizontal: s(20),
            paddingBottom: safeAreaInsets.bottom + s(24),
        }} ListEmptyComponent={<View style={[
            styles.emptyContainer,
            { backgroundColor: 'transparent' },
        ]}>
            <DocumentNotFound subtitle="No transactions found" />
        </View>} renderItem={({ item }) => (<Pressable onPress={() => {
            setSelectedTransaction(item);
            navigation.setOptions({ headerShown: false });
        }}>
            <View style={[
                styles.txCard,
                {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                },
            ]}>
                <View style={[
                    styles.iconContainer,
                    { backgroundColor: colors.background },
                ]}>
                    <FontAwesome name="file-text-o" size={18} color={colors.accent} />
                </View>
                <View style={styles.middleSection}>
                    <Text style={[styles.txTitle, { color: colors.text }]}>
                        {item.title}
                    </Text>
                    <Text style={[styles.txSubtitle, { color: colors.muted }]}>
                        {formatDate(item.date)} • method: {item.method}
                    </Text>
                </View>
                <View style={styles.rightSection}>
                    <Text style={[styles.txAmount, { color: colors.text }]}>
                        {item.amount}
                    </Text>
                    <View style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusBg(item.status) },
                    ]}>
                        <Text style={[
                            styles.statusText,
                            { color: getStatusColor(item.status) },
                        ]}>
                            {item.status}
                        </Text>
                    </View>
                </View>
            </View>
        </Pressable>)} />)}
    </View>);
}
const styles = StyleSheet.create({
    screen: { flex: 1 },
    searchContainer: { paddingHorizontal: s(20), marginBottom: s(16) },
    searchInput: {
        height: 50,
        borderRadius: 10,
        borderWidth: 1,
        paddingHorizontal: s(12),
        borderColor: '#ccc',
    },
    summaryContainer: {
        flexDirection: 'row',
        paddingHorizontal: s(20),
        gap: s(12),
        marginBottom: s(20),
        marginTop: s(12),
    },
    summaryCard: { flex: 1, padding: s(16), borderRadius: 16, borderWidth: 1 },
    summaryLabel: { fontSize: font.base, fontWeight: '600', marginBottom: s(6) },
    summaryValue: { fontSize: font.large, fontWeight: '800' },
    filterRow: {
        flexDirection: 'row',
        paddingHorizontal: s(20),
        gap: s(8),
        marginBottom: s(16),
    },
    filterButton: {
        flex: 1,
        height: 34,
        borderRadius: 10,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterText: { fontSize: font.base, fontWeight: '500' },
    txCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: s(14),
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: s(10),
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: s(12),
    },
    middleSection: { flex: 1 },
    txTitle: { fontSize: font.lg, fontWeight: '500', marginBottom: s(4) },
    txSubtitle: { fontSize: font.sm },
    rightSection: { alignItems: 'flex-end' },
    txAmount: {
        fontSize: font.lg,
        fontWeight: '600',
        marginBottom: s(4),
        textAlign: 'right',
    },
    centerContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: s(20),
    },
    statusBadge: { paddingHorizontal: s(8), paddingVertical: s(4), borderRadius: 8, marginTop: s(4) },
    statusText: { fontSize: font.xs, fontWeight: '800' },
    emptyContainer: {
        padding: s(40),
        borderRadius: 16,
        alignItems: 'center',
        gap: s(12),
    },
    emptyText: { fontSize: font.lg, fontWeight: '600' },
});
