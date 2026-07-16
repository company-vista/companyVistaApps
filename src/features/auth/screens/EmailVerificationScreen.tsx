import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Check, Mail, Lock, ShieldCheck, Key, Clock, Edit2 } from 'lucide-react-native';
import { font } from '../../../theme/typography';

type EmailVerificationScreenProps = {
  email: string;
  onEditPress: () => void;
};

export default function EmailVerificationScreen({ email, onEditPress }: EmailVerificationScreenProps) {
  const [countdown, setCountdown] = useState(27);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.card}>
        <Text style={styles.title}>Check Your Inbox</Text>
        <Text style={styles.subtitle}>We are waiting for your email verification</Text>

        <View style={styles.stepContainer}>
          <View style={styles.stepItem}>
            <View style={[styles.stepIcon, styles.stepDone]}>
              <Check size={14} color="#FFF" />
            </View>
            <Text style={styles.stepTextActive}>Personal</Text>
          </View>
          <View style={styles.stepLineActive} />

          <View style={styles.stepItem}>
            <View style={[styles.stepIcon, styles.stepActive]}>
              <Mail size={14} color="#FFF" />
            </View>
            <Text style={styles.stepTextActive}>Verify Email</Text>
          </View>
          <View style={styles.stepLineInactive} />

          <View style={styles.stepItem}>
            <View style={[styles.stepIcon, styles.stepInactive]}>
              <Lock size={14} color="#A1A1AA" />
            </View>
            <Text style={styles.stepTextInactive}>Set Password</Text>
          </View>
        </View>

        <View style={styles.illustrationBox}>
          <View style={styles.envelopeCircle}>
            <Text style={styles.atSymbol}>@</Text>
          </View>
        </View>

        <Text style={styles.infoText}>
          We sent a verification link to the email below. Open your inbox, click the link, and this page will update automatically.
        </Text>

        <View style={styles.emailContainer}>
          <TextInput
            style={styles.emailInput}
            value={email}
            editable={false}
          />
          <TouchableOpacity style={styles.editIconBtn} onPress={onEditPress}>
            <Edit2 size={16} color="#71717A" />
          </TouchableOpacity>
        </View>

        <Text style={styles.timerText}>
          Resend will be available in 0:{countdown < 10 ? `0${countdown}` : countdown}.
        </Text>

        <TouchableOpacity
          style={[styles.resendBtn, countdown > 0 && styles.resendBtnDisabled]}
          disabled={countdown > 0}
        >
          <Text style={styles.resendBtnText}>→ Resend Verification Email</Text>
        </TouchableOpacity>

        <Text style={styles.spamNotice}>
          If nothing appears, check your spam folder or add the sender to your safe list before requesting another email.
        </Text>

        <View style={styles.wrongEmailRow}>
          <Text style={styles.grayText}>Wrong email? </Text>
          <TouchableOpacity onPress={onEditPress}>
            <Text style={styles.linkText}>Edit details</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />
          <View style={styles.footerRow}>
            <View style={styles.footerItem}>
              <ShieldCheck size={14} color="#14b8a6" />
              <Text style={styles.footerText}>SSL Secured</Text>
            </View>
            <View style={styles.footerItem}>
              <Key size={14} color="#14b8a6" />
              <Text style={styles.footerText}>2FA Available</Text>
            </View>
            <View style={styles.footerItem}>
              <Clock size={14} color="#14b8a6" />
              <Text style={styles.footerText}>24/7 Support</Text>
            </View>
          </View>

        <Text style={styles.copyrightText}>
          © 2026 Company Vista Inc - Privacy - Terms
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 2,
    justifyContent: 'center',
    flexGrow: 1,
  },
  card: {
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: font.title,
    fontWeight: '500',
    color: '#f8fafc',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: font.lg,
    color: '#94a3b8',
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
  stepInactive: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  stepTextActive: {
    fontSize: font.sm,
    fontWeight: '600',
    color: '#f8fafc',
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
  illustrationBox: {
    width: '100%',
    height: 60,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  envelopeCircle: {
    width: 42,
    height: 42,
    borderRadius: 25,
    backgroundColor: '#14b8a6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  atSymbol: {
    fontSize: font.display,
    color: '#042f2e',
    fontWeight: '600',
  },
  infoText: {
    fontSize: font.md,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  emailContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 20,
  },
  emailInput: {
    flex: 1,
    fontSize: font.lg,
    color: '#f8fafc',
    fontWeight: '500',
  },
  editIconBtn: {
    padding: 4,
  },
  timerText: {
    fontSize: font.md,
    color: '#94a3b8',
    marginBottom: 10,
  },
  resendBtn: {
    width: '100%',
    height: 46,
    backgroundColor: '#14b8a6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 16,
  },
  resendBtnDisabled: {
    backgroundColor: '#1e3a5c',
  },
  resendBtnText: {
    color: '#042f2e',
    fontSize: font.lg,
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
    color: '#f8fafc',
    marginLeft: 4,
    fontWeight: '500',
  },
  copyrightText: {
    fontSize: font.sm,
    color: '#64748b',
    textAlign: 'center',
  },
});
