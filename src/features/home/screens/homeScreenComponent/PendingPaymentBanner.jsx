import React from 'react';
import { Pressable, Text, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import styles from '../HomeScreen.styles';

export function PendingPaymentBanner({ colors, companyLabel, amount, onPayPress }) {
    return (<View style={[styles.pendingPaymentBanner, {
        backgroundColor: colors.mode === 'light' ? colors.cardHighlight : '#0C1622',
        borderColor: colors.mode === 'light' ? 'rgba(212, 175, 55, 0.45)' : 'rgba(212, 175, 55, 0.35)',
    }]}>
        <Text style={[styles.pendingPaymentTitle, { color: colors.mode === 'light' ? colors.text : '#FFFFFF' }]}>Payment pending</Text>
        <Text style={[styles.pendingPaymentText, { color: colors.mode === 'light' ? colors.muted : '#8E9BAE' }]}>
            Payment is still pending for {companyLabel}{amount > 0 ? ` · $${amount} due` : ''}
        </Text>
        <Pressable style={styles.pendingPaymentButton} onPress={onPayPress}>
            <FontAwesome name="credit-card" size={15} color="#0A111D" />
            <Text style={styles.pendingPaymentButtonText}>
                {amount > 0 ? `Pay $${amount} now` : 'Pay now'}
            </Text>
        </Pressable>
    </View>);
}
