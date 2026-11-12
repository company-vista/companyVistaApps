import React from 'react';
import { Pressable, Text, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import styles from '../HomeScreen.styles';
import { themePalette } from '../../../../theme/colors';

export function PendingPaymentBanner({ colors, companyLabel, amount, onPayPress }) {
    return (<View style={[styles.pendingPaymentBanner, {
        backgroundColor: colors.mode === 'light' ? colors.cardHighlight : themePalette.hex_0c1622,
        borderColor: colors.mode === 'light' ? themePalette.rgba_212_175_55_0_45 : themePalette.rgba_212_175_55_0_35,
    }]}>
        <Text style={[styles.pendingPaymentTitle, { color: colors.mode === 'light' ? colors.text : themePalette.hex_ffffff }]}>Payment pending</Text>
        <Text style={[styles.pendingPaymentText, { color: colors.mode === 'light' ? colors.muted : themePalette.hex_8e9bae }]}>
            Payment is still pending for {companyLabel}{amount > 0 ? ` · $${amount} due` : ''}
        </Text>
        <Pressable style={styles.pendingPaymentButton} onPress={onPayPress}>
            <FontAwesome name="credit-card" size={15} color={themePalette.hex_0a111d} />
            <Text style={styles.pendingPaymentButtonText}>
                {amount > 0 ? `Pay $${amount} now` : 'Pay now'}
            </Text>
        </Pressable>
    </View>);
}
