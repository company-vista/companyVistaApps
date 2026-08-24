import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { useAppSelector } from '../../../store/hooks';
import { API_BASE_URL } from '../../../config/api';
import { useThemeColors } from '../../../theme/colors';
import { font } from '../../../theme/typography';

function ChangePasswordScreen() {
    const navigation = useNavigation();
    const colors = useThemeColors();
    const token = useAppSelector(state => state.auth.token);
    const email = useAppSelector(state => state.auth.user?.email);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [secureCurrent, setSecureCurrent] = useState(true);
    const [secureNew, setSecureNew] = useState(true);
    const [secureConfirm, setSecureConfirm] = useState(true);

    const inputBg = colors.mode === 'dark' ? colors.inputBackground : colors.surfaceAlt;

    async function handleChangePassword() {
        if (!currentPassword.trim()) {
            Toast.show({ type: 'error', text1: 'Current password is required' });
            return;
        }
        if (!newPassword.trim()) {
            Toast.show({ type: 'error', text1: 'New password is required' });
            return;
        }
        if (newPassword.length < 6) {
            Toast.show({ type: 'error', text1: 'New password must be at least 6 characters' });
            return;
        }
        if (newPassword !== confirmPassword) {
            Toast.show({ type: 'error', text1: 'Passwords do not match' });
            return;
        }
        setLoading(true);
        try {
            await fetch(`${API_BASE_URL}/api/client/auth/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                    'x-auth-token': token,
                },
                body: JSON.stringify({ email, currentPassword, newPassword }),
            });
            Toast.show({ type: 'success', text1: 'Password changed success' });
            navigation.goBack();
        } catch (err) {
            Toast.show({ type: 'error', text1: err?.message || 'Failed to change password' });
        } finally {
            setLoading(false);
        }
    }

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
            <View style={[styles.card, { backgroundColor: colors.cardElevated, borderColor: colors.border }]}>
                <View style={[styles.iconContainer, { backgroundColor: colors.cardElevated }]}>
                    <FontAwesome name="lock" size={28} color={colors.accent} />
                </View>
                <Text style={[styles.heading, { color: colors.text }]}>Change Password</Text>
                <Text style={[styles.description, { color: colors.muted }]}>
                    Enter your current password and set a new one.
                </Text>
            </View>

            <View style={[styles.card, { backgroundColor: colors.cardElevated, borderColor: colors.border }]}>
                <Text style={[styles.label, { color: colors.text }]}>Current Password</Text>
                <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
                    <FontAwesome name="lock" size={16} color={colors.muted} style={styles.inputIcon} />
                    <TextInput
                        style={[styles.input, { color: colors.inputText }]}
                        placeholder="Enter current password"
                        placeholderTextColor={colors.inputPlaceholder}
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        secureTextEntry={secureCurrent}
                        autoCapitalize="none"
                    />
                    <TouchableOpacity onPress={() => setSecureCurrent(!secureCurrent)}>
                        <FontAwesome name={secureCurrent ? 'eye-slash' : 'eye'} size={16} color={colors.muted} />
                    </TouchableOpacity>
                </View>

                <Text style={[styles.label, { color: colors.text, marginTop: 16 }]}>New Password</Text>
                <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
                    <FontAwesome name="lock" size={16} color={colors.muted} style={styles.inputIcon} />
                    <TextInput
                        style={[styles.input, { color: colors.inputText }]}
                        placeholder="Enter new password"
                        placeholderTextColor={colors.inputPlaceholder}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry={secureNew}
                        autoCapitalize="none"
                    />
                    <TouchableOpacity onPress={() => setSecureNew(!secureNew)}>
                        <FontAwesome name={secureNew ? 'eye-slash' : 'eye'} size={16} color={colors.muted} />
                    </TouchableOpacity>
                </View>

                <Text style={[styles.label, { color: colors.text, marginTop: 16 }]}>Confirm New Password</Text>
                <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
                    <FontAwesome name="lock" size={16} color={colors.muted} style={styles.inputIcon} />
                    <TextInput
                        style={[styles.input, { color: colors.inputText }]}
                        placeholder="Re-enter new password"
                        placeholderTextColor={colors.inputPlaceholder}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={secureConfirm}
                        autoCapitalize="none"
                    />
                    <TouchableOpacity onPress={() => setSecureConfirm(!secureConfirm)}>
                        <FontAwesome name={secureConfirm ? 'eye-slash' : 'eye'} size={16} color={colors.muted} />
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: loading ? colors.muted : colors.buttonBackground }]}
                onPress={handleChangePassword}
                disabled={loading}
                activeOpacity={0.85}
            >
                {loading ? (
                    <ActivityIndicator color={colors.buttonText} />
                ) : (
                    <>
                        <FontAwesome name="check" size={16} color={colors.buttonText} />
                        <Text style={[styles.submitBtnText, { color: colors.buttonText }]}>Update Password</Text>
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
    submitBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderRadius: 38,
        paddingVertical: 13,
    },
    submitBtnText: {
        // color: '#fff',
        fontSize: font.md,
        fontWeight: '500',
    },
    cancelText: {
        fontSize: font.md,
        fontWeight: '500',
        textAlign: 'center',
        paddingVertical: 4,
    },
});

export default ChangePasswordScreen;
