import React, { useEffect, useState } from 'react';
import { Alert, Linking, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, } from 'react-native';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import { API_BASE_URL } from '../../../../config/api';
import { useAppSelector } from '../../../../store/hooks';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useThemeColors } from '../../../../theme/colors';
import Toast from 'react-native-toast-message';
const API_REQUEST_TIMEOUT_MS = 10000;
const getIconName = (icon) => {
    const normalized = (icon ?? '').toLowerCase().trim();
    const iconMap = {
        user: 'user',
        info: 'info-circle',
        email: 'envelope',
        envelope: 'envelope',
        phone: 'phone',
        calendar: 'calendar',
        history: 'history',
        'map-marker': 'map-marker',
        'map-pin': 'map-pin',
        map: 'map',
        globe: 'globe',
        'clock-o': 'clock-o',
        'exclamation-circle': 'exclamation-circle',
        address: 'home',
        home: 'home',
        check: 'check',
        'check-circle': 'check-circle',
        file: 'file',
        'file-text': 'file-text',
        building: 'building',
        briefcase: 'briefcase',
    };
    return iconMap[normalized] ?? iconMap[normalized.replace(/[-_]/g, '')] ?? 'info-circle';
};
const BreakdownRow = ({ label, value, isTotal = false }) => {
    const colors = useThemeColors();
    return (<View style={[styles.breakdownRow, isTotal && { borderTopWidth: 0.5, borderTopColor: colors.border, paddingTop: 6, marginTop: 4 }]}>
      <Text style={[{ fontSize: 12, color: isTotal ? colors.text : colors.muted }, isTotal && { fontWeight: '600' }]}>{label}</Text>
      <Text style={[{ fontSize: 12, color: colors.text }, isTotal && { fontWeight: '600' }]}>{value}</Text>
    </View>);
};
const buildAddressServices = (apiData, action) => {
    const breakdown = Array.isArray(apiData?.breakdown) ? apiData.breakdown : [];
    if (breakdown.length > 0) {
        return breakdown.map((item, index) => ({
            id: index + 1,
            name: item?.service ? item.service.charAt(0).toUpperCase() + item.service.slice(1) : action?.title ?? 'Renewal Service',
            lastDate: action?.date ?? 'N/A',
            dueDate: action?.date ?? 'N/A',
            price: Number(item?.base ?? item?.total ?? 0),
            years: Number(item?.years ?? 1),
            isExpired: (action?.status ?? '').toLowerCase() === 'expired',
            isSelected: false,
        }));
    }
    const addressData = apiData?.data?.Address ?? apiData?.Address ?? null;
    const normalizedStatus = String(addressData?.status ?? action?.status ?? 'Pending').toLowerCase();
    const dueDate = addressData?.dueDate ?? action?.date ?? 'N/A';
    const lastDate = addressData?.lastDate ?? 'N/A';
    const price = Number(action?.price ?? 99) || 99;
    const years = Number(action?.years ?? 1) || 1;
    return [
        {
            id: 1,
            name: action?.title ?? 'Registered Address',
            lastDate,
            dueDate,
            price,
            years,
            isExpired: normalizedStatus === 'expired' || normalizedStatus === 'overdue',
            isSelected: false,
        },
    ];
};
const AddressRenewalScreen = () => {
    const route = useRoute();
    const selectedAction = route.params?.selectedAction;
    const colors = useThemeColors();
    const authUser = useAppSelector(state => state.auth.user);
    const token = useAppSelector(state => state.auth.token);
    const resolvedCompanyId = selectedAction?.companyId ?? authUser?._id ?? authUser?.id ?? authUser?.company ?? authUser?.companyName ?? authUser?.businessName ?? authUser?.legalName ?? null;
    const [services, setServices] = useState(() => buildAddressServices(null, selectedAction));
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const fetchRenewalData = async () => {
            if (!token || !resolvedCompanyId) {
                setServices(buildAddressServices(null, selectedAction));
                return;
            }
            setLoading(true);
            try {
                const response = await axios.post(`${API_BASE_URL}/api/payment/painility/compliance-renewal/create-checkout`, {
                    companyId: resolvedCompanyId,
                    services: ['address', 'resident'],
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'x-auth-token': token,
                        'Content-Type': 'application/json',
                    },
                    timeout: API_REQUEST_TIMEOUT_MS,
                });
                setServices(buildAddressServices(response?.data, selectedAction));
            }
            catch (error) {
                Toast.show({ text1: 'Failed to fetch renewal data' });
                setServices(buildAddressServices(null, selectedAction));
            }
            finally {
                setLoading(false);
            }
        };
        fetchRenewalData();
    }, [resolvedCompanyId, selectedAction?.date, selectedAction?.price, selectedAction?.status, selectedAction?.title, selectedAction?.years, token]);
    const toggleService = (id) => {
        setServices(prev => prev.map(service => (service.id === id ? { ...service, isSelected: !service.isSelected } : service)));
    };
    const deselectAll = () => {
        setServices(prev => prev.map(service => ({ ...service, isSelected: false })));
    };
    const selectedServices = services.filter(service => service.isSelected);
    const totalDue = selectedServices.reduce((sum, service) => sum + service.price * service.years, 0);
    const handlePay = async () => {
        if (selectedServices.length === 0) {
            Alert.alert('Payment', 'Please select at least one service to continue.');
            return;
        }
        if (!token) {
            Alert.alert('Payment', 'Your session has expired. Please sign in again.');
            return;
        }
        try {
            const payload = {
                companyId: resolvedCompanyId ?? '',
                services: selectedServices.map(service => {
                    const normalizedName = service.name.toLowerCase();
                    if (normalizedName.includes('address')) {
                        return 'address';
                    }
                    if (normalizedName.includes('resident')) {
                        return 'resident';
                    }
                    return 'address';
                }),
            };
            const response = await axios.post(`${API_BASE_URL}/api/payment/painility/compliance-renewal/create-checkout`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'x-auth-token': token,
                    'Content-Type': 'application/json',
                },
                timeout: API_REQUEST_TIMEOUT_MS,
            });
            const checkoutUrl = response?.data?.url;
            if (checkoutUrl) {
                await Linking.openURL(checkoutUrl);
            }
            else {
                Alert.alert('Payment', 'Checkout URL not returned by server.');
            }
        }
        catch (error) {
            Toast.show({ type: `Checkout error ${error}` });
            const status = error?.response?.status;
            const message = error?.response?.data?.message || 'Unable to start Stripe checkout right now.';
            Alert.alert('Payment', status ? `${message} (Status ${status})` : message);
        }
    };
    return (<View style={styles.safeArea}>
      <StatusBar barStyle={colors.mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.surface}/>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.yearHeader}>
          <View style={styles.yearLabel}>
            <View style={[styles.yearIconBox, { backgroundColor: colors.border }]}>
              <Text style={styles.yearIconText}>📅</Text>
            </View>
            <View>
              <Text style={[styles.yearTitle, { color: colors.text }]}>{selectedAction?.date ?? '2026'}</Text>
              <Text style={[styles.yearSubtitle, { color: colors.muted }]}>{services.length} service available for renewal</Text>
            </View>
          </View>
          <TouchableOpacity style={[styles.deselectBtn, { backgroundColor: `${colors.accent}20` }]} onPress={deselectAll}>
            <Text style={[styles.deselectBtnText, { color: colors.accent }]}>Deselect all</Text>
          </TouchableOpacity>
        </View>

        {loading && services.length === 0 ? (<View style={[styles.checkoutSection, { backgroundColor: colors.surface }]}>
            <Text style={[styles.checkoutTitle, { color: colors.text }]}>Loading renewal options...</Text>
            <Text style={[styles.checkoutDesc, { color: colors.muted }]}>Fetching the latest company compliance details.</Text>
          </View>) : (services.map(service => (<View key={service.id} style={[
                styles.serviceCard,
                {
                    backgroundColor: colors.surface,
                    borderColor: service.isSelected ? colors.accent : colors.border,
                    borderWidth: service.isSelected ? 1.5 : 0.5,
                },
            ]}>
            <View style={styles.cardTop}>
              <TouchableOpacity style={[
                styles.checkbox,
                {
                    backgroundColor: service.isSelected ? colors.accent : 'transparent',
                    borderWidth: service.isSelected ? 0 : 1.5,
                    borderColor: colors.border,
                },
            ]} onPress={() => toggleService(service.id)}>
                {service.isSelected && <Text style={styles.checkboxTick}>✓</Text>}
              </TouchableOpacity>

              <View style={[styles.cardIcon, { backgroundColor: `${colors.primary}20` }]}>
                <FontAwesome name={service.name.toLowerCase().includes('address') ? 'home' : 'file-text-o'} size={18} color={colors.accent}/>
              </View>

              <View style={styles.cardInfo}>
                <Text style={[styles.cardName, { color: colors.text }]}>{service.name}</Text>
                {service.isExpired && (<View style={[styles.expiredBadge, { backgroundColor: `${colors.danger}20` }]}>
                    <Text style={[styles.expiredBadgeText, { color: colors.danger }]}>⚠ {selectedAction?.status ?? 'Expired'}</Text>
                  </View>)}
                <Text style={[styles.cardDates, { color: colors.muted }]}>
                  Last: {service.lastDate} · <Text style={[styles.dueDateText, { color: colors.danger }]}>Due: {service.dueDate}</Text>
                </Text>
              </View>
            </View>

            <Text style={[styles.cardPrice, { color: colors.accent }]}>${service.isSelected ? service.price.toFixed(2) : '0.00'}</Text>
            <Text style={[styles.cardSubLabel, { color: colors.muted }]}>{selectedAction?.subtitle ?? '1 year from backend'}</Text>

            <View style={[styles.breakdown, { backgroundColor: colors.background }]}>
              <BreakdownRow label="Years" value={String(service.isSelected ? service.years : 0)}/>
              <BreakdownRow label="Base total" value={`$${service.isSelected ? service.price.toFixed(2) : '0.00'}`}/>
              <BreakdownRow label="Total" value={`$${service.isSelected ? (service.price * service.years).toFixed(2) : '0.00'}`} isTotal/>
            </View>
          </View>)))}

        {selectedAction?.details?.length ? (<View style={[styles.checkoutSection, { backgroundColor: colors.surface }]}>
            <Text style={[styles.checkoutEyebrow, { color: colors.muted }]}>SELECTED ACTION</Text>
            <Text style={[styles.checkoutTitle, { color: colors.text }]}>Details</Text>
            <View style={styles.detailList}>
              {selectedAction.details.map((detail, index) => (<View key={`${detail.label}-${index}`} style={[styles.detailCard, { backgroundColor: colors.background }]}>
                  <View style={[styles.detailIconBox, { backgroundColor: `${colors.accent}20` }]}>
                    <FontAwesome name={getIconName(detail.icon)} size={16} color={colors.accent}/>
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={[styles.detailLabel, { color: colors.muted }]}>{detail.label}</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{detail.value}</Text>
                  </View>
                </View>))}
            </View>
          </View>) : null}

        <View style={[styles.checkoutSection, { backgroundColor: colors.surface }]}>
          <Text style={[styles.checkoutEyebrow, { color: colors.muted }]}>CHECKOUT</Text>
          <Text style={[styles.checkoutTitle, { color: colors.text }]}>Stripe payment</Text>
          <Text style={[styles.checkoutDesc, { color: colors.muted }]}>Review the services you selected and continue to secure checkout.</Text>

          <View style={[styles.selectedServices, { backgroundColor: colors.background }]}>
            <View style={styles.ssHeader}>
              <Text style={[styles.ssHeaderLabel, { color: colors.text }]}>Selected services</Text>
              <View style={[styles.ssCount, { backgroundColor: colors.accent }]}>
                <Text style={styles.ssCountText}>{selectedServices.length}</Text>
              </View>
            </View>

            {selectedServices.length > 0 ? (selectedServices.map(service => (<View key={service.id} style={[styles.ssItem, { backgroundColor: colors.surface }]}>
                  <View style={[styles.ssItemIcon, { backgroundColor: `${colors.primary}20` }]}>
                    <Text style={styles.ssItemIconText}>🏠</Text>
                  </View>
                  <View style={styles.ssItemInfo}>
                    <Text style={[styles.ssItemName, { color: colors.text }]}>{service.name}</Text>
                    <Text style={[styles.ssItemMeta, { color: colors.muted }]}>2026 · {service.years} year</Text>
                  </View>
                  <View style={styles.ssItemPriceBox}>
                    <Text style={[styles.ssItemPrice, { color: colors.text }]}>${service.price.toFixed(2)}</Text>
                    <Text style={[styles.ssItemBase, { color: colors.muted }]}>Base ${service.price.toFixed(2)}</Text>
                  </View>
                </View>))) : (<View style={[styles.ssItem, { backgroundColor: colors.surface }]}>
                <View style={styles.ssItemInfo}>
                  <Text style={[styles.ssItemName, { color: colors.text }]}>No service selected</Text>
                  <Text style={[styles.ssItemMeta, { color: colors.muted }]}>Select a service to see its amount</Text>
                </View>
              </View>)}
          </View>

          <View style={[styles.totalDue, { backgroundColor: colors.background }]}>
            <View style={styles.totalDueRow}>
              <View style={styles.totalDueLabel}>
                <Text style={[styles.totalDueDollar, { color: colors.text }]}>$</Text>
                <Text style={[styles.totalDueLabelText, { color: colors.text }]}>Total due</Text>
              </View>
              <Text style={[styles.totalDueAmount, { color: colors.accent }]}>${totalDue.toFixed(2)}</Text>
            </View>
            <Text style={[styles.totalNote, { color: colors.muted }]}>
              {selectedServices.length > 0
            ? 'Selected services will be charged through Stripe checkout.'
            : 'No service selected. Amount will remain $0.00 until you choose one.'}
            </Text>
          </View>

          <TouchableOpacity style={[
            styles.payBtn,
            {
                backgroundColor: selectedServices.length === 0 ? `${colors.accent}40` : colors.accent,
            },
            selectedServices.length === 0 && styles.payBtnDisabled,
        ]} onPress={handlePay} activeOpacity={0.85} disabled={selectedServices.length === 0}>
            <Text style={styles.payBtnText}>🔒  Pay ${totalDue.toFixed(2)} with Stripe  →</Text>
          </TouchableOpacity>

          <Text style={[styles.secureNote, { color: colors.muted }]}>Secured by Stripe · Card and wallet checkout</Text>
        </View>
      </ScrollView>
    </View>);
};
const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    content: { flex: 1 },
    contentContainer: { padding: 16, gap: 14 },
    yearHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    yearLabel: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    yearIconBox: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    yearIconText: { fontSize: 14 },
    yearTitle: { fontSize: 14, fontWeight: '500' },
    yearSubtitle: { fontSize: 11 },
    deselectBtn: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
    deselectBtnText: { fontSize: 11, fontWeight: '500' },
    serviceCard: { borderRadius: 12, borderStyle: 'solid', padding: 14 },
    cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    checkbox: { width: 20, height: 20, borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
    checkboxTick: { color: 'white', fontSize: 12 },
    cardIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    cardInfo: { flex: 1 },
    cardName: { fontSize: 13, fontWeight: '500' },
    expiredBadge: { borderRadius: 20, paddingHorizontal: 7, paddingVertical: 2, alignSelf: 'flex-start', marginTop: 3 },
    expiredBadgeText: { fontSize: 10, fontWeight: '500' },
    cardDates: { fontSize: 11, marginTop: 4 },
    dueDateText: { fontWeight: '500' },
    cardPrice: { fontSize: 18, fontWeight: '500', marginTop: 10 },
    cardSubLabel: { fontSize: 11 },
    breakdown: { borderRadius: 8, padding: 12, marginTop: 10, gap: 4 },
    breakdownRow: { flexDirection: 'row', justifyContent: 'space-between' },
    checkoutSection: { borderRadius: 12, padding: 14, gap: 10 },
    detailList: { gap: 8 },
    detailCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 10,
        padding: 10,
        gap: 10,
    },
    detailIconBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    detailContent: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 13,
        fontWeight: '500',
    },
    checkoutEyebrow: { fontSize: 11, fontWeight: '600', letterSpacing: 0.8 },
    checkoutTitle: { fontSize: 16, fontWeight: '600' },
    checkoutDesc: { fontSize: 12 },
    selectedServices: { borderRadius: 10, padding: 10, gap: 8 },
    ssHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    ssHeaderLabel: { fontSize: 12, fontWeight: '500' },
    ssCount: { borderRadius: 999, width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
    ssCountText: { color: '#ffffff', fontSize: 12, fontWeight: '600' },
    ssItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 8, padding: 10 },
    ssItemIcon: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    ssItemIconText: { fontSize: 14 },
    ssItemInfo: { flex: 1, marginLeft: 8 },
    ssItemName: { fontSize: 12, fontWeight: '500' },
    ssItemMeta: { fontSize: 11, marginTop: 2 },
    ssItemPriceBox: { alignItems: 'flex-end' },
    ssItemPrice: { fontSize: 12, fontWeight: '600' },
    ssItemBase: { fontSize: 10, marginTop: 2 },
    totalDue: { borderRadius: 10, padding: 12, gap: 6 },
    totalDueRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    totalDueLabel: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    totalDueDollar: { fontSize: 14, fontWeight: '600' },
    totalDueLabelText: { fontSize: 13, fontWeight: '600' },
    totalDueAmount: { fontSize: 16, fontWeight: '700' },
    totalNote: { fontSize: 11 },
    payBtn: { borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
    payBtnDisabled: { opacity: 0.6 },
    payBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
    secureNote: { fontSize: 11, textAlign: 'center' },
});
export default AddressRenewalScreen;
