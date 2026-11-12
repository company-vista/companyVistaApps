import { font } from '../../../../theme/typography';
import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Toast from 'react-native-toast-message';
import { useThemeColors, themePalette, makeThemeStyles } from '../../../../theme/colors';
import { useAppSelector } from '../../../../store/hooks';
import StripeOneTimePayment from '../../../../stripe_pament_section/StripeOneTimePayment';
import { createServiceRequest } from './api/serviceRequestsApi';


export const ServiceCard = ({ title, price, amount, companyId, description, service, note = '', onRequestQuote, onPayNow, containerStyle, }) => {
    const colors = useThemeColors();
    const isDark = colors.mode === 'dark';
    const token = useAppSelector(state => state.auth.token);
    const [submitting, setSubmitting] = useState(false);

    //***********INNER STYLE***************** */
    const sendButtonStyle = { backgroundColor: isDark ? themePalette.hex_1e293b : themePalette.hex_f1f5f9, borderColor: colors.border }
    const sendButtonTextStyle = { color: isDark ? themePalette.hex_f1f5f9 : colors.text }
    const StripeOneTimePaymentStyle = { backgroundColor: isDark ? themePalette.hex_ff9500 : colors.buttonBackground }
    const payNowButtonTextStyle = { color: isDark ? themePalette.hex_000000 : colors.buttonText }
    //***********INNER STYLE***************** */


    //*************HANDLE REQUEST QUOTE***************** */
    const handleRequestQuote = async () => {
        if (onRequestQuote) {
            onRequestQuote();
            return;
        }
        setSubmitting(true);
        try {
            const result = await createServiceRequest({
                companyId,
                serviceSlug: service?.slug ?? '',
                note,
                token,
            });
            if (result.isSuccess) {
                Toast.show({
                    type: 'success',
                    text1: 'Request Sent',
                    text2: 'Our team will contact you soon.',
                });
            }
            else {
                Toast.show({
                    type: 'error',
                    text1: 'Request Failed',
                    text2: result.error,
                });
            }
        }
        catch {
            Toast.show({
                type: 'error',
                text1: 'Request Failed',
                text2: 'Something went wrong. Please try again.',
            });
        }
        finally {
            setSubmitting(false);
        }
    };

    return (<View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, containerStyle]}>
        <View style={styles.headerRow}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <Text style={styles.price}>{price}</Text>
        </View>

        <Text style={[styles.description, { color: colors.muted }]}>{description}</Text>

        <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.outlineButton, sendButtonStyle]} activeOpacity={0.7} onPress={handleRequestQuote} disabled={submitting}>
                <Text style={[styles.outlineButtonText, sendButtonTextStyle]}>{submitting ? 'Sending...' : 'Send Request'}</Text>
                <FontAwesome name="send" size={12} color={isDark ? themePalette.hex_f1f5f9 : colors.text} />
            </TouchableOpacity>

            {typeof amount === 'number' ? (<StripeOneTimePayment invoice={{
                companyId: companyId ?? undefined,
                amount,
                currency: 'USD',
                serviceSlug: service?.slug ?? '',
            }} 
            paymentType="service_purchase" label="Pay Now" buttonStyle={[
                styles.primaryButton,
                StripeOneTimePaymentStyle,
            ]} />) : (<TouchableOpacity style={[styles.primaryButton, StripeOneTimePaymentStyle]} activeOpacity={0.8} onPress={onPayNow}>
                <Text style={[styles.primaryButtonText, payNowButtonTextStyle]}>Pay Now</Text>
            </TouchableOpacity>)}
        </View>
    </View>);
};



const styles = makeThemeStyles(() => StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 18,
        borderWidth: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 12,
    },
    title: {
        fontSize: font.lg,
        fontWeight: '500',
        flex: 1,
        marginRight: 8,
    },
    price: {
        fontSize: font.xl,
        fontWeight: '500',
        color: themePalette.hex_ffa500,
    },
    description: {
        fontSize: font.bodySmall,
        lineHeight: 20,
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 24,
    },
    outlineButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 24,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 6,
    },
    outlineButtonText: {
        fontSize: font.base,
        fontWeight: '500',
    },
    primaryButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButtonText: {
        fontSize: font.base,
        fontWeight: '500',
    },
}));
