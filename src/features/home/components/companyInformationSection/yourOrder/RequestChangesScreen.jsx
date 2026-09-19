import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import { useThemeColors } from '../../../../../theme/colors';
import BackButton from '../../../../../components/buttons/BackButton';
import logoR from '../../../../../assets/images/logoR.png';
import { s } from '../../../../../theme/responsive';
import { useAppSelector } from '../../../../../store/hooks';
import { requestQuoteChange } from './api/quoteApi';

const RequestChangesScreen = ({ onBackPress, companyId: companyIdProp = null, quote = null }) => {
  const colors = useThemeColors();
  const isLight = colors.mode === 'light';
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  const user = useAppSelector(s => s.auth.user);
  const token = useAppSelector(s => s.auth.token);
  const pendingOrder = useAppSelector(s => s.auth.pendingOrderData);
  const displayName = user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email?.split('@')[0] || 'You';
  const initials = displayName.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'YO';
  const [selectedCategory, setSelectedCategory] = useState('Pricing');
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([]);

  const categories = ['Pricing', 'Scope of services', 'Timeline', 'Entity type', 'Shareholder setup', 'Something else'];
  // companyId priority: prop -> quote -> pendingOrder -> user companies
  const companyId = companyIdProp || quote?.companyId || pendingOrder?.companyId || user?.companies?.[0]?._id || user?.companies?.[0]?.id || null;
  // clientId priority: pendingOrder.clientId -> user._id/id -> quote sender
  // backend requires clientId; fallback to demo id so dummy flow still works (API will return 404/403 but UI shows optimistic reply)
  const clientId =
    pendingOrder?.clientId ||
    user?._id ||
    user?.id ||
    user?.userId ||
    user?.clientId ||
    quote?.clientId ||
    user?.companies?.[0]?.clientId ||
    null;

  const handleSend = async () => {
    if (!inputText.trim()) {
      Toast.show({ type: 'error', text1: 'Please enter message' });
      return;
    }
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const messageText = inputText.trim();
    const userMsg = { id: Date.now(), type: 'user', name: displayName, text: messageText, time: `Today, ${now}` };

    // if companyId/clientId missing -> save locally, no dummy agent reply
    if (!companyId || !clientId) {
      setMessages(prev => [...prev, userMsg]);
      setInputText('');
      Toast.show({ type: 'info', text1: 'Demo mode', text2: 'Message saved locally (backend ids missing)' });
      return;
    }

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setSending(true);
    try {
      const res = await requestQuoteChange({
        companyId,
        token,
        clientId,
        text: messageText,
        reasons: selectedCategory ? [selectedCategory] : [],
      });
      if (res.isSuccess) {
        Toast.show({ type: 'success', text1: res.message || 'Message sent successfully' });
        // only show real server reply if available - no dummy fallback
        const replyText = res.data?.reply || res.data?.message || res.data?.quote?.messages?.slice(-1)?.[0]?.text;
        if (replyText) {
          const reply = { id: Date.now() + 1, type: 'agent', name: 'Anita Desai', text: replyText, time: `Today, ${now}` };
          setMessages(prev => [...prev, reply]);
        }
      } else {
        Toast.show({ type: 'error', text1: res.error || 'Failed to send message' });
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: err?.message || 'Network error' });
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <StatusBar barStyle={isLight ? 'dark-content' : 'light-content'} backgroundColor={colors.background} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <BackButton onPress={onBackPress} />
          <Image source={logoR} style={{ width: 120, height: 32 }} resizeMode="contain" />
          <TouchableOpacity style={[styles.iconButton, { backgroundColor: isLight ? '#F1F5F9' : '#161928', borderColor: colors.border }]}>
            <Ionicons name="help-circle-outline" size={22} color={isLight ? colors.muted : '#8E93A6'} />
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          <Text style={[styles.title, { color: colors.text }]}>
            Request <Text style={styles.titleItalic}>changes</Text>
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>Quote #{quote?.quoteId || 'Q-2026-0412'} · we'll revise within 2 hours</Text>

          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.muted }]}>WHAT WOULD YOU LIKE TO CHANGE?</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          <View style={styles.chipsContainer}>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, { backgroundColor: isLight ? '#FFFFFF' : '#141727', borderColor: isSelected ? '#D0A85C' : colors.border }, isSelected && { backgroundColor: isLight ? '#FFF7ED' : '#1B1B1D' }]}
                  onPress={() => setSelectedCategory(cat)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, { color: isSelected ? '#D0A85C' : colors.muted }]}>{cat}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.muted }]}>CONVERSATION</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          <View style={styles.chatContainer}>
            {messages.length === 0 ? (
              <Text style={[styles.emptyChatText, { color: colors.muted }]}>No messages yet. Select a category and send your request.</Text>
            ) : (
              messages.map((m) =>
                m.type === 'agent' ? (
                  <View key={m.id} style={styles.messageRowLeft}>
                    <View style={[styles.avatar, { backgroundColor: '#3A72EC' }]}>
                      <Text style={styles.avatarText}>AD</Text>
                    </View>
                    <View style={[styles.agentBubble, { backgroundColor: isLight ? '#FFFFFF' : '#121626', borderColor: colors.border }]}>
                      <Text style={styles.agentName}>
                        {m.name} <Text style={styles.agentRole}>· German desk</Text>
                      </Text>
                      <Text style={[styles.messageText, { color: colors.text }]}>{m.text}</Text>
                      <Text style={[styles.timeText, { color: colors.muted }]}>{m.time}</Text>
                    </View>
                  </View>
                ) : (
                  <View key={m.id} style={styles.messageRowRight}>
                    <View style={[styles.userBubble, { backgroundColor: isLight ? '#F1F5F9' : '#151722', borderColor: colors.border }]}>
                      <Text style={[styles.messageText, { color: colors.text }]}>{m.text}</Text>
                      <Text style={[styles.timeText, { color: colors.muted }]}>{m.time}</Text>
                    </View>
                    <View style={[styles.avatar, { backgroundColor: '#B89B48' }]}>
                      <Text style={styles.avatarText}>{initials}</Text>
                    </View>
                  </View>
                )
              )
            )}
          </View>
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: insets.bottom + s(12) }]}>
          <View style={styles.footerRow}>
            <View style={[styles.footerInputWrap, { backgroundColor: isLight ? '#FFFFFF' : '#121626', borderColor: colors.border }]}>
              <TextInput
                style={[styles.footerInput, { color: colors.text }]}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type text"
                placeholderTextColor={colors.muted}
                returnKeyType="send"
                onSubmitEditing={handleSend}
              />
            </View>
            <TouchableOpacity
              disabled={sending || !inputText.trim()}
              style={[styles.sendButtonSmall, { backgroundColor: colors.buttonBackground, opacity: sending || !inputText.trim() ? 0.6 : 1 }]}
              activeOpacity={0.8}
              onPress={handleSend}
            >
              {sending ? <ActivityIndicator size="small" color="#0A0C16" /> : <Ionicons name="arrow-forward" size={18} color="#0A0C16" />}
            </TouchableOpacity>
          </View>
          <Text style={[styles.disclaimerText, { color: colors.muted }]}>Quote stays valid while under revision</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0D1B' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: s(16), paddingVertical: s(12) },
  iconButton: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#161928', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#1C2035' },
  scrollContent: { paddingHorizontal: s(16), paddingBottom: s(20) },
  title: { fontSize: 26, fontWeight: '600', color: '#FFFFFF', marginTop: s(8) },
  titleItalic: { fontStyle: 'italic', color: '#D0A85C', fontWeight: '300' },
  subtitle: { fontSize: 13, color: '#7B8CB2', marginTop: s(4), marginBottom: s(20) },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginVertical: s(14) },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: '#555C77', letterSpacing: 0.8 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#1C2035', marginLeft: s(10) },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: s(10) },
  chip: { paddingVertical: s(8), paddingHorizontal: s(14), borderRadius: 20, backgroundColor: '#141727', borderWidth: 1, borderColor: '#242A42' },
  chipText: { fontSize: 13, color: '#8E93A6', fontWeight: '500' },
  chatContainer: { gap: 14 },
  messageRowLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  messageRowRight: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-end', gap: 10 },
  avatar: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: s(2) },
  avatarText: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' },
  agentBubble: { maxWidth: '76%', flexShrink: 1, backgroundColor: '#121626', borderRadius: 14, borderTopLeftRadius: 4, padding: s(12), borderWidth: 1, borderColor: '#1D233A', alignSelf: 'flex-start' },
  userBubble: { maxWidth: '76%', flexShrink: 1, backgroundColor: '#151722', borderRadius: 14, borderTopRightRadius: 4, padding: s(12), borderWidth: 1, borderColor: '#2B2621', alignSelf: 'flex-start' },
  agentName: { fontSize: 12, fontWeight: 'bold', color: '#D0A85C', marginBottom: s(4) },
  agentRole: { fontWeight: 'normal', color: '#7B8CB2' },
  messageText: { fontSize: 13, color: '#E0E6ED', lineHeight: 18 },
  timeText: { fontSize: 10, color: '#4B536B', marginTop: s(6) },
  footer: { paddingHorizontal: s(16), paddingTop: s(24), paddingBottom: s(16), backgroundColor: '#0B0D1B', borderTopWidth: 1, borderTopColor: 'transparent' },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, width: '100%' },
  footerInputWrap: { flex: 1, backgroundColor: '#121626', borderRadius: 12, borderWidth: 1, borderColor: '#1D233A', paddingHorizontal: s(12), height: 44, justifyContent: 'center' },
  footerInput: { flex: 1, color: '#FFFFFF', fontSize: 13, padding: s(0) },
  sendButtonSmall: { backgroundColor: '#DDB763', borderRadius: 999, justifyContent: 'center', alignItems: 'center', height: 44, width: 44 },
  emptyChatText: { fontSize: 13, textAlign: 'center', marginVertical: s(20), lineHeight: 18 },
  disclaimerText: { color: '#4B536B', fontSize: 11, marginTop: s(8), textAlign: 'center', width: '100%' },
});

export default RequestChangesScreen;
