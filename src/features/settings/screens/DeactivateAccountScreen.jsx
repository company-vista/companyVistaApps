import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { deactivateAccountThunk } from '../../../store/slices/authSlice';
import { useThemeColors } from '../../../theme/colors';
import { font } from '../../../theme/typography';

function DeactivateAccountScreen() {
    const navigation = useNavigation();
    const dispatch = useAppDispatch();
    const colors = useThemeColors();
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const inputBg = colors.mode === 'dark' ? colors.inputBackground : colors.surfaceAlt;

    function handleDeactivate() {
        if (!password.trim()) {
            Toast.show({ type: 'error', text1: 'Password required', text2: 'Please enter your password to deactivate.' });
            return;
        }
        Alert.alert(
            'Deactivate Account',
            'Are you sure you want to deactivate your account? You will not be able to log in until you reactivate.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Deactivate',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        const result = await dispatch(deactivateAccountThunk(password));
                        setLoading(false);
                        if (result.meta.requestStatus === 'fulfilled') {
                            Toast.show({ type: 'success', text1: 'Account deactivated' });
                        }
                    },
                },
            ],
        );
    }

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.iconContainer, { backgroundColor: colors.buttonBackground }]}>
                    <FontAwesome name="exclamation-triangle" size={28} color={colors.danger} />
                </View>

                <Text style={[styles.heading, { color: colors.text }]}>Deactivate Account</Text>
                <Text style={[styles.description, { color: colors.muted }]}>
                    Your account will be temporarily disabled. You can reactivate it later by logging in again.
                </Text>
            </View>

            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.label, { color: colors.text }]}>Security, please enter your password</Text>

                <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
                    <FontAwesome name="lock" size={16} color={colors.muted} style={styles.inputIcon} />
                    <TextInput
                        style={[styles.input, { color: colors.text }]}
                        placeholder="Enter password"
                        placeholderTextColor={colors.inputPlaceholder}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        autoCapitalize="none"
                    />
                </View>
            </View>

            <TouchableOpacity
                style={[styles.deactivateBtn, { backgroundColor: loading ? colors.muted : colors.buttonBackground }]}
                onPress={handleDeactivate}
                disabled={loading}
                activeOpacity={0.85}
            >
                {loading ? (
                    <ActivityIndicator color={colors.buttonText} />
                ) : (
                    <>
                        <FontAwesome name="pause-circle-o" size={16} color={colors.buttonText} />
                        <Text style={[styles.deactivateBtnText, { color: colors.buttonText }]}>Deactivate Account</Text>
                    </>
                )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.85}>
                <Text style={[styles.cancelText, { color: colors.accent }]}>Cancel</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 14,
        paddingBottom: 40,
        gap: 14,
    },
    card: {
        borderWidth: 0.5,
        borderRadius: 14,
        padding: 16,
    },
    iconContainer: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginBottom: 12,
    },
    heading: {
        fontSize: font.xl,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 6,
    },
    description: {
        fontSize: font.md,
        textAlign: 'center',
        lineHeight: 20,
    },
    label: {
        fontSize: font.md,
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 0.5,
        borderRadius: 38,
        paddingHorizontal: 10,
    },
    inputIcon: {
        marginRight: 3,
        marginLeft: 10,
    },
    input: {
        flex: 1,
        fontSize: font.base,
        paddingVertical: 16,
        paddingHorizontal: 8,
    },
    deactivateBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderRadius: 38,
        paddingVertical: 13,
    },
    deactivateBtnText: {
        color: '#fff',
        fontSize: font.md,
        fontWeight: '400',
    },
    cancelText: {
        fontSize: font.md,
        fontWeight: '500',
        textAlign: 'center',
        paddingVertical: 4,
    },
});

export default DeactivateAccountScreen;
