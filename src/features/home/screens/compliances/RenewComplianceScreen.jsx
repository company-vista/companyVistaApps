import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, StatusBar, InteractionManager, } from "react-native";
import { useRoute } from '@react-navigation/native';
import { Linking } from "react-native";
import axios from "axios";
import { API_BASE_URL } from "../../../../config/api";
import { useAppSelector } from "../../../../store/hooks";
import { useThemeColors } from '../../../../theme/colors';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
const API_REQUEST_TIMEOUT_MS = 10000;
const BreakdownRow = ({ label, value, isTotal = false, colors }) => (<View style={[styles.breakdownRow, isTotal && [styles.breakdownRowTotal, { borderTopColor: colors.border }]]}>
    <Text style={[styles.breakdownLabel, { color: isTotal ? colors.text : colors.muted, fontWeight: isTotal ? '500' : undefined }]}>
      {label}
    </Text>
    <Text style={[styles.breakdownValue, { color: isTotal ? colors.text : colors.muted, fontWeight: isTotal ? '500' : undefined }]}>
      {value}
    </Text>
  </View>);
const showAlert = (title, message) => {
    InteractionManager.runAfterInteractions(() => {
        Alert.alert(title, message);
    });
};
const RenewCompliance = () => {
    const route = useRoute();
    const selectedAction = route.params?.selectedAction;
    const colors = useThemeColors();
    const authUser = useAppSelector(state => state.auth.user);
    const token = useAppSelector(state => state.auth.token);
    const companyId = selectedAction?.companyId ?? authUser?._id ?? authUser?.id ?? authUser?.company ?? authUser?.companyName ?? authUser?.businessName ?? authUser?.legalName ?? null;
    const [services, setServices] = useState([
        {
            id: 1,
            name: selectedAction?.title ?? "Registered Address",
            lastDate: selectedAction?.date ?? "N/A",
            dueDate: selectedAction?.date ?? "N/A",
            price: selectedAction?.price ?? 0,
            years: selectedAction?.years ?? 0,
            isExpired: (selectedAction?.status ?? "Pending") === "Expired",
            isSelected: false,
        },
    ]);
    useEffect(() => {
        setServices([
            {
                id: 1,
                name: selectedAction?.title ?? "Registered Address",
                lastDate: selectedAction?.date ?? "N/A",
                dueDate: selectedAction?.date ?? "N/A",
                price: selectedAction?.price ?? 0,
                years: selectedAction?.years ?? 0,
                isExpired: (selectedAction?.status ?? "Expired") === "Expired",
                isSelected: false,
            },
        ]);
    }, [selectedAction]);
    const toggleService = (id) => {
        setServices((prev) => prev.map((s) => (s.id === id ? { ...s, isSelected: !s.isSelected } : s)));
    };
    const deselectAll = () => {
        setServices((prev) => prev.map((s) => ({ ...s, isSelected: false })));
    };
    const selectedServices = services.filter((s) => s.isSelected);
    const totalDue = selectedServices.reduce((sum, s) => sum + s.price * s.years, 0);
    //   console.log("Selected services:", selectedServices);
    const handlePay = async () => {
        if (selectedServices.length === 0) {
            showAlert("Payment", "Please select at least one service to continue.");
            return;
        }
        if (!token) {
            showAlert("Payment", "Your session has expired. Please sign in again.");
            return;
        }
        try {
            const payload = {
                companyId: companyId ?? "",
                services: selectedServices.map((service) => service.name.toLowerCase().includes("address")
                    ? "address"
                    : "resident"),
            };
            const response = await axios.post(`${API_BASE_URL}/api/payment/painility/compliance-renewal/create-checkout`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "x-auth-token": token,
                    "Content-Type": "application/json",
                },
                timeout: API_REQUEST_TIMEOUT_MS,
            });
            const checkoutUrl = response?.data?.url;
            if (checkoutUrl) {
                await Linking.openURL(checkoutUrl);
            }
            else {
                showAlert("Payment", "Checkout URL not returned by server.");
            }
        }
        catch (error) {
            console.error("Checkout error", error);
            const message = error?.response?.data?.message || error?.message || "Unable to start Stripe checkout right now.";
            showAlert("Payment", message);
        }
    };
    return (<View style={styles.safeArea}>
      <StatusBar barStyle={colors.mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.surface}/>

      {/* Scrollable Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Year Section Header */}
        <View style={styles.yearHeader}>
          <View style={styles.yearLabel}>
            <View style={[styles.yearIconBox, { backgroundColor: colors.surface }]}>
              <Text style={styles.yearIconText}>📅</Text>
            </View>
            <View>
              <Text style={[styles.yearTitle, { color: colors.text }]}>{selectedAction?.date ?? "2026"}</Text>
              <Text style={[styles.yearSubtitle, { color: colors.muted }]}>
                {services.length} service available for renewal
              </Text>
            </View>
          </View>
          {selectedServices.length > 0 && (<TouchableOpacity style={[styles.deselectBtn, { backgroundColor: colors.surfaceAlt }]} onPress={deselectAll}>
            <Text style={[styles.deselectBtnText, { color: colors.accent }]}>Deselect all</Text>
          </TouchableOpacity>)}
        </View>

        {/* Service Cards */}
        {services.map((service) => (<View key={service.id} style={[
                styles.serviceCard,
                { backgroundColor: colors.surface },
                {
                    borderColor: service.isSelected ? colors.accent : colors.border,
                    borderWidth: service.isSelected ? 1.5 : 0.5,
                },
            ]}>
            <View style={styles.cardTop}>
              {/* Checkbox */}
              <TouchableOpacity style={[
                styles.checkbox,
                {
                    backgroundColor: service.isSelected ? colors.accent : "transparent",
                    borderWidth: service.isSelected ? 0 : 1.5,
                    borderColor: colors.border,
                },
            ]} onPress={() => toggleService(service.id)}>
                {service.isSelected && (<Text style={styles.checkboxTick}>✓</Text>)}
              </TouchableOpacity>

              {/* Card Icon */}
              <View style={[styles.cardIcon, { backgroundColor: colors.surfaceAlt }]}>
                <Text style={styles.cardIconText}>🏠</Text>
              </View>

              {/* Card Info */}
              <View style={styles.cardInfo}>
                <Text style={[styles.cardName, { color: colors.text }]}>{service.name}</Text>
                {service.isExpired && (<View style={[styles.expiredBadge, { backgroundColor: colors.danger + '26' }]}>
                    <Text style={[styles.expiredBadgeText, { color: colors.danger }]}>⚠ {selectedAction?.status ?? "Expired"}</Text>
                  </View>)}
                <Text style={[styles.cardDates, { color: colors.muted }]}>
                  Last: {service.lastDate} ·{" "}
                  <Text style={[styles.dueDateText, { color: colors.danger }]}>Due: {service.dueDate}</Text>
                </Text>
              </View>
            </View>

            <Text style={[styles.cardPrice, { color: colors.accent }]}>${service.isSelected ? service.price.toFixed(2) : '0.00'}</Text>
            <Text style={[styles.cardSubLabel, { color: colors.muted }]}>{selectedAction?.subtitle ?? "1 year from backend"}</Text>

            <View style={[styles.breakdown, { backgroundColor: colors.background }]}>
              <BreakdownRow colors={colors} label="Years" value={String(service.isSelected ? service.years : 0)}/>
              <BreakdownRow colors={colors} label="Base total" value={`$${service.isSelected ? service.price.toFixed(2) : '0.00'}`}/>
              <BreakdownRow colors={colors} label="Total" value={`$${service.isSelected ? (service.price * service.years).toFixed(2) : '0.00'}`} isTotal/>
            </View>
          </View>))}

        {selectedAction?.details?.length ? (<View style={[styles.checkoutSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.checkoutEyebrow, { color: colors.muted }]}>SELECTED ACTION</Text>
            <Text style={[styles.checkoutTitle, { color: colors.text }]}>Details</Text>
            <View style={styles.detailsGrid}>
              {selectedAction.details.map((detail, index) => (<View key={`${detail.label}-${index}`} style={[styles.detailCol, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <View style={[styles.detailIconBox, { backgroundColor: colors.surfaceAlt }]}>
                    <FontAwesome name={detail.icon ?? 'clipboard'} size={14} color={colors.accent}/>
                  </View>
                  <Text style={[styles.detailLabel, { color: colors.muted }]}>{detail.label}</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>{detail.value}</Text>
                </View>))}
            </View>
          </View>) : null}

        {/* Checkout Section */}
        <View style={[styles.checkoutSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.checkoutEyebrow, { color: colors.muted }]}>CHECKOUT</Text>
          <Text style={[styles.checkoutTitle, { color: colors.text }]}>Stripe payment</Text>
          <Text style={[styles.checkoutDesc, { color: colors.muted }]}>
            Review the services you selected and continue to secure checkout.
          </Text>

          {/* Selected Services */}
          <View style={[styles.selectedServices, { backgroundColor: colors.background }]}>
            <View style={styles.ssHeader}>
              <Text style={[styles.ssHeaderLabel, { color: colors.muted }]}>Selected services</Text>
              <View style={[styles.ssCount, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.ssCountText, { color: colors.text }]}>{selectedServices.length}</Text>
              </View>
            </View>

            {selectedServices.length > 0 ? (selectedServices.map((s) => (<View key={s.id} style={styles.ssItem}>
                  <View style={[styles.ssItemIcon, { backgroundColor: colors.surfaceAlt }]}>
                    <Text style={styles.ssItemIconText}>🏠</Text>
                  </View>
                  <View style={styles.ssItemInfo}>
                    <Text style={[styles.ssItemName, { color: colors.text }]}>{s.name}</Text>
                    <Text style={[styles.ssItemMeta, { color: colors.muted }]}>2026 · {s.years} year</Text>
                  </View>
                  <View style={styles.ssItemPriceBox}>
                    <Text style={[styles.ssItemPrice, { color: colors.text }]}>${s.price.toFixed(2)}</Text>
                    <Text style={[styles.ssItemBase, { color: colors.muted }]}>Base ${s.price.toFixed(2)}</Text>
                  </View>
                </View>))) : (<View style={styles.ssItem}>
                <View style={styles.ssItemInfo}>
                  <Text style={[styles.ssItemName, { color: colors.text }]}>No service selected</Text>
                  <Text style={[styles.ssItemMeta, { color: colors.muted }]}>Select a service to see its amount</Text>
                </View>
              </View>)}
          </View>

          {/* Total Due */}
          <View style={[styles.totalDue, { backgroundColor: colors.surfaceAlt }]}>
            <View style={styles.totalDueRow}>
              <View style={styles.totalDueLabel}>
                <Text style={[styles.totalDueDollar, { color: colors.accent }]}>$</Text>
                <Text style={[styles.totalDueLabelText, { color: colors.muted }]}>Total due</Text>
              </View>
              <Text style={[styles.totalDueAmount, { color: colors.accent }]}>${totalDue.toFixed(2)}</Text>
            </View>
            <Text style={[styles.totalNote, { color: colors.muted }]}>
              {selectedServices.length > 0
            ? 'Selected services will be charged through Stripe checkout.'
            : 'No service selected. Amount will remain $0.00 until you choose one.'}
            </Text>
          </View>

          {/* Pay Button */}
          <TouchableOpacity style={[
            styles.payBtn,
            { backgroundColor: selectedServices.length === 0 ? colors.muted : colors.buttonBackground, opacity: selectedServices.length === 0 ? 0.8 : 1 },
        ]} onPress={handlePay} activeOpacity={0.85} disabled={selectedServices.length === 0}>
            <Text style={styles.payBtnText}>🔒  Pay ${totalDue.toFixed(2)} with Stripe  →</Text>
          </TouchableOpacity>

          <Text style={[styles.secureNote, { color: colors.muted }]}>Secured by Stripe · Card and wallet checkout</Text>
        </View>
      </ScrollView>
    </View>);
};
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
        gap: 14,
    },
    yearHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    yearLabel: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    yearIconBox: {
        width: 28,
        height: 28,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    yearIconText: {
        fontSize: 22,
    },
    yearTitle: {
        fontSize: 16,
        fontWeight: "500",
    },
    yearSubtitle: {
        fontSize: 12,
    },
    deselectBtn: {
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 5,
    },
    deselectBtnText: {
        fontSize: 13,
        fontWeight: "500",
    },
    serviceCard: {
        borderRadius: 18,
        borderStyle: "solid",
        padding: 14,
    },
    cardTop: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 16,
    },
    checkbox: {
        width: 23,
        height: 23,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 1,
    },
    checkboxTick: {
        color: "white",
        fontSize: 12,
    },
    cardIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    cardIconText: {
        fontSize: 16,
    },
    cardInfo: {
        flex: 1,
    },
    cardName: {
        fontSize: 16,
        fontWeight: "500",
    },
    expiredBadge: {
        borderRadius: 20,
        paddingHorizontal: 7,
        paddingVertical: 2,
        alignSelf: "flex-start",
        marginTop: 3,
    },
    expiredBadgeText: {
        fontSize: 12,
        fontWeight: "500",
    },
    cardDates: {
        fontSize: 12,
        marginTop: 4,
    },
    dueDateText: {
        fontWeight: "500",
    },
    cardPrice: {
        fontSize: 18,
        fontWeight: "600",
        marginTop: 10,
    },
    cardSubLabel: {
        fontSize: 12,
    },
    breakdown: {
        borderRadius: 8,
        padding: 12,
        marginTop: 10,
        gap: 10,
    },
    breakdownRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    breakdownRowTotal: {
        borderTopWidth: 0.5,
        paddingTop: 6,
        marginTop: 4,
    },
    breakdownLabel: {
        fontSize: 14,
    },
    breakdownValue: {
        fontSize: 14,
    },
    checkoutSection: {
        borderRadius: 12,
        borderWidth: 0.5,
        padding: 14,
    },
    checkoutEyebrow: {
        fontSize: 14,
        fontWeight: "600",
        letterSpacing: 0.6,
        marginBottom: 4,
    },
    checkoutTitle: {
        fontSize: 14,
        fontWeight: "500",
        marginBottom: 4,
    },
    checkoutDesc: {
        fontSize: 12,
        lineHeight: 18,
    },
    selectedServices: {
        borderRadius: 8,
        padding: 12,
        marginTop: 12,
    },
    ssHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    ssHeaderLabel: {
        fontSize: 12,
    },
    ssCount: {
        borderWidth: 0.5,
        borderRadius: 9,
        width: 18,
        height: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    ssCountText: {
        fontSize: 11,
        fontWeight: "500",
    },
    ssItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    ssItemIcon: {
        width: 26,
        height: 26,
        borderRadius: 7,
        alignItems: "center",
        justifyContent: "center",
    },
    ssItemIconText: {
        fontSize: 14,
    },
    ssItemInfo: {
        flex: 1,
    },
    ssItemName: {
        fontSize: 12,
        fontWeight: "500",
    },
    ssItemMeta: {
        fontSize: 11,
    },
    ssItemPriceBox: {
        alignItems: "flex-end",
    },
    ssItemPrice: {
        fontSize: 13,
        fontWeight: "500",
    },
    ssItemBase: {
        fontSize: 11,
    },
    totalDue: {
        borderRadius: 8,
        padding: 14,
        marginTop: 10,
    },
    totalDueRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6,
    },
    totalDueLabel: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    totalDueDollar: {
        fontSize: 15,
    },
    totalDueLabelText: {
        fontSize: 13,
    },
    totalDueAmount: {
        fontSize: 22,
        fontWeight: "500",
    },
    totalNote: {
        fontSize: 11,
        lineHeight: 16,
    },
    payBtn: {
        borderRadius: 14,
        paddingVertical: 15,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 12,
    },
    payBtnText: {
        color: "white",
        fontSize: 14,
        fontWeight: "500",
    },
    secureNote: {
        textAlign: "center",
        fontSize: 11,
        marginTop: 8,
    },
    detailsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginTop: 12,
    },
    detailCol: {
        width: "47%",
        borderWidth: 0.5,
        borderRadius: 10,
        padding: 12,
    },
    detailIconBox: {
        width: 30,
        height: 30,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
    },
    detailLabel: {
        fontSize: 11,
        marginBottom: 3,
    },
    detailValue: {
        fontSize: 13,
        fontWeight: "500",
    },
});
export default RenewCompliance;
