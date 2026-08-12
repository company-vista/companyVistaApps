import React, { useState, useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, } from 'react-native';
import { Check, Mail, Lock, ShieldCheck, Key, Clock } from 'lucide-react-native';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { font } from '../../../theme/typography';
import { API_BASE_URL } from '../../../config/api';
export default function EmailVerificationScreen({ email, signupToken, signupClientId, onEditPress, onResend, onOtpVerified, isResending, }) {
    const [countdown, setCountdown] = useState(27);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [verifying, setVerifying] = useState(false);
    const inputs = useRef([]);
    useEffect(() => {
        if (countdown <= 0)
            return;
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown]);
    function handleOtpChange(text, index) {
        if (text.length > 1) {
            text = text.slice(-1);
        }
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);
        if (text && index < 5) {
            inputs.current[index + 1]?.focus();
        }
    }
    function handleKeyPress(e, index) {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputs.current[index - 1]?.focus();
            const newOtp = [...otp];
            newOtp[index - 1] = '';
            setOtp(newOtp);
        }
    }
    async function handleVerifyOtp() {
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            Toast.show({ type: 'error', text1: 'Please enter 6-digit OTP' });
            return;
        }
        setVerifying(true);
        try {
            if (signupToken && signupClientId) {
                await axios.get(`${API_BASE_URL}/api/verify-email/${signupToken}/${signupClientId}`);
            }
            const response = await axios.post(`${API_BASE_URL}/api/client/auth/otpverify-email`, {
                email,
                otp: otpString,
            });
            const token = response.data?.token;
            const clientId = response.data?.clientId || response.data?.client_id || '';
            if (token) {
                Toast.show({ type: 'success', text1: 'Verified', text2: 'Email otp verified successfully' });
                onOtpVerified({ token, clientId });
            }
            else {
                Toast.show({ type: 'error', text1: 'Verification failed' });
            }
        }
        catch (error) {
            const message = error?.response?.data?.message || 'Invalid OTP. Please try again.';
            Toast.show({ type: 'error', text1: 'Error', text2: message });
        }
        finally {
            setVerifying(false);
        }
    }
    return (<ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.card}>
        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to
        </Text>
        <Text style={styles.emailHighlight}>{email}</Text>

        <View style={styles.stepContainer}>
          <View style={styles.stepItem}>
            <View style={[styles.stepIcon, styles.stepDone]}>
              <Check size={14} color="#FFF"/>
            </View>
            <Text style={styles.stepTextActive}>Personal</Text>
          </View>
          <View style={styles.stepLineActive}/>

          <View style={styles.stepItem}>
            <View style={[styles.stepIcon, styles.stepActive]}>
              <Mail size={14} color="#FFF"/>
            </View>
            <Text style={styles.stepTextActive}>Verify Email</Text>
          </View>
          <View style={styles.stepLineInactive}/>

          <View style={styles.stepItem}>
            <View style={[styles.stepIcon, styles.stepInactive]}>
              <Lock size={14} color="#A1A1AA"/>
            </View>
            <Text style={styles.stepTextInactive}>Set Password</Text>
          </View>
        </View>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (<TextInput key={index} ref={ref => { inputs.current[index] = ref; }} style={[styles.otpInput, digit ? styles.otpInputFilled : null]} keyboardType="number-pad" maxLength={1} onChangeText={text => handleOtpChange(text, index)} onKeyPress={e => handleKeyPress(e, index)} value={digit} autoFocus={index === 0}/>))}
        </View>

        <TouchableOpacity style={[styles.verifyBtn, verifying && styles.verifyBtnDisabled]} disabled={verifying} onPress={handleVerifyOtp}>
          {verifying ? (<ActivityIndicator color="#042f2e" size="small"/>) : (<Text style={styles.verifyBtnText}>Verify OTP</Text>)}
        </TouchableOpacity>

        <Text style={styles.timerText}>
          Resend will be available in 0:{countdown < 10 ? `0${countdown}` : countdown}.
        </Text>

        <TouchableOpacity style={[styles.resendBtn, (countdown > 0 || isResending) && styles.resendBtnDisabled]} disabled={countdown > 0 || isResending} onPress={() => {
            onResend();
            setCountdown(27);
        }}>
          <Text style={styles.resendBtnText}>{isResending ? 'Sending...' : 'Resend Verification Email'}</Text>
        </TouchableOpacity>

        <Text style={styles.spamNotice}>
          Check your spam folder if you don't see the email.
        </Text>

        <View style={styles.wrongEmailRow}>
          <Text style={styles.grayText}>Wrong email? </Text>
          <TouchableOpacity onPress={onEditPress}>
            <Text style={styles.linkText}>Edit details</Text>
          </TouchableOpacity>
        </View>

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
        padding: 2,
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
        textAlign: 'center',
        marginBottom: 24,
    },
    stepContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginBottom: 28,
    },
    stepItem: {
        alignItems: 'center',
        width: 80,
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
    stepInactive: {
        backgroundColor: '#1e293b',
        borderWidth: 1,
        borderColor: '#334155',
    },
    stepTextActive: {
        fontSize: font.sm,
        fontWeight: '600',
        color: '#0f172a',
    },
    stepTextInactive: {
        fontSize: font.sm,
        color: '#64748b',
    },
    stepLineActive: {
        flex: 1.2,
        height: 2,
        backgroundColor: '#14b8a6',
        marginBottom: 16,
    },
    stepLineInactive: {
        flex: 1.2,
        height: 2,
        backgroundColor: '#334155',
        marginBottom: 16,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 24,
        width: '100%',
    },
    otpInput: {
        width: 46,
        height: 54,
        borderWidth: 1,
        borderColor: '#334155',
        borderRadius: 12,
        backgroundColor: '#111827',
        color: '#f8fafc',
        fontSize: font.heading,
        fontWeight: '700',
        textAlign: 'center',
    },
    otpInputFilled: {
        borderColor: '#14b8a6',
        backgroundColor: '#0f2e2a',
    },
    verifyBtn: {
        width: '100%',
        height: 48,
        backgroundColor: '#14b8a6',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    verifyBtnDisabled: {
        opacity: 0.7,
    },
    verifyBtnText: {
        color: '#042f2e',
        fontSize: font.lg,
        fontWeight: '700',
    },
    timerText: {
        fontSize: font.md,
        color: '#94a3b8',
        marginBottom: 10,
    },
    resendBtn: {
        width: '100%',
        height: 46,
        backgroundColor: '#1e293b',
        borderWidth: 1,
        borderColor: '#334155',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    resendBtnDisabled: {
        opacity: 0.5,
    },
    resendBtnText: {
        color: '#94a3b8',
        fontSize: font.md,
        fontWeight: '600',
    },
    spamNotice: {
        fontSize: font.sm,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 16,
        paddingHorizontal: 10,
        marginBottom: 16,
    },
    wrongEmailRow: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    grayText: {
        fontSize: font.md,
        color: '#94a3b8',
    },
    linkText: {
        fontSize: font.md,
        color: '#14b8a6',
        fontWeight: '600',
        textDecorationLine: 'underline',
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
