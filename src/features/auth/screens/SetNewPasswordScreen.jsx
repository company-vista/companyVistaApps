import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import { Check, Mail, Lock, ShieldCheck, Key, Clock } from 'lucide-react-native';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { font } from '../../../theme/typography';
import { API_BASE_URL } from '../../../config/api';
export default function SetNewPasswordScreen({ email, clientId, token, onPasswordSet, onBackPress, }) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    function validate() {
        let valid = true;
        setPasswordError('');
        setConfirmPasswordError('');
        if (!password) {
            setPasswordError('Password is required');
            valid = false;
        }
        else if (password.length < 6) {
            setPasswordError('Password must be at least 8 characters');
            valid = false;
        }
        if (!confirmPassword) {
            setConfirmPasswordError('Please confirm your password');
            valid = false;
        }
        else if (password !== confirmPassword) {
            setConfirmPasswordError('Passwords do not match');
            valid = false;
        }
        return valid;
    }
    async function handleSetPassword() {
        if (!validate())
            return;
        setLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/api/signup/set-password`, { clientId, password }, { headers: { Authorization: `Bearer ${token}` } });
            Toast.show({ type: 'success', text1: 'Password set', text2: 'Password set successfully!' });
            onPasswordSet();
        }
        catch (error) {
            const message = error?.response?.data?.message || 'Failed to set password.';
            Toast.show({ type: 'error', text1: 'Error', text2: message });
        }
        finally {
            setLoading(false);
        }
    }
    return (<ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.card}>
        <Text style={styles.title}>Set New Password</Text>
        <Text style={styles.subtitle}>
          Create a strong password for{'\n'}
          <Text style={styles.emailHighlight}>{email}</Text>
        </Text>

        <View style={styles.stepContainer}>
          <View style={styles.stepItem}>
            <View style={[styles.stepIcon, styles.stepDone]}>
              <Check size={14} color="#FFF"/>
            </View>
            <Text style={styles.stepTextDone}>Personal</Text>
          </View>
          <View style={styles.stepLineDone}/>

          <View style={styles.stepItem}>
            <View style={[styles.stepIcon, styles.stepDone]}>
              <Mail size={14} color="#FFF"/>
            </View>
            <Text style={styles.stepTextDone}>Verify Email</Text>
          </View>
          <View style={styles.stepLineDone}/>

          <View style={styles.stepItem}>
            <View style={[styles.stepIcon, styles.stepActive]}>
              <Lock size={14} color="#FFF"/>
            </View>
            <Text style={styles.stepTextActive}>Set Password</Text>
          </View>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Password</Text>
          <View style={[styles.inputWrap, passwordError ? styles.inputError : null]}>
            <Lock size={16} color="#71717A"/>
            <TextInput style={styles.input} placeholder="Enter password" placeholderTextColor="#71717A" secureTextEntry={!showPassword} autoCapitalize="none" value={password} onChangeText={text => {
            setPassword(text);
            setPasswordError('');
        }}/>
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.toggleText}>{showPassword ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

          <Text style={[styles.inputLabel, { marginTop: 16 }]}>Confirm Password</Text>
          <View style={[styles.inputWrap, confirmPasswordError ? styles.inputError : null]}>
            <Lock size={16} color="#71717A"/>
            <TextInput style={styles.input} placeholder="Re-enter password" placeholderTextColor="#71717A" secureTextEntry={!showConfirmPassword} autoCapitalize="none" value={confirmPassword} onChangeText={text => {
            setConfirmPassword(text);
            setConfirmPasswordError('');
        }}/>
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Text style={styles.toggleText}>{showConfirmPassword ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>
          {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
        </View>

        <TouchableOpacity style={[styles.setBtn, loading && styles.setBtnDisabled]} disabled={loading} onPress={handleSetPassword}>
          {loading ? (<ActivityIndicator color="#042f2e" size="small"/>) : (<Text style={styles.setBtnText}>Set Password & Continue</Text>)}
        </TouchableOpacity>

        <TouchableOpacity onPress={onBackPress}>
          <Text style={styles.backLink}>
            Back to{' '}
            <Text style={styles.backLinkBold}>Login</Text>
          </Text>
        </TouchableOpacity>

        <View style={styles.divider}/>
        <View style={styles.footerRow}>
          <View style={styles.footerItem}>
            <ShieldCheck size={14} color="#14b8a6"/>
            <Text style={styles.footerText}>SSL Secured</Text>
          </View>
          <View style={styles.footerItem}>
            <Key size={14} color="#14b8a6"/>
            <Text style={styles.footerText}>2FA Available</Text>
          </View>
          <View style={styles.footerItem}>
            <Clock size={14} color="#14b8a6"/>
            <Text style={styles.footerText}>24/7 Support</Text>
          </View>
        </View>

        <Text style={styles.copyrightText}>
          © 2026 Company Vista Inc - Privacy - Terms
        </Text>
      </View>
    </ScrollView>);
}
const styles = StyleSheet.create({
    scrollContent: {
        padding: 2,
        justifyContent: 'center',
        flexGrow: 1,
    },
    card: {
        borderRadius: 16,
        padding: 8,
        alignItems: 'center',
        width: '100%',
    },
    title: {
        fontSize: font.title,
        fontWeight: '500',
        color: '#0f172a',
        textAlign: 'center',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: font.lg,
        color: '#576375',
        textAlign: 'center',
        marginBottom: 4,
    },
    emailHighlight: {
        fontSize: font.lg,
        color: '#0f172a',
        fontWeight: '700',
    },
    stepContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginBottom: 28,
        marginTop: 20,
    },
    stepItem: {
        alignItems: 'center',
        width: 75,
    },
    stepIcon: {
        width: 26,
        height: 26,
        borderRadius: 13,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    stepDone: {
        backgroundColor: '#14b8a6',
    },
    stepActive: {
        backgroundColor: '#14b8a6',
    },
    stepTextDone: {
        fontSize: font.sm,
        fontWeight: '600',
        color: '#0f172a',
    },
    stepTextActive: {
        fontSize: font.sm,
        fontWeight: '600',
        color: '#0f172a',
    },
    stepLineDone: {
        flex: 1.2,
        height: 2,
        backgroundColor: '#14b8a6',
        marginBottom: 16,
    },
    inputSection: {
        width: '100%',
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: font.sm,
        fontWeight: '600',
        color: '#94a3b8',
        marginBottom: 6,
    },
    inputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 48,
        borderWidth: 1,
        borderColor: '#334155',
        borderRadius: 10,
        backgroundColor: '#111827',
        paddingHorizontal: 12,
        gap: 10,
    },
    inputError: {
        borderColor: '#f87171',
    },
    input: {
        flex: 1,
        fontSize: font.md,
        color: '#f8fafc',
        padding: 0,
    },
    toggleText: {
        fontSize: font.sm,
        color: '#14b8a6',
        fontWeight: '600',
    },
    errorText: {
        color: '#fca5a5',
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
    },
    setBtn: {
        width: '100%',
        height: 48,
        backgroundColor: '#14b8a6',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    setBtnDisabled: {
        opacity: 0.7,
    },
    setBtnText: {
        color: '#042f2e',
        fontSize: font.lg,
        fontWeight: '700',
    },
    backLink: {
        fontSize: font.md,
        color: '#94a3b8',
        marginBottom: 20,
    },
    backLinkBold: {
        color: '#14b8a6',
        fontWeight: '700',
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: '#334155',
        marginBottom: 16,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 16,
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footerText: {
        fontSize: font.sm,
        color: '#0f172a',
        marginLeft: 4,
        fontWeight: '500',
    },
    copyrightText: {
        fontSize: font.sm,
        color: '#64748b',
        textAlign: 'center',
    },
});
